import type { MetadataRoute } from "next";

import { sitemapSections, splitSitemapUrl } from "@/lib/sitemap-split";
import { siteConfig } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/", "/submit", "/create"],
      },
    ],
    sitemap: [
      `${siteConfig.url}/sitemap.xml`,
      `${siteConfig.url}/sitemap-index.xml`,
      ...sitemapSections.map(splitSitemapUrl),
    ],
    host: siteConfig.url,
  };
}
