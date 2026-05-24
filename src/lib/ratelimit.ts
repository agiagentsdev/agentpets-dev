import { Ratelimit } from "@upstash/ratelimit";

import { IS_MOCK } from "./mock";
import { getUpstashRedis } from "./upstash";

const redis = getUpstashRedis();

type RatelimitConfig = ConstructorParameters<typeof Ratelimit>[0];
type RatelimitWithoutRedis = Omit<RatelimitConfig, "redis">;

const passThroughRatelimit = {
  limit: async () => ({
    success: true,
    limit: Number.POSITIVE_INFINITY,
    remaining: Number.POSITIVE_INFINITY,
    reset: 0,
    pending: Promise.resolve(),
  }),
} as unknown as Ratelimit;

function createRatelimit(config: RatelimitWithoutRedis): Ratelimit {
  if (IS_MOCK || !redis) {
    return passThroughRatelimit;
  }
  return new Ratelimit({ ...config, redis });
}

export const submitRatelimit = createRatelimit({
  limiter: Ratelimit.slidingWindow(10, "24 h"),
  prefix: "petdex:submit",
  analytics: true,
});

// Withdrawals from /my-pets — generous so retries don't lock you out, but
// stops a malicious automated loop.
export const withdrawRatelimit = createRatelimit({
  limiter: Ratelimit.slidingWindow(20, "10 m"),
  prefix: "petdex:withdraw",
});

// Claim attempts — anti-bruteforce for the cross-account flow even though
// the verified-email check already blocks the actual data move.
export const claimRatelimit = createRatelimit({
  limiter: Ratelimit.slidingWindow(20, "1 h"),
  prefix: "petdex:claim",
});

// Public install-counter increments. Generous because a real user might
// install dozens of pets, but caps obvious automation. Keyed by IP.
export const installCounterRatelimit = createRatelimit({
  limiter: Ratelimit.slidingWindow(60, "1 h"),
  prefix: "petdex:install-count",
});

// Zip-download tracker. Same shape as install-count.
export const trackZipRatelimit = createRatelimit({
  limiter: Ratelimit.slidingWindow(60, "1 h"),
  prefix: "petdex:track-zip",
});

// WhatsApp Sticker Pack generation. Each request fans out to 1 spritesheet
// fetch + 9 animated WebP encodes + 1 ZIP — the heaviest unauthenticated
// path in the app. Tighter ceiling so a loop can't burn CPU + R2 egress.
export const wastickersRatelimit = createRatelimit({
  limiter: Ratelimit.slidingWindow(8, "1 h"),
  prefix: "petdex:wastickers",
});

// Public metrics reads — `/api/pets/[slug]/metrics`. Browser pages hit
// this on every visit, and the CDN caches the response for 60s so the
// hot path is free. The limit only kicks in for direct bot/script
// hammering against an uncached slug. Keyed by IP.
export const metricsReadRatelimit = createRatelimit({
  limiter: Ratelimit.slidingWindow(240, "1 h"),
  prefix: "petdex:metrics-read",
});

// Likes — generous so legit users browsing the gallery never hit the cap,
// but stops a 100-account brigade from inflating one pet to the top.
export const likeRatelimit = createRatelimit({
  limiter: Ratelimit.slidingWindow(60, "1 h"),
  prefix: "petdex:like",
});

// Pet requests + upvotes share a generous bucket — one user can shape the
// roadmap up to 30 actions / 10 min before we slow them down.
export const petRequestRatelimit = createRatelimit({
  limiter: Ratelimit.slidingWindow(30, "10 m"),
  prefix: "petdex:requests",
});

// R2 presign requests. Without this, a logged-in attacker can request
// thousands of presigned PUT URLs in a loop and waste R2 storage cost
// even if they never call /api/submit/register afterwards.
export const presignRatelimit = createRatelimit({
  limiter: Ratelimit.slidingWindow(20, "1 h"),
  prefix: "petdex:presign",
});

export const adCampaignRatelimit = createRatelimit({
  limiter: Ratelimit.slidingWindow(10, "1 h"),
  prefix: "petdex:ad-campaign",
});

export const adCampaignEditRatelimit = createRatelimit({
  limiter: Ratelimit.slidingWindow(10, "24 h"),
  prefix: "petdex:ad-campaign-edit",
});

export const adCheckoutRatelimit = createRatelimit({
  limiter: Ratelimit.slidingWindow(20, "1 h"),
  prefix: "petdex:ad-checkout",
});

export const adImpressionRatelimit = createRatelimit({
  limiter: Ratelimit.slidingWindow(240, "1 h"),
  prefix: "petdex:ad-impression",
});

export const adEventRatelimit = createRatelimit({
  limiter: Ratelimit.slidingWindow(600, "1 h"),
  prefix: "petdex:ad-event",
});

// CLI bearer verification by IP — stops blind floods of bogus tokens
// burning Clerk userinfo quota.
export const cliVerifyRatelimit = createRatelimit({
  limiter: Ratelimit.slidingWindow(120, "1 m"),
  prefix: "petdex:cli-verify",
});

// Owner edits to displayName/description/tags. Generous within the day so
// the owner can iterate copy, but caps a malicious loop that floods the
// admin queue with edit churn. Keyed by petId.
export const editRatelimit = createRatelimit({
  limiter: Ratelimit.slidingWindow(5, "24 h"),
  prefix: "petdex:edit",
});

// User profile identity edits (display name, handle, bio, locale).
// Self-expression, no admin review, so we only need to stop spam loops.
// Keyed by userId.
export const profileEditRatelimit = createRatelimit({
  limiter: Ratelimit.slidingWindow(10, "24 h"),
  prefix: "petdex:profile-edit",
});

// Pin and pinned-order edits can happen repeatedly while curating a
// profile. Keep the abuse cap, but make it generous enough for drag
// auto-save and one-click pin/unpin flows.
export const profilePinRatelimit = createRatelimit({
  limiter: Ratelimit.slidingWindow(60, "24 h"),
  prefix: "petdex:profile-pin",
});

// /api/manifest/full pulls the full pet catalog with descriptions,
// tags, install commands, page URLs, and asset paths. It's auth-gated
// so it only fires for signed-in users, but the response is bigger
// than slim and re-runs a full DB scan on every hit. 120 reqs/hour
// per user covers any reasonable CLI / dashboard / scripting workflow
// (CLI does 1 per `petdex install`, ~50/h is the realistic ceiling)
// while shutting down a loop. Keyed by userId.
export const manifestFullRatelimit = createRatelimit({
  limiter: Ratelimit.slidingWindow(120, "1 h"),
  prefix: "petdex:manifest-full",
});

// Telemetry event ingestion. One UUID per device, fire-and-forget. 60/min
// stops a loop from filling the DB but never triggers on normal CLI usage.
// Keyed by IP because install_id can be faked.
export const telemetryRatelimit = createRatelimit({
  limiter: Ratelimit.slidingWindow(60, "1 m"),
  prefix: "petdex:telemetry",
});

// Product analytics ingestion. Browser page-view beacons and badge image
// requests are intentionally low-value per event, so cap obvious loops while
// allowing normal browsing and README badge cache misses.
export const productAnalyticsRatelimit = createRatelimit({
  limiter: Ratelimit.slidingWindow(240, "1 h"),
  prefix: "petdex:product-analytics",
});

export const wechatQrUploadRatelimit = createRatelimit({
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  prefix: "petdex:wechat-qr-upload",
});
