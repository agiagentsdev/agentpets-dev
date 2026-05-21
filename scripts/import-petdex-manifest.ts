// Import real pets from Petdex's public manifest into AgentPets.
//
// This is intentionally URL-based: it keeps the source asset attribution
// visible, avoids copying third-party community assets into our bucket, and
// lets production start with a real catalog while AgentPets builds its own
// submission/generator pipeline.
//
// Usage:
//   bun --conditions react-server scripts/import-petdex-manifest.ts --limit 200 --featured 24
//   bun --conditions react-server scripts/import-petdex-manifest.ts --limit 200 --featured 24 --apply

import { createHash } from "node:crypto";

import { desc, eq } from "drizzle-orm";

import {
  AGGREGATE_KEYS,
  invalidateAggregates,
  invalidatePetCaches,
} from "@/lib/db/cached-aggregates";
import { db, schema } from "@/lib/db/client";

const DEFAULT_MANIFEST_URL = "https://petdex.crafter.run/api/manifest";
const DEFAULT_OWNER_ID = "agentpets_importer";

type PetKind = "creature" | "object" | "character";

type ManifestPet = {
  slug: string;
  displayName: string;
  kind?: string | null;
  submittedBy?: string | null;
  spritesheetUrl: string;
  petJsonUrl: string;
  zipUrl?: string | null;
};

type ManifestPayload = {
  generatedAt?: string;
  total?: number;
  pets?: ManifestPet[];
};

type Args = {
  url: string;
  limit?: number;
  offset: number;
  featured: number;
  ownerId: string;
  ownerEmail?: string;
  replace: boolean;
  apply: boolean;
};

function parseArgs(): Args {
  const out: Args = {
    url: DEFAULT_MANIFEST_URL,
    offset: 0,
    featured: 0,
    ownerId:
      process.env.PETDEX_IMPORT_OWNER_ID?.trim() ||
      process.env.PETDEX_ADMIN_USER_IDS?.split(",")[0]?.trim() ||
      DEFAULT_OWNER_ID,
    ownerEmail: process.env.PETDEX_OWNER_EMAIL?.trim() || undefined,
    replace: false,
    apply: false,
  };
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = () => {
      const value = argv[++i];
      if (!value) throw new Error(`missing value for ${arg}`);
      return value;
    };

    if (arg === "--url") out.url = next();
    else if (arg === "--limit") out.limit = parsePositiveInt(next(), "limit");
    else if (arg.startsWith("--limit=")) {
      out.limit = parsePositiveInt(arg.slice("--limit=".length), "limit");
    } else if (arg === "--offset") {
      out.offset = parseNonNegativeInt(next(), "offset");
    } else if (arg.startsWith("--offset=")) {
      out.offset = parseNonNegativeInt(arg.slice("--offset=".length), "offset");
    } else if (arg === "--featured") {
      out.featured = parseNonNegativeInt(next(), "featured");
    } else if (arg.startsWith("--featured=")) {
      out.featured = parseNonNegativeInt(
        arg.slice("--featured=".length),
        "featured",
      );
    } else if (arg === "--owner-id") {
      out.ownerId = next().trim();
    } else if (arg === "--owner-email") {
      out.ownerEmail = next().trim();
    } else if (arg === "--replace") {
      out.replace = true;
    } else if (arg === "--apply") {
      out.apply = true;
    } else if (arg === "--dry-run") {
      out.apply = false;
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
  }

  if (!out.ownerId) throw new Error("owner id is empty");
  return out;
}

function parsePositiveInt(raw: string, name: string): number {
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`--${name} must be a positive integer`);
  }
  return value;
}

function parseNonNegativeInt(raw: string, name: string): number {
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`--${name} must be a non-negative integer`);
  }
  return value;
}

