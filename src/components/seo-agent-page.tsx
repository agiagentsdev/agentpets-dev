import type { Metadata } from "next";
import Link from "next/link";

import { ArrowRight, Check, Code2, Share2, Sparkles } from "lucide-react";

import { getDexNumberMap } from "@/lib/dex";
import { searchPets } from "@/lib/pet-search";
import { getApprovedPetCount } from "@/lib/pets";
import {
  getSeoAgentPage,
  type SeoAgentSlug,
  seoAgentBreadcrumb,
  seoAgentInstallCommand,
  seoAgentUrl,
  seoText,
} from "@/lib/seo-agent-pages";
import { createPageMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/site-config";

import { CommandLine } from "@/components/command-line";
import { JsonLd } from "@/components/json-ld";
import { PetGallery } from "@/components/pet-gallery";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

import { hasLocale, type Locale } from "@/i18n/config";

type Params = Promise<{ locale: string }>;

const workflowLinks = [
  { href: "/codex-pets", label: "Codex pets" },
  { href: "/claude-code-pets", label: "Claude Code pets" },
  { href: "/cursor-pets", label: "Cursor pets" },
  { href: "/gemini-cli-pets", label: "Gemini CLI pets" },
  { href: "/github-copilot-pets", label: "GitHub Copilot pets" },
  { href: "/google-antigravity-pets", label: "Google Antigravity pets" },
  { href: "/windsurf-pets", label: "Windsurf pets" },
  { href: "/opencode-pets", label: "OpenCode pets" },
  { href: "/terminal-ai-agent-pets", label: "Terminal AI agent pets" },
  { href: "/ai-code-editor-pets", label: "AI code editor pets" },
];

export async function generateSeoAgentMetadata(
  slug: SeoAgentSlug,
  params: Params,
): Promise<Metadata> {
  const { locale } = await params;
  const localeValue = hasLocale(locale) ? locale : "en";
  const page = getSeoAgentPage(slug);
  const title = seoText(page.metaTitle, localeValue);
  const description = seoText(page.metaDescription, localeValue);

  return createPageMetadata({
    title,
    description,
    path: `/${slug}`,
    locale: localeValue,
    keywords: [
      ...page.keywords,
      page.agentName,
      `${page.agentName} pets`,
      "AI coding pets",
      "developer mascot",
      "Codex pet",
      "AgentPets",
    ],
  });
}

export async function SeoAgentPage({
  slug,
  params,
}: {
  slug: SeoAgentSlug;
  params: Params;
}) {
  const { locale } = await params;
  const localeValue = (hasLocale(locale) ? locale : "en") as Locale;
  const page = getSeoAgentPage(slug);
  const [initialSearch, totalPets, dexMap] = await Promise.all([
    searchPets({ limit: 12, cursor: 0, sort: "curated" }),
    getApprovedPetCount(),
    getDexNumberMap(),
  ]);
  const command = seoAgentInstallCommand(slug);
  const breadcrumbs = seoAgentBreadcrumb(slug, localeValue);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: seoText(page.title, localeValue),
      description: seoText(page.metaDescription, localeValue),
      url: seoAgentUrl(slug),
      isPartOf: { "@type": "WebSite", "@id": `${siteConfig.url}/#website` },
      about: page.agentName,
      mainEntity: {
        "@type": "SoftwareApplication",
        name: siteConfig.name,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "macOS, Windows, Linux",
        url: siteConfig.url,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faq.map((item) => ({
        "@type": "Question",
        name: seoText(item.q, localeValue),
        acceptedAnswer: {
          "@type": "Answer",
          text: seoText(item.a, localeValue),
        },
      })),
    },
  ];

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <JsonLd data={jsonLd} />
      <SiteHeader />
      <section className="petdex-cloud relative -mt-[84px] overflow-clip pt-[84px]">
        <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-5 pb-12 md:px-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
          <div className="mt-12 md:mt-16">
            <p className="font-mono text-xs tracking-[0.22em] text-brand uppercase">
              {seoText(page.eyebrow, localeValue)}
            </p>
            <h1 className="mt-3 max-w-4xl text-balance text-[44px] leading-[0.98] font-semibold tracking-tight md:text-[76px]">
              {seoText(page.title, localeValue)}
            </h1>
            <p className="mt-5 max-w-2xl text-balance text-base leading-7 text-muted-1 md:text-lg">
              {seoText(page.description, localeValue)}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <CommandLine
                command={command}
                source={`seo-${slug}`}
                className="w-full sm:w-auto"
              />
              <Link
                href="#gallery"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-inverse px-5 text-sm font-medium text-on-inverse transition hover:bg-inverse-hover"
              >
                Browse pets
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          <aside className="rounded-3xl border border-border-base bg-surface/70 p-5 shadow-sm backdrop-blur">
            <p className="font-mono text-[11px] tracking-[0.22em] text-muted-3 uppercase">
              Developer workflow
            </p>
            <div className="mt-4 grid gap-3">
              <Metric
                icon={<Code2 className="size-4" />}
                label={page.agentName}
              />
              <Metric
                icon={<Sparkles className="size-4" />}
                label={`${totalPets.toLocaleString("en-US")} pets indexed`}
              />
              <Metric
                icon={<Share2 className="size-4" />}
                label="Shareable install commands"
              />
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1440px] gap-8 px-5 py-12 md:px-8 md:py-16 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="font-mono text-xs tracking-[0.22em] text-brand uppercase">
            Why it matters
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-5xl">
            A small mascot is a durable sharing loop for developer tools.
          </h2>
        </div>
        <div className="grid gap-3">
          {page.useCases.map((item) => (
            <div
              key={seoText(item, "en")}
              className="flex gap-3 rounded-2xl border border-border-base bg-surface p-4"
            >
              <Check className="mt-1 size-4 shrink-0 text-brand" />
              <p className="text-sm leading-6 text-muted-2">
                {seoText(item, localeValue)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1440px] px-5 py-8 md:px-8">
        <div className="rounded-3xl border border-border-base bg-surface p-5 md:p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-xs tracking-[0.22em] text-brand uppercase">
                Explore by workflow
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
                Internal links for every AI coding surface.
              </h2>
            </div>
            <Link
              href="/topics/agent-first-coding-tools"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline"
            >
              View topic hub
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {workflowLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-border-base bg-background px-3 py-1.5 text-sm text-muted-2 transition hover:border-border-strong hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section
        id="gallery"
        className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-5 py-12 md:px-8 md:py-16"
      >
        <div className="max-w-2xl">
          <p className="font-mono text-xs tracking-[0.22em] text-brand uppercase">
            Pet gallery
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
            Start with the public gallery, then design your own.
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-2">
            AgentPets currently reads the Petdex-compatible gallery format while
            building toward first-party pet design, curated collections, and
            multi-agent runtime support.
          </p>
        </div>
        <PetGallery
          initial={initialSearch}
          totalPets={totalPets}
          dexMap={Object.fromEntries(dexMap.entries())}
          ads={[]}
        />
      </section>

      <section className="mx-auto grid w-full max-w-[1440px] gap-4 px-5 py-12 md:grid-cols-2 md:px-8 md:py-16">
        {page.faq.map((item) => (
          <article
            key={seoText(item.q, "en")}
            className="rounded-2xl border border-border-base bg-surface p-5"
          >
            <h2 className="text-lg font-semibold text-foreground">
              {seoText(item.q, localeValue)}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-2">
              {seoText(item.a, localeValue)}
            </p>
          </article>
        ))}
      </section>

      <SiteFooter />
    </main>
  );
}

function Metric({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-background/70 p-3">
      <span className="grid size-9 place-items-center rounded-xl bg-brand-tint text-brand">
        {icon}
      </span>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </div>
  );
}
