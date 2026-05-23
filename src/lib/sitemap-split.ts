import type { MetadataRoute } from "next";

import { getAllCollections } from "@/lib/collections";
import { allBestPages } from "@/lib/best-pages";
import {
  buildAbsoluteLocaleAlternates,
  buildAbsoluteUrl,
} from "@/lib/locale-routing";
import { getAllApprovedPets } from "@/lib/pets";
import { guides, topicHubs } from "@/lib/seo-content";
import { seoAgentPages } from "@/lib/seo-agent-pages";
import { siteConfig } from "@/lib/site-config";
import { PET_KINDS, PET_VIBES } from "@/lib/types";

export type SitemapSection =
  | "static"
  | "pets"
  | "collections"
  | "facets"
  | "topics"
  | "guides";

export const sitemapSections: SitemapSection[] = [
  "static",
  "pets",
  "collections",
  "facets",
  "topics",
  "guides",
];

export type EntryInput = {
  pathname: string;
  lastModified: Date;
  changeFrequency: NonNullable<
    MetadataRoute.Sitemap[number]["changeFrequency"]
  >;
  priority: number;
};

export function splitSitemapUrl(section: SitemapSection): string {
  return `${siteConfig.url}/sitemaps/${section}.xml`;
}

export function expandLocalizedEntry(entry: EntryInput): MetadataRoute.Sitemap {
  return [
    {
      url: buildAbsoluteUrl(entry.pathname, "en"),
      lastModified: entry.lastModified,
      changeFrequency: entry.changeFrequency,
      priority: entry.priority,
      alternates: buildAbsoluteLocaleAlternates(entry.pathname),
    },
    {
      url: buildAbsoluteUrl(entry.pathname, "es"),
      lastModified: entry.lastModified,
      changeFrequency: entry.changeFrequency,
      priority: entry.priority,
      alternates: buildAbsoluteLocaleAlternates(entry.pathname),
    },
    {
      url: buildAbsoluteUrl(entry.pathname, "zh"),
      lastModified: entry.lastModified,
      changeFrequency: entry.changeFrequency,
      priority: entry.priority,
      alternates: buildAbsoluteLocaleAlternates(entry.pathname),
    },
  ];
}

export async function getSitemapEntries(
  section: SitemapSection,
): Promise<EntryInput[]> {
  const now = new Date();

  if (section === "static") {
    return [
      { pathname: "/", lastModified: now, changeFrequency: "daily", priority: 1 },
      {
        pathname: "/about",
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.8,
      },
      {
        pathname: "/docs",
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.75,
      },
      {
        pathname: "/developers",
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      },
      {
        pathname: "/pet-builder",
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.85,
      },
      {
        pathname: "/leaderboard",
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.7,
      },
      {
        pathname: "/collections",
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      },
      {
        pathname: "/topics",
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.75,
      },
      {
        pathname: "/guides",
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.75,
      },
      ...allBestPages().map((page) => ({
        pathname: `/best/${page.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: page.slug === "codex-pets" ? 0.82 : 0.72,
      })),
      {
        pathname: "/requests",
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.6,
      },
      {
        pathname: "/create",
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.6,
      },
      {
        pathname: "/download",
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      },
      {
        pathname: "/brand",
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.5,
      },
      {
        pathname: "/legal/takedown",
        lastModified: now,
        changeFrequency: "yearly",
        priority: 0.2,
      },
      ...Object.keys(seoAgentPages)
        .filter((pathname) => pathname !== "pet-builder")
        .map((pathname) => ({
          pathname: `/${pathname}`,
          lastModified: now,
          changeFrequency: "weekly" as const,
          priority: pathname === "ai-coding-pets" ? 0.85 : 0.75,
        })),
    ];
  }

  if (section === "facets") {
    return [
      ...PET_VIBES.map((vibe) => ({
        pathname: `/vibe/${vibe}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
      ...PET_KINDS.map((kind) => ({
        pathname: `/kind/${kind}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ];
  }

  if (section === "topics") {
    return topicHubs.map((topic) => ({
      pathname: `/topics/${topic.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.75,
    }));
  }

  if (section === "guides") {
    return guides.map((guide) => ({
      pathname: `/guides/${guide.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  }

  if (section === "collections") {
    const collections = await getAllCollections();
    return collections.map((collection) => ({
      pathname: `/collections/${collection.slug}`,
      lastModified: collection.updatedAt ?? now,
      changeFrequency: "weekly",
      priority: collection.featured ? 0.8 : 0.5,
    }));
  }

  const pets = await getAllApprovedPets();
  return pets.map((pet) => ({
    pathname: `/pets/${pet.slug}`,
    lastModified: pet.importedAt ? new Date(pet.importedAt) : now,
    changeFrequency: "weekly",
    priority: pet.featured ? 0.9 : 0.6,
  }));
}

export async function getAllSitemapEntries(): Promise<EntryInput[]> {
  const groups = await Promise.all(
    sitemapSections.map((section) => getSitemapEntries(section)),
  );
  return groups.flat();
}

export function sitemapXml(entries: MetadataRoute.Sitemap): string {
  const rows = entries
    .map((entry) => {
      const alternates = entry.alternates?.languages
        ? Object.entries(entry.alternates.languages)
            .map(
              ([hreflang, href]) =>
                `    <xhtml:link rel="alternate" hreflang="${escapeXml(
                  hreflang,
                )}" href="${escapeXml(String(href))}" />`,
            )
            .join("\n")
        : "";

      return [
        "  <url>",
        `    <loc>${escapeXml(entry.url)}</loc>`,
        entry.lastModified
          ? `    <lastmod>${new Date(entry.lastModified).toISOString()}</lastmod>`
          : "",
        entry.changeFrequency
          ? `    <changefreq>${entry.changeFrequency}</changefreq>`
          : "",
        typeof entry.priority === "number"
          ? `    <priority>${entry.priority.toFixed(2)}</priority>`
          : "",
        alternates,
        "  </url>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${rows}\n</urlset>\n`;
}

export function sitemapIndexXml(): string {
  const now = new Date().toISOString();
  const rows = sitemapSections
    .map(
      (section) =>
        `  <sitemap>\n    <loc>${escapeXml(
          splitSitemapUrl(section),
        )}</loc>\n    <lastmod>${now}</lastmod>\n  </sitemap>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</sitemapindex>\n`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
