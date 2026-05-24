import {
  type ProductAnalyticsEventKind,
  recordProductAnalyticsEvent,
  sourceFromPath,
} from "@/lib/product-analytics";
import { productAnalyticsRatelimit } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 2048;
const VALID_EVENTS = new Set<ProductAnalyticsEventKind>(["pet_page_view"]);
const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,62}$/;

type Body = {
  event?: unknown;
  petSlug?: unknown;
  path?: unknown;
  source?: unknown;
  referrer?: unknown;
};

export async function POST(req: Request): Promise<Response> {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "anon";
  const rl = await productAnalyticsRatelimit.limit(ip);
  if (!rl.success) return new Response(null, { status: 429 });

  const contentLength = Number(req.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    return Response.json({ error: "payload_too_large" }, { status: 413 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  if (
    typeof body.event !== "string" ||
    !VALID_EVENTS.has(body.event as ProductAnalyticsEventKind)
  ) {
    return Response.json({ error: "invalid_event" }, { status: 400 });
  }

  if (typeof body.petSlug !== "string" || !SLUG_RE.test(body.petSlug)) {
    return Response.json({ error: "invalid_pet_slug" }, { status: 400 });
  }

  const path =
    typeof body.path === "string" && body.path.startsWith("/")
      ? body.path.slice(0, 512)
      : `/pets/${body.petSlug}`;
  const source =
    typeof body.source === "string" && body.source
      ? body.source
      : sourceFromPath(path);
  const referrer =
    typeof body.referrer === "string" ? body.referrer.slice(0, 512) : null;

  await recordProductAnalyticsEvent({
    event: body.event as ProductAnalyticsEventKind,
    petSlug: body.petSlug,
    path,
    source,
    referrer,
    request: req,
  });

  return new Response(null, {
    status: 204,
    headers: { "Cache-Control": "no-store" },
  });
}
