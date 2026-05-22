import { NextResponse } from "next/server";

import { searchPets, SEARCH_LIMITS, type SortKey } from "@/lib/pet-search";
import {
  publicApiEnvelope,
  publicApiHeaders,
  serializePublicPet,
} from "@/lib/public-api";
import { PET_KINDS, PET_VIBES, type PetKind, type PetVibe } from "@/lib/types";

export const runtime = "nodejs";
export const revalidate = 120;

const SORTS = new Set<SortKey>([
  "curated",
  "popular",
  "installed",
  "alpha",
  "recent",
]);

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const params = url.searchParams;
  const q = params.get("q")?.trim() || undefined;
  const kind = normalizeEnum(params.get("kind"), PET_KINDS) as
    | PetKind
    | undefined;
  const vibe = normalizeEnum(params.get("vibe"), PET_VIBES) as
    | PetVibe
    | undefined;
  const sortRaw = params.get("sort")?.toLowerCase() as SortKey | undefined;
  const sort = sortRaw && SORTS.has(sortRaw) ? sortRaw : "curated";
  const cursor = clampInt(params.get("cursor"), 0, 0, 100000);
  const limit = clampInt(
    params.get("limit"),
    SEARCH_LIMITS.DEFAULT_LIMIT,
    1,
    SEARCH_LIMITS.MAX_LIMIT,
  );

  const result = await searchPets(
    {
      q,
      kinds: kind ? [kind] : undefined,
      vibes: vibe ? [vibe] : undefined,
      sort,
      cursor,
      limit,
    },
    { includeTotal: true, includeFacets: false },
  );

  return NextResponse.json(
    publicApiEnvelope({
      items: result.pets.map(serializePublicPet),
      paging: {
        cursor,
        limit,
        nextCursor: result.nextCursor,
        total: result.total ?? result.pets.length,
      },
      search: {
        q: q ?? null,
        kind: kind ?? null,
        vibe: vibe ?? null,
        sort,
        mode: result.searchMode,
      },
    }),
    {
      headers: publicApiHeaders(
        "public, max-age=60, s-maxage=120, stale-while-revalidate=600",
      ),
    },
  );
}

function normalizeEnum(value: string | null, allowed: readonly string[]) {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  return allowed.includes(normalized) ? normalized : undefined;
}

function clampInt(
  raw: string | null,
  fallback: number,
  min: number,
  max: number,
) {
  const parsed = raw ? Number.parseInt(raw, 10) : fallback;
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}
