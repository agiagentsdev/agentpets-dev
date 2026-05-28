import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site-config";
import { sitemapSections, splitSitemapUrl } from "@/lib/sitemap-split";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/embed/",
          "/my-feedback",
          "/submit",
        ],
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
