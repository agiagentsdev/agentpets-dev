import type { Metadata } from "next";
import Link from "next/link";
import type { ReactElement } from "react";

import { ArrowRight, BadgeCheck, Code2, Database, Frame } from "lucide-react";

import { buildLocaleAlternates } from "@/lib/locale-routing";
import { siteConfig, siteUrl } from "@/lib/site-config";

import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

import { hasLocale } from "@/i18n/config";

type Props = { params: Promise<{ locale: string }> };

export const revalidate = 86400;

const endpoints = [
  {
    method: "GET",
    path: "/api/v1/pets",
    title: "List public pets",
    description:
      "Paginated public catalog with assets, install commands, metrics, creator credit, and share URLs.",
    query: "limit, cursor, q, kind, vibe, sort",
    example: "https://agentpets.dev/api/v1/pets?limit=12&sort=popular",
  },
  {
    method: "GET",
    path: "/api/v1/pets/{slug}",
    title: "Fetch one pet",
    description:
      "Canonical API payload for a pet page, badge, embed, CLI install, and custom integrations.",
    query: "slug",
    example: "https://agentpets.dev/api/v1/pets/boba",
  },
  {
    method: "GET",
    path: "/api/v1/creators",
    title: "List top creators",
    description:
      "Creator leaderboard payload for community pages, bots, and launch widgets.",
    query: "metric, limit",
    example: "https://agentpets.dev/api/v1/creators?metric=pets&limit=10",
  },
  {
    method: "GET",
    path: "/api/v1/badge/{slug}",
    title: "README badge",
    description:
      "Cacheable SVG badge for GitHub READMEs, docs, launch posts, and creator profiles.",
    query: "slug",
    example: "https://agentpets.dev/api/v1/badge/boba",
  },
  {
    method: "GET",
    path: "/api/v1/embed/{slug}",
    title: "Embed snippet",
    description:
      "Returns an iframe snippet plus the public pet payload for websites that want a drop-in card.",
    query: "slug",
    example: "https://agentpets.dev/api/v1/embed/boba",
  },
] as const;

