import { NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";

import { isAdmin } from "@/lib/admin";
import { requireSameOrigin } from "@/lib/same-origin";
import { applySubmissionAction } from "@/lib/submission-decisions";

export const runtime = "nodejs";

type SeoUpdate = {
  id: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string[] | string | null;
  seoIntro?: string | null;
  seoFaq?: Array<{ question?: string; answer?: string }> | string | null;
};

type Body = {
  updates?: SeoUpdate[];
};

export async function PATCH(req: Request): Promise<Response> {
  const csrf = requireSameOrigin(req);
  if (csrf) return csrf;

  const { userId } = await auth();
  if (!isAdmin(userId)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const updates = Array.isArray(body.updates) ? body.updates.slice(0, 100) : [];
  if (updates.length === 0) {
    return NextResponse.json(
      { error: "empty_updates", message: "No SEO updates were provided." },
      { status: 400 },
    );
  }

  const results: Array<
    | { id: string; ok: true; slug: string }
    | { id: string; ok: false; error: string; message?: string }
  > = [];

  for (const update of updates) {
    if (!update.id || typeof update.id !== "string") {
      results.push({ id: "", ok: false, error: "invalid_id" });
      continue;
    }

    const result = await applySubmissionAction(
      update.id,
      {
        action: "edit",
        seoTitle: update.seoTitle,
        seoDescription: update.seoDescription,
        seoKeywords: update.seoKeywords,
        seoIntro: update.seoIntro,
        seoFaq: update.seoFaq,
      },
      { actor: "admin", skipNotifications: true },
    );

    if (result.ok) {
      results.push({ id: update.id, ok: true, slug: result.row.slug });
    } else {
      results.push({
        id: update.id,
        ok: false,
        error: result.body.error,
        message: result.body.message,
      });
    }
  }

  const failed = results.filter((result) => !result.ok);
  return NextResponse.json({
    ok: failed.length === 0,
    updated: results.length - failed.length,
    failed: failed.length,
    results,
  });
}
