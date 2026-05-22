import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowRight, CheckCircle2 } from "lucide-react";

import { buildLocaleAlternates } from "@/lib/locale-routing";
import { getTopicHub, topicHubs, topicHubUrl } from "@/lib/seo-content";
import { siteConfig } from "@/lib/site-config";

import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

import { hasLocale } from "@/i18n/config";

type Props = { params: Promise<{ locale: string; slug: string }> };

export const revalidate = 86400;

export function generateStaticParams() {
  return topicHubs.map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const topic = getTopicHub(slug);
  if (!topic) return { title: "Topic not found", robots: { index: false } };

  return {
    title: topic.metaTitle,
    description: topic.description,
    keywords: topic.keywords,
    alternates: buildLocaleAlternates(
      `/topics/${topic.slug}`,
      hasLocale(locale) ? locale : undefined,
    ),
    openGraph: {
      title: topic.metaTitle,
      description: topic.description,
      url: topicHubUrl(topic.slug),
      type: "article",
      siteName: siteConfig.name,
      images: [{ url: `${siteConfig.url}/api/og`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: topic.metaTitle,
      description: topic.description,
      images: [`${siteConfig.url}/api/og`],
    },
  };
}

export default async function TopicPage({ params }: Props) {
  const { slug } = await params;
  const topic = getTopicHub(slug);
  if (!topic) notFound();

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: topic.title,
      description: topic.description,
      url: topicHubUrl(topic.slug),
      isPartOf: { "@type": "WebSite", "@id": `${siteConfig.url}/#website` },
      mainEntity: {
        "@type": "ItemList",
        itemListElement: topic.sections.flatMap((section, sectionIndex) =>
          section.links.map((link, linkIndex) => ({
            "@type": "ListItem",
            position: sectionIndex * 10 + linkIndex + 1,
            name: link.label,
            url: new URL(link.href, siteConfig.url).toString(),
          })),
        ),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: topic.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
  ];

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <JsonLd data={jsonLd} />
      <SiteHeader />
      <section className="petdex-cloud relative -mt-[84px] overflow-clip pt-[84px]">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 pb-12 md:px-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div className="mt-12 md:mt-16">
            <p className="font-mono text-xs tracking-[0.22em] text-brand uppercase">
              {topic.eyebrow}
            </p>
            <h1 className="mt-3 max-w-4xl text-balance text-[40px] leading-[1] font-semibold tracking-tight md:text-[68px]">
              {topic.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-1 md:text-lg">
              {topic.intro}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href={topic.primaryCta.href}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-inverse px-5 text-sm font-medium text-on-inverse transition hover:bg-inverse-hover"
              >
                {topic.primaryCta.label}
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href={topic.secondaryCta.href}
                className="inline-flex h-11 items-center justify-center rounded-full border border-border-base bg-surface px-5 text-sm font-medium text-muted-2 transition hover:border-border-strong hover:text-foreground"
              >
                {topic.secondaryCta.label}
              </Link>
            </div>
          </div>
          <aside className="rounded-2xl border border-border-base bg-surface/80 p-5 shadow-sm">
            <p className="font-mono text-[11px] tracking-[0.18em] text-muted-3 uppercase">
              Search intents
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {topic.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full border border-border-base bg-background px-3 py-1 text-xs text-muted-2"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-5 px-5 py-12 md:px-8 md:py-16">
        {topic.sections.map((section) => (
          <article
            key={section.title}
            className="grid gap-5 border-t border-border-base py-8 md:grid-cols-[0.85fr_1.15fr]"
          >
            <div>
              <CheckCircle2 className="size-5 text-brand" />
              <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
                {section.title}
              </h2>
            </div>
            <div>
              <p className="text-base leading-7 text-muted-2">
                {section.body}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {section.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex h-9 items-center rounded-full border border-border-base bg-surface px-3 text-sm font-medium text-muted-2 transition hover:border-border-strong hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-5 pb-14 md:grid-cols-2 md:px-8">
        {topic.faqs.map((faq) => (
          <div
            key={faq.question}
            className="rounded-2xl border border-border-base bg-surface p-5"
          >
            <h2 className="text-lg font-semibold tracking-tight">
              {faq.question}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-2">{faq.answer}</p>
          </div>
        ))}
      </section>
      <SiteFooter />
    </main>
  );
}
