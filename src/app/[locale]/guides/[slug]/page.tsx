import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowRight, CheckCircle2, Copy } from "lucide-react";

import { buildLocaleAlternates } from "@/lib/locale-routing";
import { getGuide, guides, guideUrl } from "@/lib/seo-content";
import { siteConfig } from "@/lib/site-config";

import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

import { hasLocale } from "@/i18n/config";

type Props = { params: Promise<{ locale: string; slug: string }> };

export const revalidate = 86400;

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return { title: "Guide not found", robots: { index: false } };

  return {
    title: guide.metaTitle,
    description: guide.description,
    keywords: guide.keywords,
    alternates: buildLocaleAlternates(
      `/guides/${guide.slug}`,
      hasLocale(locale) ? locale : undefined,
    ),
    openGraph: {
      title: guide.metaTitle,
      description: guide.description,
      url: guideUrl(guide.slug),
      type: "article",
      siteName: siteConfig.name,
      images: [{ url: `${siteConfig.url}/api/og`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: guide.metaTitle,
      description: guide.description,
      images: [`${siteConfig.url}/api/og`],
    },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: guide.title,
      description: guide.description,
      totalTime: `PT${guide.minutes}M`,
      url: guideUrl(guide.slug),
      step: guide.steps.map((step, index) => ({
        "@type": "HowToStep",
        position: index + 1,
        name: step.title,
        text: step.body,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: guide.faqs.map((faq) => ({
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
        <div className="mx-auto flex w-full max-w-4xl flex-col px-5 pb-12 md:px-8">
          <div className="mt-12 md:mt-16">
            <p className="font-mono text-xs tracking-[0.22em] text-brand uppercase">
              {guide.eyebrow} - {guide.minutes} min
            </p>
            <h1 className="mt-3 text-balance text-[40px] leading-[1] font-semibold tracking-tight md:text-[68px]">
              {guide.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-1 md:text-lg">
              {guide.description}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-4xl gap-6 px-5 py-12 md:px-8 md:py-16">
        {guide.steps.map((step, index) => (
          <article
            key={step.title}
            className="grid gap-4 rounded-2xl border border-border-base bg-surface p-5 md:grid-cols-[52px_1fr]"
          >
            <div className="grid size-11 place-items-center rounded-full bg-brand/10 font-mono text-sm font-semibold text-brand">
              {index + 1}
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                {step.title}
              </h2>
              <p className="mt-3 text-base leading-7 text-muted-2">
                {step.body}
              </p>
              {step.command ? (
                <pre className="mt-4 overflow-x-auto rounded-xl border border-border-base bg-background p-4 text-sm text-muted-1">
                  <code>{step.command}</code>
                </pre>
              ) : null}
            </div>
          </article>
        ))}
      </section>

      <section className="mx-auto grid w-full max-w-4xl gap-4 px-5 pb-14 md:grid-cols-2 md:px-8">
        <div className="rounded-2xl border border-border-base bg-surface p-5">
          <CheckCircle2 className="size-5 text-brand" />
          <h2 className="mt-3 text-xl font-semibold tracking-tight">
            Related next steps
          </h2>
          <div className="mt-4 flex flex-col gap-2">
            {guide.related.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center justify-between rounded-xl border border-border-base bg-background px-3 py-2 text-sm font-medium text-muted-2 transition hover:border-border-strong hover:text-foreground"
              >
                {link.label}
                <ArrowRight className="size-4" />
              </Link>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border-base bg-surface p-5">
          <Copy className="size-5 text-brand" />
          <h2 className="mt-3 text-xl font-semibold tracking-tight">
            Useful API surfaces
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-2">
            Public API, badges, and embeds are versioned under stable URLs so
            README snippets and integrations can keep working as the product
            evolves.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link className="rounded-full border border-border-base px-3 py-1 text-xs" href="/api/v1/pets">
              /api/v1/pets
            </Link>
            <Link className="rounded-full border border-border-base px-3 py-1 text-xs" href="/api/v1/badge/boba">
              /api/v1/badge/boba
            </Link>
            <Link className="rounded-full border border-border-base px-3 py-1 text-xs" href="/embed/boba">
              /embed/boba
            </Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
