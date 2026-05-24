import { getPetWithMetrics } from "@/lib/pets";
import { recordProductAnalyticsEvent } from "@/lib/product-analytics";
import { escapeSvgText } from "@/lib/public-api";

export const runtime = "nodejs";
export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function GET(req: Request, { params }: Props): Promise<Response> {
  const { slug } = await params;
  const normalizedSlug = slug.toLowerCase();
  const pet = await getPetWithMetrics(normalizedSlug);
  if (pet) {
    void recordProductAnalyticsEvent({
      event: "badge_impression",
      petSlug: pet.slug,
      path: `/api/v1/badge/${pet.slug}`,
      source: "badge",
      referrer: req.headers.get("referer"),
      request: req,
    });
  }
  const label = pet ? pet.displayName : "AgentPets";
  const installs = pet ? compactNumber(pet.metrics.installCount) : "pet";
  const text = pet ? `${installs} installs` : "not found";
  const leftWidth = Math.max(84, label.length * 7 + 28);
  const rightWidth = Math.max(82, text.length * 7 + 24);
  const width = leftWidth + rightWidth;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="28" role="img" aria-label="AgentPets: ${escapeSvgText(
    label,
  )}">
  <title>AgentPets: ${escapeSvgText(label)}</title>
  <linearGradient id="g" x2="1">
    <stop offset="0" stop-color="#111827"/>
    <stop offset="1" stop-color="#2563eb"/>
  </linearGradient>
  <rect width="${width}" height="28" rx="7" fill="#0f172a"/>
  <rect width="${leftWidth}" height="28" rx="7" fill="url(#g)"/>
  <path d="M${leftWidth - 7} 0h7v28h-7z" fill="#2563eb"/>
  <text x="14" y="18" fill="#fff" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="12" font-weight="700">${escapeSvgText(
    label,
  )}</text>
  <text x="${leftWidth + 12}" y="18" fill="#dbeafe" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="12" font-weight="600">${escapeSvgText(
    text,
  )}</text>
</svg>`;

  return new Response(svg, {
    status: pet ? 200 : 404,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control":
        "public, max-age=300, s-maxage=1800, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

function compactNumber(value: number) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}
