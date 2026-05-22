import { sitemapIndexXml } from "@/lib/sitemap-split";

export const revalidate = 86400;

export function GET(): Response {
  return new Response(sitemapIndexXml(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=86400",
    },
  });
}