function printHelp(): void {
  console.log(`Import Petdex public manifest into AgentPets.

Options:
  --apply             Write to the database. Omit for dry-run.
  --url <url>         Manifest URL. Default: ${DEFAULT_MANIFEST_URL}
  --limit <n>         Import at most n pets.
  --offset <n>        Skip first n manifest pets.
  --featured <n>      Mark first n imported/updated pets as featured.
  --owner-id <id>     Owner id for imported discover rows.
  --owner-email <e>   Optional owner email.
  --replace           Update existing rows with matching slug.
  --dry-run           Force preview mode.
`);
}

function normalizeSlug(raw: string): string {
  const slug = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
  if (!slug) {
    throw new Error(`invalid empty slug from ${JSON.stringify(raw)}`);
  }
  return slug;
}

function normalizeKind(raw: string | null | undefined): PetKind {
  return raw === "object" || raw === "character" || raw === "creature"
    ? raw
    : "creature";
}

function normalizeUrl(raw: string | null | undefined, field: string): string {
  if (!raw) throw new Error(`missing ${field}`);
  const url = new URL(raw);
  if (url.protocol !== "https:") {
    throw new Error(`${field} must be https: ${raw}`);
  }
  return url.toString();
}

function importIdForSlug(slug: string): string {
  return `pet_petdex_${createHash("sha1").update(slug).digest("hex").slice(0, 18)}`;
}

function cleanDisplayName(raw: string): string {
  const value = raw.trim().replace(/\s+/g, " ");
  return (value || "Imported Pet").slice(0, 80);
}

function cleanAuthor(raw: string | null | undefined): string | null {
  const value = raw?.trim().replace(/\s+/g, " ");
  return value ? value.slice(0, 120) : null;
}

function descriptionFor(pet: {
  displayName: string;
  kind: PetKind;
  submittedBy: string | null;
}): string {
  const author = pet.submittedBy
    ? ` Shared with attribution to ${pet.submittedBy}.`
    : " Shared with attribution to the Petdex community.";
  return `Install ${pet.displayName}, a ${pet.kind} desktop pet for AI coding workflows on AgentPets.dev.${author}`;
}

function creditUrlFor(slug: string): string {
  return `https://petdex.crafter.run/pets/${encodeURIComponent(slug)}`;
}

function tagsFor(kind: PetKind, submittedBy: string | null): string[] {
  const tags = ["petdex", "community", kind];
  if (submittedBy) tags.push("attributed");
  return tags;
}

