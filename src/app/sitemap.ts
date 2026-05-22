import type { MetadataRoute } from "next";

import {
  expandLocalizedEntry,
  getAllSitemapEntries,
} from "@/lib/sitemap-split";

export const revalidate = 86400;
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await getAllSitemapEntries();
  return entries.flatMap(expandLocalizedEntry);
}
