import type { Metadata } from "next";
import Link from "next/link";

import { ArrowRight, BookOpen } from "lucide-react";

import { buildLocaleAlternates } from "@/lib/locale-routing";
import { guides } from "@/lib/seo-content";
import { siteConfig, siteUrl } from "@/lib/site-config";

import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

import { hasLocale } from "@/i18n/config";

type Props = { params: Promise<{ locale: string }> };

export const revalidate = 86400;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const title = "AgentPets guides for builders and creators";
  const description =
    "Practical guides for installing, creating, submitting, badging, and embedding AI coding pets.";

  return {
    title,
    description,
    alternates: buildLocaleAlternates(
      "/guides",
      hasLocale(locale) ? locale : undefined,
    ),
    openGraph: {
      title,
      description,
      url: siteUrl("/guides"),
      type: "website",
      siteName: siteConfig.name,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function GuidesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "AgentPets guides",
    description:
      "Guides for installing, creating, submitting, badging, and embedding AgentPets.",
    url: siteUrl("/guides"),
    isPartOf: { "@type": "WebSite", "@id": `${siteConfig.url}/#website` },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: guides.map((guide, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: guide.title,
        url: siteUrl(`/guides/${guide.slug}`),
      })),
    },
  };

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <JsonLd data={jsonLd} />
      <SiteHeader />
      <section className="petdex-cloud relative -mt-[84px] overflow-clip pt-[84px]">
        <div className="mx-auto flex w-full max-w-6xl flex-col px-5 pb-12 md:px-8">
          <div className="mt-12 max-w-3xl md:mt-16">
            <p className="font-mono text-xs tracking-[0.22em] text-brand uppercase">
              Guides
            </p>
            <h1 className="mt-3 text-balance text-[42px] leading-[1] font-semibold tracking-tight md:text-[68px]">
              Practical guides for shipping pets that spread.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-1 md:text-lg">
              Install, create, submit, badge, and embed AgentPets with stable
              URLs developers can copy into docs, READMEs, and launches.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-5 py-12 md:grid-cols-2 md:px-8 md:py-16">
        {guides.map((guide) => (
          <Link
            key={guide.slug}
            href={`/guides/${guide.slug}`}
            className="group flex min-h-64 flex-col justify-between rounded-2xl border border-border-base bg-surface p-5 transition hover:-translate-y-0.5 hover:border-border-strong hover:shadow-lg hover:shadow-blue-950/5"
          >
            <div>
              <div className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand">
                <BookOpen className="size-5" />
              </div>
              <p className="mt-5 font-mono text-[11px] tracking-[0.18em] text-muted-3 uppercase">
                {guide.minutes} min guide
              </p>
              <h2 className="mt-2 text-balance text-2xl font-semibold tracking-tight">
                {guide.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-2">
                {guide.description}
              </p>
            </div>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-brand">
              Read guide
              <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </section>
      <SiteFooter />
    </main>
  );
}
