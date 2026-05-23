import type { Metadata } from "next";

import type { Locale } from "@/i18n/config";
import { buildLocaleAlternates } from "@/lib/locale-routing";
import { siteConfig } from "@/lib/site-config";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  locale?: Locale;
  keywords?: string[];
  image?: string;
  imageAlt?: string;
  noindex?: boolean;
  absoluteTitle?: boolean;
  type?: "website" | "article";
};

const DEFAULT_OG_IMAGE = `${siteConfig.url}/api/og`;

export function createPageMetadata(input: PageMetadataInput): Metadata {
  const image = input.image ?? DEFAULT_OG_IMAGE;
  const imageAlt = input.imageAlt ?? input.title;

  return {
    title: input.absoluteTitle ? { absolute: input.title } : input.title,
    description: input.description,
    keywords: input.keywords,
    alternates: buildLocaleAlternates(input.path, input.locale),
    robots: input.noindex
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      title: input.title,
      description: input.description,
      url: new URL(input.path, siteConfig.url).toString(),
      siteName: siteConfig.name,
      type: input.type ?? "website",
      images: [{ url: image, width: 1200, height: 630, alt: imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [image],
    },
  };
}
