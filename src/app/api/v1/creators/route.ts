import { NextResponse } from "next/server";

import { getLeaderboard, type LeaderboardMetric } from "@/lib/leaderboard";
import { resolveOwnerCredits } from "@/lib/owner-credit";
import {
  publicApiEnvelope,
  publicApiHeaders,
  serializePublicCreator,
} from "@/lib/public-api";

export const runtime = "nodejs";
export const revalidate = 300;

const METRICS = new Set<LeaderboardMetric>([
  "pets",
  "likes",
  "installs",
  "rising",
  "collectors",
]);

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const metricRaw = url.searchParams
    .get("metric")
    ?.toLowerCase() as LeaderboardMetric | null;
  const metric = metricRaw && METRICS.has(metricRaw) ? metricRaw : "pets";
  const limit = clampInt(url.searchParams.get("limit"), 25, 1, 50);
  const rows = (await getLeaderboard(metric)).slice(0, limit);
  const credits = await resolveOwnerCredits(
    rows.map((row) => ({
      ownerId: row.ownerId,
      creditName: null,
      creditUrl: null,
      creditImage: null,
    })),
  );

  return NextResponse.json(
    publicApiEnvelope({
      metric,
      items: rows.map((row, index) =>
        serializePublicCreator(row, credits.get(row.ownerId), index + 1),
      ),
    }),
    {
      headers: publicApiHeaders(
        "public, max-age=60, s-maxage=300, stale-while-revalidate=1800",
      ),
    },
  );
}

function clampInt(raw: string | null, fallback: number, min: number, max: number) {
  const parsed = raw ? Number.parseInt(raw, 10) : fallback;
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}
