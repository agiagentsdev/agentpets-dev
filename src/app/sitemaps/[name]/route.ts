import {
  expandLocalizedEntry,
  getSitemapEntries,
  sitemapSections,
  sitemapXml,
  type SitemapSection,
} from "@/lib/sitemap-split";

export const revalidate = 86400;
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ name: string }> };

export async function GET(_request: Request, { params }: Props) {
  const { name } = await params;
  const section = name.replace(/\.xml$/i, "") as SitemapSection;
  if (!sitemapSections.includes(section)) {
    return new Response("Not found", { status: 404 });
  }

  const entries = await getSitemapEntries(section);
  return new Response(sitemapXml(entries.flatMap(expandLocalizedEntry)), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=86400",
    },
  });
}
