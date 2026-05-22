import type { Metadata } from "next";
import Link from "next/link";

import { ArrowRight, Network } from "lucide-react";

import { buildLocaleAlternates } from "@/lib/locale-routing";
import { topicHubs } from "@/lib/seo-content";
import { siteConfig, siteUrl } from "@/lib/site-config";

import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

import { hasLocale } from "@/i18n/config";

type Props = { params: Promise<{ locale: string }> };

export const revalidate = 86400;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const title = "AgentPets topic hubs for AI coding pets";
  const description =
    "Explore topic hubs for AI coding pets, developer mascots, Pet Builder workflows, and public AgentPets integrations.";

  return {
    title,
    description,
    alternates: buildLocaleAlternates(
      "/topics",
      hasLocale(locale) ? locale : undefined,
    ),
    openGraph: {
      title,
      description,
      url: siteUrl("/topics"),
      type: "website",
      siteName: siteConfig.name,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function TopicsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "AgentPets topic hubs",
    description:
      "Topic hubs connecting AI coding pet searches to useful galleries, guides, APIs, and creator surfaces.",
    url: siteUrl("/topics"),
    isPartOf: { "@type": "WebSite", "@id": `${siteConfig.url}/#website` },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: topicHubs.map((topic, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: topic.title,
        url: siteUrl(`/topics/${topic.slug}`),
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
              Topic hubs
            </p>
            <h1 className="mt-3 text-balance text-[42px] leading-[1] font-semibold tracking-tight md:text-[68px]">
              SEO hubs for AI coding pets and developer mascots.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-1 md:text-lg">
              Each hub links search intent to real product surfaces: galleries,
              guides, builder flows, public API routes, badges, embeds, and
              creator pages.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-5 py-12 md:grid-cols-3 md:px-8 md:py-16">
        {topicHubs.map((topic) => (
          <Link
            key={topic.slug}
            href={`/topics/${topic.slug}`}
            className="group flex min-h-72 flex-col justify-between rounded-2xl border border-border-base bg-surface p-5 transition hover:-translate-y-0.5 hover:border-border-strong hover:shadow-lg hover:shadow-blue-950/5"
          >
            <div>
              <div className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand">
                <Network className="size-5" />
              </div>
              <p className="mt-5 font-mono text-[11px] tracking-[0.18em] text-muted-3 uppercase">
                {topic.eyebrow}
              </p>
              <h2 className="mt-2 text-balance text-2xl font-semibold tracking-tight">
                {topic.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-2">
                {topic.description}
              </p>
            </div>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-brand">
              Open hub
              <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </section>
      <SiteFooter />
    </main>
  );
}