async function fetchManifest(url: string): Promise<ManifestPet[]> {
  const response = await fetch(url, {
    headers: { accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(
      `manifest fetch failed: ${response.status} ${response.statusText}`,
    );
  }

  const payload = (await response.json()) as ManifestPayload;
  if (!Array.isArray(payload.pets)) {
    throw new Error("manifest payload does not contain pets[]");
  }
  return payload.pets;
}

async function ensureImporterProfile(ownerId: string): Promise<void> {
  const existing = await db.query.userProfiles.findFirst({
    where: eq(schema.userProfiles.userId, ownerId),
  });
  if (existing) return;

  const handle =
    ownerId === DEFAULT_OWNER_ID
      ? "agentpets-imports"
      : `agentpets-imports-${createHash("sha1").update(ownerId).digest("hex").slice(0, 8)}`;

  await db
    .insert(schema.userProfiles)
    .values({
      userId: ownerId,
      handle,
      displayName: "AgentPets Imports",
      bio: "Attribution-first imported pets used to bootstrap the AgentPets catalog.",
      preferredLocale: "en",
      featuredPetSlugs: [],
    })
    .onConflictDoNothing();
}

async function main() {
  const args = parseArgs();
  const allPets = await fetchManifest(args.url);
  const selected = allPets.slice(
    args.offset,
    args.limit ? args.offset + args.limit : undefined,
  );

  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  const importedSlugs: string[] = [];

  console.log("\nPetdex manifest import");
  console.log("----------------------");
  console.log(`manifest : ${args.url}`);
  console.log(`remote   : ${allPets.length} pets`);
  console.log(`selected : ${selected.length} pets`);
  console.log(`owner    : ${args.ownerId}`);
  console.log(`featured : first ${args.featured}`);
  console.log(`replace  : ${args.replace ? "yes" : "no"}`);
  console.log(`mode     : ${args.apply ? "APPLY" : "dry-run"}`);

  if (selected.length === 0) {
    console.log("\nNothing selected.");
    return;
  }

  if (args.apply) {
    await ensureImporterProfile(args.ownerId);
  }

  for (let i = 0; i < selected.length; i++) {
    const source = selected[i];
    const slug = normalizeSlug(source.slug);
    const displayName = cleanDisplayName(source.displayName);
    const kind = normalizeKind(source.kind);
    const submittedBy = cleanAuthor(source.submittedBy);
    const spritesheetUrl = normalizeUrl(
      source.spritesheetUrl,
      "spritesheetUrl",
    );
    const petJsonUrl = normalizeUrl(source.petJsonUrl, "petJsonUrl");
    const zipUrl = normalizeUrl(source.zipUrl ?? source.petJsonUrl, "zipUrl");
    const featured = i < args.featured;
    const now = new Date();

    const existing = args.apply
      ? await db.query.submittedPets.findFirst({
          where: eq(schema.submittedPets.slug, slug),
        })
      : null;

    if (existing && !args.replace) {
      skipped++;
      continue;
    }

    importedSlugs.push(slug);
    const values = {
      displayName,
      description: descriptionFor({ displayName, kind, submittedBy }),
      spritesheetUrl,
      petJsonUrl,
      zipUrl,
      kind,
      vibes: ["developer-friendly"],
      tags: tagsFor(kind, submittedBy),
      featured,
      status: "approved" as const,
      source: "discover" as const,
      ownerId: args.ownerId,
      ownerEmail: args.ownerEmail ?? null,
      creditName: submittedBy ?? "Petdex community",
      creditUrl: creditUrlFor(slug),
      creditImage: null,
      approvedAt: now,
    };

    if (!args.apply) {
      inserted++;
      continue;
    }

    if (existing) {
      await db
        .update(schema.submittedPets)
        .set(values)
        .where(eq(schema.submittedPets.slug, slug));
      updated++;
    } else {
      await db.insert(schema.submittedPets).values({
        id: importIdForSlug(slug),
        slug,
        ...values,
        createdAt: new Date(now.getTime() - i * 1000),
      });
      inserted++;
    }

    await db
      .insert(schema.petMetrics)
      .values({ petSlug: slug })
      .onConflictDoNothing();
  }

  if (args.apply && importedSlugs.length > 0) {
    await invalidatePetCaches(...importedSlugs.slice(0, 100));
    await invalidateAggregates(
      AGGREGATE_KEYS.approvedCatalog,
      AGGREGATE_KEYS.slimManifest,
      AGGREGATE_KEYS.featuredPets,
      AGGREGATE_KEYS.dexNumbers,
      AGGREGATE_KEYS.randomPetPool,
      AGGREGATE_KEYS.latestApprovedPets,
      AGGREGATE_KEYS.facets,
    );
  }

  const latest = args.apply
    ? await db
        .select({
          slug: schema.submittedPets.slug,
          displayName: schema.submittedPets.displayName,
          featured: schema.submittedPets.featured,
        })
        .from(schema.submittedPets)
        .where(eq(schema.submittedPets.status, "approved"))
        .orderBy(desc(schema.submittedPets.approvedAt))
        .limit(5)
    : [];

  console.log("\nResult");
  console.log("------");
  console.log(`inserted: ${inserted}`);
  console.log(`updated : ${updated}`);
  console.log(`skipped : ${skipped}`);
  if (!args.apply) {
    console.log("\nDry run only. Re-run with --apply to write to production.");
  } else if (latest.length > 0) {
    console.log("\nLatest approved rows:");
    for (const pet of latest) {
      console.log(
        `- ${pet.slug} | ${pet.displayName}${pet.featured ? " | featured" : ""}`,
      );
    }
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => {
    // postgres-js keeps sockets open; scripts should terminate cleanly.
    setTimeout(() => process.exit(process.exitCode ?? 0), 50);
  });
