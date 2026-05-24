import "server-only";

import { createHash } from "node:crypto";

import { sql } from "drizzle-orm";

import { db, schema } from "@/lib/db/client";

export type ProductAnalyticsEventKind = "pet_page_view" | "badge_impression";

export type ProductAnalyticsInput = {
  event: ProductAnalyticsEventKind;
  petSlug?: string | null;
  path?: string | null;
  source?: string | null;
  referrer?: string | null;
  request?: Request;
};

export type ProductAnalyticsSummary = {
  days: number;
  totals: {
    petPageViews: number;
    badgeImpressions: number;
    badgeClicks: number;
    badgeCtr: number;
    uniqueVisitors: number;
  };
  topPets: Array<{
    slug: string;
    displayName: string;
    pageViews: number;
    badgeImpressions: number;
    badgeClicks: number;
    badgeCtr: number;
    installs: number;
    likes: number;
    downloads: number;
  }>;
  referrers: Array<{ host: string; views: number }>;
};

const VALID_SOURCE = /^[a-z0-9][a-z0-9_-]{0,63}$/;
const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,62}$/;

export async function recordProductAnalyticsEvent(
  input: ProductAnalyticsInput,
): Promise<void> {
  const petSlug = cleanSlug(input.petSlug);
  const path = cleanPath(input.path);
  const source = cleanSource(input.source);
  const referrer = cleanReferrer(input.referrer);
  const referrerHost = referrer ? hostFor(referrer) : null;

  try {
    await db.insert(schema.productAnalyticsEvents).values({
      event: input.event,
      petSlug,
      path,
      source,
      referrer,
      referrerHost,
      userAgentHash: hashMaybe(input.request?.headers.get("user-agent")),
      ipHash: hashMaybe(clientIp(input.request)),
    });
  } catch (error) {
    console.error(
      "[product-analytics] insert failed:",
      error instanceof Error ? error.message : "unknown error",
    );
  }
}

export async function getProductAnalyticsSummary(
  days = 30,
): Promise<ProductAnalyticsSummary> {
  const safeDays = Math.max(1, Math.min(180, Math.floor(days)));

  try {
    const [totalsResult, topPetsResult, referrersResult] = await Promise.all([
      db.execute(sql`
        SELECT
          COUNT(*) FILTER (WHERE event = 'pet_page_view')::int AS pet_page_views,
          COUNT(*) FILTER (WHERE event = 'badge_impression')::int AS badge_impressions,
          COUNT(*) FILTER (
            WHERE event = 'pet_page_view'
              AND (source IN ('badge', 'readme_badge') OR referrer_host IN ('github.com', 'www.github.com'))
          )::int AS badge_clicks,
          COUNT(DISTINCT ip_hash) FILTER (WHERE event = 'pet_page_view' AND ip_hash IS NOT NULL)::int AS unique_visitors
        FROM product_analytics_events
        WHERE created_at >= now() - (${safeDays} * interval '1 day')
      `),
      db.execute(sql`
        WITH page_views AS (
          SELECT
            pet_slug,
            COUNT(*)::int AS page_views,
            COUNT(*) FILTER (
              WHERE source IN ('badge', 'readme_badge') OR referrer_host IN ('github.com', 'www.github.com')
            )::int AS badge_clicks
          FROM product_analytics_events
          WHERE event = 'pet_page_view'
            AND pet_slug IS NOT NULL
            AND created_at >= now() - (${safeDays} * interval '1 day')
          GROUP BY pet_slug
        ),
        badges AS (
          SELECT pet_slug, COUNT(*)::int AS badge_impressions
          FROM product_analytics_events
          WHERE event = 'badge_impression'
            AND pet_slug IS NOT NULL
            AND created_at >= now() - (${safeDays} * interval '1 day')
          GROUP BY pet_slug
        )
        SELECT
          p.slug,
          p.display_name,
          COALESCE(pv.page_views, 0)::int AS page_views,
          COALESCE(b.badge_impressions, 0)::int AS badge_impressions,
          COALESCE(pv.badge_clicks, 0)::int AS badge_clicks,
          COALESCE(m.install_count, 0)::int AS installs,
          COALESCE(m.like_count, 0)::int AS likes,
          COALESCE(m.zip_download_count, 0)::int AS downloads
        FROM submitted_pets p
        LEFT JOIN page_views pv ON pv.pet_slug = p.slug
        LEFT JOIN badges b ON b.pet_slug = p.slug
        LEFT JOIN pet_metrics m ON m.pet_slug = p.slug
        WHERE p.status = 'approved'
          AND (COALESCE(pv.page_views, 0) > 0 OR COALESCE(b.badge_impressions, 0) > 0)
        ORDER BY COALESCE(pv.page_views, 0) DESC,
                 COALESCE(pv.badge_clicks, 0) DESC,
                 COALESCE(b.badge_impressions, 0) DESC,
                 p.display_name ASC
        LIMIT 30
      `),
      db.execute(sql`
        SELECT referrer_host AS host, COUNT(*)::int AS views
        FROM product_analytics_events
        WHERE event = 'pet_page_view'
          AND referrer_host IS NOT NULL
          AND created_at >= now() - (${safeDays} * interval '1 day')
        GROUP BY referrer_host
        ORDER BY views DESC, referrer_host ASC
        LIMIT 12
      `),
    ]);

    const totalsRow = row(totalsResult) as {
      pet_page_views?: unknown;
      badge_impressions?: unknown;
      badge_clicks?: unknown;
      unique_visitors?: unknown;
    };
    const badgeImpressions = toNumber(totalsRow.badge_impressions);
    const badgeClicks = toNumber(totalsRow.badge_clicks);

    const topPets = rows(topPetsResult).map((item) => {
      const r = item as {
        slug: string;
        display_name: string;
        page_views: unknown;
        badge_impressions: unknown;
        badge_clicks: unknown;
        installs: unknown;
        likes: unknown;
        downloads: unknown;
      };
      const impressions = toNumber(r.badge_impressions);
      const clicks = toNumber(r.badge_clicks);
      return {
        slug: r.slug,
        displayName: r.display_name,
        pageViews: toNumber(r.page_views),
        badgeImpressions: impressions,
        badgeClicks: clicks,
        badgeCtr: ratio(clicks, impressions),
        installs: toNumber(r.installs),
        likes: toNumber(r.likes),
        downloads: toNumber(r.downloads),
      };
    });

    return {
      days: safeDays,
      totals: {
        petPageViews: toNumber(totalsRow.pet_page_views),
        badgeImpressions,
        badgeClicks,
        badgeCtr: ratio(badgeClicks, badgeImpressions),
        uniqueVisitors: toNumber(totalsRow.unique_visitors),
      },
      topPets,
      referrers: rows(referrersResult).map((item) => {
        const r = item as { host: string; views: unknown };
        return { host: r.host, views: toNumber(r.views) };
      }),
    };
  } catch (error) {
    console.error(
      "[product-analytics] summary failed:",
      error instanceof Error ? error.message : "unknown error",
    );
    return {
      days: safeDays,
      totals: {
        petPageViews: 0,
        badgeImpressions: 0,
        badgeClicks: 0,
        badgeCtr: 0,
        uniqueVisitors: 0,
      },
      topPets: [],
      referrers: [],
    };
  }
}

