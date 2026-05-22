import type { LeaderboardRow } from "@/lib/leaderboard";
import type { OwnerCredit } from "@/lib/owner-credit";
import type { PetWithMetrics } from "@/lib/pets";
import { installCommandFor, siteConfig, siteUrl } from "@/lib/site-config";

export const PUBLIC_API_VERSION = "2026-05-22";

export function publicApiHeaders(cacheControl: string): HeadersInit {
  return {
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": cacheControl,
    "X-Robots-Tag": "noindex, nofollow",
  };
}

export function publicApiEnvelope<T>(data: T) {
  return {
    apiVersion: PUBLIC_API_VERSION,
    generatedAt: new Date().toISOString(),
    data,
  };
}

export function serializePublicPet(pet: PetWithMetrics) {
  const creator = pet.submittedBy
    ? {
        name: pet.submittedBy.name,
        url: pet.submittedBy.url ?? null,
        imageUrl: pet.submittedBy.imageUrl ?? null,
      }
    : null;

  return {
    slug: pet.slug,
    name: pet.displayName,
    description: pet.description,
    kind: pet.kind,
    vibes: pet.vibes,
    tags: pet.tags,
    featured: Boolean(pet.featured),
    color: {
      dominant: pet.dominantColor,
      family: pet.colorFamily,
    },
    assets: {
      spritesheetUrl: pet.spritesheetPath,
      petJsonUrl: pet.petJsonPath,
      zipUrl: pet.zipUrl ?? null,
      soundUrl: pet.soundUrl,
      thumbnailUrl: siteUrl(`/api/pets/${pet.slug}/thumb`),
      stickerUrl: siteUrl(`/api/pets/${pet.slug}/sticker`),
    },
    links: {
      page: siteUrl(`/pets/${pet.slug}`),
      install: siteUrl(`/install/${pet.slug}`),
      badge: siteUrl(`/api/v1/badge/${pet.slug}`),
      embed: siteUrl(`/embed/${pet.slug}`),
      api: siteUrl(`/api/v1/pets/${pet.slug}`),
    },
    install: {
      command: installCommandFor(pet.slug),
      npmPackage: siteConfig.npmPackage,
    },
    metrics: {
      installs: pet.metrics.installCount,
      likes: pet.metrics.likeCount,
      zipDownloads: pet.metrics.zipDownloadCount,
    },
    seo: {
      title: pet.seoTitle,
      description: pet.seoDescription,
      keywords: pet.seoKeywords,
      intro: pet.seoIntro,
      faq: pet.seoFaq,
      updatedAt: pet.seoUpdatedAt,
    },
    creator,
    approvedAt: pet.approvedAt,
    updatedAt: pet.seoUpdatedAt ?? pet.approvedAt ?? pet.importedAt,
  };
}

export function serializePublicCreator(
  row: LeaderboardRow,
  credit: OwnerCredit | undefined,
  rank: number,
) {
  const handle = credit?.handle ?? row.ownerId.slice(-8).toLowerCase();
  return {
    rank,
    id: row.ownerId,
    handle,
    name: credit?.name ?? handle,
    avatarUrl: credit?.imageUrl ?? null,
    url: siteUrl(`/u/${handle}`),
    externals: credit?.externals ?? [],
    stats: {
      pets: row.approvedCount,
      likes: row.totalLikes,
      installs: row.totalInstalls,
      zipDownloads: row.totalDownloads,
      score: row.value,
    },
  };
}

export function escapeSvgText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