const snippets = [
  {
    title: "Install a pet",
    code: "npx -y https://github.com/agiagentsdev/agentpets-dev/releases/latest/download/agentpets-cli.tgz install boba",
  },
  {
    title: "Add a README badge",
    code: "[![AgentPets](https://agentpets.dev/api/v1/badge/boba)](https://agentpets.dev/pets/boba)",
  },
  {
    title: "Embed a pet card",
    code: '<iframe src="https://agentpets.dev/embed/boba" width="320" height="420" title="Boba on AgentPets" loading="lazy"></iframe>',
  },
] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const title = "AgentPets Developer API";
  const description =
    "Build with the AgentPets public API: pets, creators, README badges, embeddable pet cards, and install commands for AI coding agents.";

  return {
    title,
    description,
    keywords: [
      "AgentPets API",
      "AI coding pets API",
      "developer mascot API",
      "GitHub README badge",
      "pet embed widget",
      "Codex pet API",
    ],
    alternates: buildLocaleAlternates(
      "/developers",
      hasLocale(locale) ? locale : undefined,
    ),
    openGraph: {
      title,
      description,
      url: siteUrl("/developers"),
      type: "website",
      siteName: siteConfig.name,
      images: [{ url: `${siteConfig.url}/api/og`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${siteConfig.url}/api/og`],
    },
  };
}

export default function DevelopersPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: "AgentPets Developer API",
      description:
        "Developer documentation for AgentPets public pets, creators, badges, and embeds.",
      url: siteUrl("/developers"),
      about: ["API", "developer mascots", "AI coding pets"],
      publisher: {
        "@type": "Organization",
        name: siteConfig.name,
        url: siteConfig.url,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "AgentPets API endpoints",
      itemListElement: endpoints.map((endpoint, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: endpoint.path,
        description: endpoint.description,
      })),
    },
  ];

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <JsonLd data={jsonLd} />
      <SiteHeader />
      <section className="petdex-cloud relative -mt-[84px] overflow-clip pt-[84px]">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 pb-12 md:px-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div className="mt-12 md:mt-16">
            <p className="font-mono text-xs tracking-[0.22em] text-brand uppercase">
              Developers
            </p>
            <h1 className="mt-3 max-w-4xl text-balance text-[42px] leading-[1] font-semibold tracking-tight md:text-[72px]">
              Build with installable AI coding pets.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-1 md:text-lg">
              AgentPets exposes versioned public endpoints for pet discovery,
              creator growth loops, README badges, and embeddable pet cards.
              Use the API for bots, launch pages, docs, and developer tools.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/api/v1/pets"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-inverse px-5 text-sm font-medium text-on-inverse transition hover:bg-inverse-hover"
              >
                Open API
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/guides/embed-pet-widget"
                className="inline-flex h-11 items-center justify-center rounded-full border border-border-base bg-surface px-5 text-sm font-medium text-muted-2 transition hover:border-border-strong hover:text-foreground"
              >
                Embed guide
              </Link>
            </div>
          </div>
          <aside className="rounded-2xl border border-border-base bg-surface/80 p-5 shadow-sm">
            <p className="font-mono text-[11px] tracking-[0.18em] text-muted-3 uppercase">
              Public surfaces
            </p>
            <div className="mt-4 grid gap-3">
              <ApiSurface icon={<Database />} label="Catalog API" />
              <ApiSurface icon={<BadgeCheck />} label="SVG badges" />
              <ApiSurface icon={<Frame />} label="Embeds" />
              <ApiSurface icon={<Code2 />} label="CLI commands" />
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-5 py-12 md:px-8 md:py-16">
        <div>
          <p className="font-mono text-xs tracking-[0.22em] text-brand uppercase">
            API reference
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
            Stable v1 endpoints for pets, creators, badges, and embeds.
          </h2>
        </div>
        <div className="grid gap-3">
          {endpoints.map((endpoint) => (
            <article
              key={endpoint.path}
              className="grid gap-4 rounded-2xl border border-border-base bg-surface p-5 md:grid-cols-[210px_1fr]"
            >
              <div>
                <span className="inline-flex rounded-full bg-brand/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-brand">
                  {endpoint.method}
                </span>
                <p className="mt-3 break-all font-mono text-sm text-foreground">
                  {endpoint.path}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold tracking-tight">
                  {endpoint.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-2">
                  {endpoint.description}
                </p>
                <dl className="mt-4 grid gap-2 text-xs md:grid-cols-2">
                  <div>
                    <dt className="font-mono tracking-[0.16em] text-muted-3 uppercase">
                      Query
                    </dt>
                    <dd className="mt-1 text-muted-2">{endpoint.query}</dd>
                  </div>
                  <div>
                    <dt className="font-mono tracking-[0.16em] text-muted-3 uppercase">
                      Example
                    </dt>
                    <dd className="mt-1 break-all text-muted-2">
                      {endpoint.example}
                    </dd>
                  </div>
                </dl>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-5 pb-16 md:grid-cols-3 md:px-8">
        {snippets.map((snippet) => (
          <article
            key={snippet.title}
            className="rounded-2xl border border-border-base bg-surface p-5"
          >
            <h2 className="text-xl font-semibold tracking-tight">
              {snippet.title}
            </h2>
            <pre className="mt-4 overflow-x-auto rounded-xl border border-border-base bg-background p-4 text-xs leading-6 text-muted-2">
              <code>{snippet.code}</code>
            </pre>
          </article>
        ))}
      </section>

      <SiteFooter />
    </main>
  );
}

function ApiSurface({
  icon,
  label,
}: {
  icon: ReactElement<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border-base bg-background px-3 py-2 text-sm text-muted-2">
      <span className="[&>svg]:size-4 [&>svg]:text-brand">{icon}</span>
      {label}
    </div>
  );
}
