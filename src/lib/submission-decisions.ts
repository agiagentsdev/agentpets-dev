import { eq } from "drizzle-orm";
import { Resend } from "resend";

import {
  AGGREGATE_KEYS,
  invalidateAggregates,
  invalidatePetCaches,
} from "@/lib/db/cached-aggregates";
import type { SubmittedPet } from "@/lib/db/schema";
import * as schema from "@/lib/db/schema";
import { renderSubmissionApprovedEmail } from "@/lib/email-templates/submission-approved";
import { renderSubmissionRejectedEmail } from "@/lib/email-templates/submission-rejected";

export type SubmissionAdminAction = "approve" | "reject" | "edit" | "pending";

export type SubmissionActionInput = {
  action: SubmissionAdminAction;
  reason?: string | null;
  displayName?: string;
  description?: string;
  slug?: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string[] | string | null;
  seoIntro?: string | null;
  seoFaq?: Array<{ question?: string; answer?: string }> | string | null;
};

export type SubmissionActionActor = "admin" | "auto-review";

export type SubmissionActionResult =
  | { ok: true; row: SubmittedPet }
  | {
      ok: false;
      status: number;
      body: { error: string; message?: string };
    };

type SubmissionActionDb = Awaited<typeof import("@/lib/db/client")>["db"];

export async function applySubmissionAction(
  id: string,
  body: SubmissionActionInput,
  options: {
    actor?: SubmissionActionActor;
    db?: SubmissionActionDb;
    skipSideEffects?: boolean;
    skipNotifications?: boolean;
  } = {},
): Promise<SubmissionActionResult> {
  const actor = options.actor ?? "admin";
  const db = options.db ?? (await import("@/lib/db/client")).db;
  const now = new Date();
  const editPatch: Record<string, unknown> = {};

  if (typeof body.displayName === "string" && body.displayName.trim()) {
    editPatch.displayName = body.displayName.trim().slice(0, 60);
  }
  if (typeof body.description === "string" && body.description.trim()) {
    editPatch.description = body.description.trim().slice(0, 280);
  }
  if (typeof body.slug === "string" && body.slug.trim()) {
    const newSlug = normalizeSlug(body.slug);
    if (newSlug) {
      const existing = await db.query.submittedPets.findFirst({
        where: eq(schema.submittedPets.slug, newSlug),
      });
      if (existing && existing.id !== id) {
        return {
          ok: false,
          status: 409,
          body: {
            error: "slug_taken",
            message: `"${newSlug}" already exists.`,
          },
        };
      }
      editPatch.slug = newSlug;
    }
  }

  const seoPatch = normalizeSeoPatch(body, now);
  if (!seoPatch.ok) {
    return {
      ok: false,
      status: 400,
      body: { error: seoPatch.error, message: seoPatch.message },
    };
  }
  Object.assign(editPatch, seoPatch.patch);

  const statusPatch =
    body.action === "approve"
      ? {
          status: "approved" as const,
          approvedAt: now,
          rejectedAt: null,
          rejectionReason: null,
        }
      : body.action === "reject"
        ? {
            status: "rejected" as const,
            rejectedAt: now,
            approvedAt: null,
            rejectionReason: body.reason?.trim() || null,
          }
        : body.action === "pending"
          ? {
              status: "pending" as const,
              approvedAt: null,
              rejectedAt: null,
              rejectionReason: null,
            }
          : {};

  const update = { ...editPatch, ...statusPatch };
  if (Object.keys(update).length === 0) {
    return { ok: false, status: 400, body: { error: "nothing_to_update" } };
  }

  const current = await db.query.submittedPets.findFirst({
    columns: {
      slug: true,
      status: true,
    },
    where: eq(schema.submittedPets.id, id),
  });
  if (!current) {
    return { ok: false, status: 404, body: { error: "not_found" } };
  }

  const [updated] = await db
    .update(schema.submittedPets)
    .set(update)
    .where(eq(schema.submittedPets.id, id))
    .returning();

  if (!updated) {
    return { ok: false, status: 404, body: { error: "not_found" } };
  }

  let row = updated;
  if (body.action === "approve" && !options.skipSideEffects) {
    row = await runPostApprovalEffects(row, actor, db);
  }

  const skipNotifications =
    options.skipNotifications ?? options.skipSideEffects ?? false;
  if (
    !skipNotifications &&
    (body.action === "approve" || body.action === "reject")
  ) {
    await notifySubmissionOwner(row);
  }

  // Any status flip changes the set of approved pets, so the cached
  // facets / counts / metrics summary become stale.
  if (
    body.action === "approve" ||
    body.action === "reject" ||
    body.action === "pending"
  ) {
    await invalidateAggregates(
      AGGREGATE_KEYS.facets,
      AGGREGATE_KEYS.approvedCount,
      AGGREGATE_KEYS.metricsSummary,
      AGGREGATE_KEYS.batches,
      AGGREGATE_KEYS.variantIndex,
    );
    await invalidatePetCaches(current.slug, row.slug);
  } else if (current.status === "approved" && body.action === "edit") {
    const aggregateKeys: string[] = [AGGREGATE_KEYS.variantIndex];
    if (current.slug !== row.slug) {
      aggregateKeys.push(AGGREGATE_KEYS.metricsSummary);
    }
    await invalidateAggregates(...aggregateKeys);
    await invalidatePetCaches(current.slug, row.slug);
  }

  return { ok: true, row };
}