export function sourceFromPath(path: string): string | null {
  try {
    const url = new URL(path, "https://agentpets.dev");
    const ref = url.searchParams.get("ref");
    if (ref === "badge") return "badge";
    const medium = url.searchParams.get("utm_medium");
    if (medium === "badge") return "readme_badge";
    return cleanSource(url.searchParams.get("utm_source"));
  } catch {
    return null;
  }
}

function cleanSlug(value: string | null | undefined): string | null {
  if (!value) return null;
  const slug = value.trim().toLowerCase();
  return SLUG_RE.test(slug) ? slug : null;
}

function cleanPath(value: string | null | undefined): string | null {
  if (!value) return null;
  const path = value.trim();
  if (!path.startsWith("/")) return null;
  return path.slice(0, 512);
}

function cleanSource(value: string | null | undefined): string | null {
  if (!value) return null;
  const source = value.trim().toLowerCase();
  return VALID_SOURCE.test(source) ? source : null;
}

function cleanReferrer(value: string | null | undefined): string | null {
  if (!value) return null;
  const referrer = value.trim();
  if (!referrer.startsWith("http://") && !referrer.startsWith("https://")) {
    return null;
  }
  return referrer.slice(0, 512);
}

function hostFor(value: string): string | null {
  try {
    return new URL(value).hostname.toLowerCase().slice(0, 120);
  } catch {
    return null;
  }
}

function clientIp(request: Request | undefined): string | null {
  if (!request) return null;
  const xff = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return xff ?? request.headers.get("x-real-ip") ?? null;
}

function hashMaybe(value: string | null | undefined): string | null {
  if (!value) return null;
  const secret =
    process.env.PRODUCT_ANALYTICS_HASH_SECRET ??
    process.env.TELEMETRY_RATELIMIT_SECRET ??
    "agentpets-product-analytics";
  const day = new Date().toISOString().slice(0, 10);
  return createHash("sha256").update(`${secret}:${day}:${value}`).digest("hex");
}

function rows(result: unknown): unknown[] {
  return (result as { rows?: unknown[] }).rows ?? [];
}

function row(result: unknown): unknown {
  return rows(result)[0] ?? {};
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number.parseInt(value, 10) || 0;
  return 0;
}

function ratio(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}