async function runPostApprovalEffects(
  row: SubmittedPet,
  actor: SubmissionActionActor,
  db: SubmissionActionDb,
): Promise<SubmittedPet> {
  const needsTagging =
    ((row.tags as string[]) ?? []).length === 0 ||
    ((row.vibes as string[]) ?? []).length === 0;
  if (needsTagging) {
    const { classifyPet } = await import("@/lib/auto-tag");
    const cls = await classifyPet(row.displayName, row.description);
    if (cls) {
      const [tagged] = await db
        .update(schema.submittedPets)
        .set({ kind: cls.kind, vibes: cls.vibes, tags: cls.tags })
        .where(eq(schema.submittedPets.id, row.id))
        .returning();
      if (tagged) row = tagged;
    }
  }

  const { refreshSimilarityFor } = await import("@/lib/similarity");
  void refreshSimilarityFor(row.id).catch((err) => {
    console.warn(`[${actor}] similarity refresh failed:`, err);
  });

  if (!row.dominantColor) {
    void (async () => {
      try {
        const { classifyColorFamily, extractDominantColor } = await import(
          "@/lib/color-extract"
        );
        const dominantColor = await extractDominantColor(row.spritesheetUrl);
        if (!dominantColor) return;
        await db
          .update(schema.submittedPets)
          .set({
            dominantColor,
            colorFamily: classifyColorFamily(dominantColor),
          })
          .where(eq(schema.submittedPets.id, row.id));
        await invalidateAggregates(AGGREGATE_KEYS.facets);
        await invalidatePetCaches(row.slug);
      } catch (e) {
        console.error("color extract failed", e);
      }
    })();
  }

  // Sound generation intentionally lives in scripts/generate-pet-sounds.ts.
  // Keeping ffmpeg, child_process, and media temp-file work out of route
  // bundles prevents Turbopack/NFT from tracing the whole project into
  // admin/submit handlers during production builds.

  // Suggest matching open requests as candidates for admin review.
  // Background only — never blocks the approve response. Failures
  // are logged and swallowed; the admin can still create candidates
  // manually from /admin/requests if the auto-pass missed something.
  void (async () => {
    try {
      const { autoSuggestCandidates } = await import(
        "@/lib/request-candidates"
      );
      const result = await autoSuggestCandidates(row.id);
      if (result.inserted > 0) {
        console.log(
          `[${actor}] suggested ${result.inserted} request candidate(s) for ${row.slug}`,
        );
      }
    } catch (e) {
      console.error("request candidate suggest failed", e);
    }
  })();

  return row;
}

async function notifySubmissionOwner(row: SubmittedPet): Promise<void> {
  const { createNotification } = await import("@/lib/notifications");
  void createNotification({
    userId: row.ownerId,
    kind: row.status === "approved" ? "pet_approved" : "pet_rejected",
    payload: {
      petSlug: row.slug,
      petName: row.displayName,
      ...(row.rejectionReason ? { reason: row.rejectionReason } : {}),
    },
    href: row.status === "approved" ? `/pets/${row.slug}` : "/my-pets",
  }).catch(() => {});

  if (!row.ownerEmail || !process.env.RESEND_API_KEY) return;

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.RESEND_FROM ?? "AgentPets <hello@agentpets.dev>";
    const { getPreferredLocaleForUser } = await import("@/lib/user-locale");
    const locale = await getPreferredLocaleForUser(row.ownerId);

    if (row.status === "approved") {
      const email = renderSubmissionApprovedEmail(locale, {
        petName: row.displayName,
        petSlug: row.slug,
      });
      await resend.emails.send({
        from,
        to: row.ownerEmail,
        subject: email.subject,
        html: email.html,
        text: email.text,
      });
    } else if (row.status === "rejected") {
      const email = renderSubmissionRejectedEmail(locale, {
        petName: row.displayName,
        reason: row.rejectionReason,
      });
      await resend.emails.send({
        from,
        to: row.ownerEmail,
        subject: email.subject,
        html: email.html,
        text: email.text,
      });
    }
  } catch {
    /* silent */
  }
}

function normalizeSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function normalizeSeoPatch(
  body: SubmissionActionInput,
  now: Date,
):
  | { ok: true; patch: Record<string, unknown> }
  | { ok: false; error: string; message: string } {
  const patch: Record<string, unknown> = {};
  let touched = false;
  const textFields = [
    ["seoTitle", "seoTitle", 70],
    ["seoDescription", "seoDescription", 170],
    ["seoIntro", "seoIntro", 700],
  ] as const;

  for (const [inputKey, columnKey, max] of textFields) {
    if (!hasOwn(body, inputKey)) continue;
    const value = body[inputKey];
    if (value !== null && value !== undefined && typeof value !== "string") {
      return {
        ok: false,
        error: `invalid_${inputKey}`,
        message: `${inputKey} must be a string or null.`,
      };
    }
    patch[columnKey] = cleanNullableText(value, max);
    touched = true;
  }

  if (hasOwn(body, "seoKeywords")) {
    const keywords = normalizeSeoKeywords(body.seoKeywords);
    if (!keywords.ok) return keywords;
    patch.seoKeywords = keywords.value.length > 0 ? keywords.value : null;
    touched = true;
  }

  if (hasOwn(body, "seoFaq")) {
    const faq = normalizeSeoFaq(body.seoFaq);
    if (!faq.ok) return faq;
    patch.seoFaq = faq.value.length > 0 ? faq.value : null;
    touched = true;
  }

  if (touched) patch.seoUpdatedAt = now;
  return { ok: true, patch };
}

function normalizeSeoKeywords(
  value: SubmissionActionInput["seoKeywords"],
):
  | { ok: true; value: string[] }
  | { ok: false; error: string; message: string } {
  if (value === null || value === undefined || value === "") {
    return { ok: true, value: [] };
  }
  const raw = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : null;
  if (!raw) {
    return {
      ok: false,
      error: "invalid_seo_keywords",
      message: "seoKeywords must be an array, comma string, or null.",
    };
  }
  const seen = new Set<string>();
  const keywords: string[] = [];
  for (const item of raw) {
    if (typeof item !== "string") continue;
    const clean = item.replace(/\s+/g, " ").trim().slice(0, 48);
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    keywords.push(clean);
    if (keywords.length >= 20) break;
  }
  return { ok: true, value: keywords };
}

function normalizeSeoFaq(
  value: SubmissionActionInput["seoFaq"],
):
  | { ok: true; value: Array<{ question: string; answer: string }> }
  | { ok: false; error: string; message: string } {
  if (value === null || value === undefined || value === "") {
    return { ok: true, value: [] };
  }
  let raw: unknown = value;
  if (typeof value === "string") {
    try {
      raw = JSON.parse(value);
    } catch {
      return {
        ok: false,
        error: "invalid_seo_faq",
        message: "seoFaq JSON could not be parsed.",
      };
    }
  }
  if (!Array.isArray(raw)) {
    return {
      ok: false,
      error: "invalid_seo_faq",
      message: "seoFaq must be an array or null.",
    };
  }
  const faq = raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const question = cleanNullableText(
        typeof record.question === "string" ? record.question : null,
        140,
      );
      const answer = cleanNullableText(
        typeof record.answer === "string" ? record.answer : null,
        500,
      );
      return question && answer ? { question, answer } : null;
    })
    .filter((item): item is { question: string; answer: string } =>
      Boolean(item),
    )
    .slice(0, 8);
  return { ok: true, value: faq };
}

function cleanNullableText(
  value: string | null | undefined,
  max: number,
): string | null {
  const clean = value?.replace(/\s+/g, " ").trim();
  if (!clean) return null;
  return clean.slice(0, max);
}

function hasOwn<T extends object, K extends PropertyKey>(
  obj: T,
  key: K,
): obj is T & Record<K, unknown> {
  return Object.prototype.hasOwnProperty.call(obj, key);
}
