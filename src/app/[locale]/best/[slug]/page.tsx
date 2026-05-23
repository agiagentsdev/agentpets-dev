import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowRight, BadgeCheck, Share2, Trophy } from "lucide-react";

import { JsonLd } from "@/components/json-ld";
import { PetGallery } from "@/components/pet-gallery";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

import { hasLocale, locales } from "@/i18n/config";
import { allBestPages, getBestPage } from "@/lib/best-pages";
import { getDexNumberMap } from "@/lib/dex";
import { searchPets } from "@/lib/pet-search";
import { createPageMetadata } from "@/lib/seo/metadata";
import { siteConfig, siteUrl } from "@/lib/site-config";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 86400;

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    allBestPages().map((page) => ({ locale, slug: page.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = getBestPage(slug);
  if (!page) return { title: "Best pets not found", robots: { index: false } };

  return createPageMetadata({
    title: page.metaTitle,
    description: page.description,
    path: `/best/${page.slug}`,
    locale: hasLocale(locale) ? locale : "en",
    keywords: page.keywords,
  });
}

export default async function BestPetsPage({ params }: Props) {
  const { slug } = await params;
  const page = getBestPage(slug);
  if (!page) notFound();

  const [result, dexMap] = await Promise.all([
    searchPets({
      q: page.query,
      kinds: page.kinds,
      vibes: page.vibes,
      sort: page.sort,
      limit: 24,
    }),
    getDexNumberMap(),
  ]);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: page.title,
      description: page.description,
      url: siteUrl(`/best/${page.slug}`),
      isPartOf: { "@type": "WebSite", "@id": `${siteConfig.url}/#website` },
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: page.title,
      itemListElement: result.pets.map((pet, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: pet.displayName,
        url: siteUrl(`/pets/${pet.slug}`),
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faqs.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
  ];

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <JsonLd data={jsonLd} />
      <SiteHeader />
      <section className="petdex-cloud relative -mt-[84px] overflow-clip pt-[84px]">
        <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-5 pb-12 md:px-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-end">
          <div className="mt-12 md:mt-16">
            <p className="font-mono text-xs tracking-[0.22em] text-brand uppercase">
              Best pets
            </p>
            <h1 className="mt-3 max-w-4xl text-balance text-[42px] leading-[1] font-semibold tracking-tight md:text-[72px]">
              {page.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-1 md:text-lg">
              {page.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="#pets"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-inverse px-5 text-sm font-medium text-on-inverse transition hover:bg-inverse-hover"
              >
                Browse ranked pets
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/pet-builder"
                className="inline-flex h-11 items-center justify-center rounded-full border border-border-base bg-surface px-5 text-sm font-medium text-muted-2 transition hover:border-border-strong hover:text-foreground"
              >
                Build your own
              </Link>
            </div>
          </div>
          <aside className="rounded-2xl border border-border-base bg-surface/80 p-5 shadow-sm">
            <p className="font-mono text-[11px] tracking-[0.2em] text-muted-3 uppercase">
              Ranking signals
            </p>
            <div className="mt-4 grid gap-3">
              <Signal icon={<Trophy />} label={`Sorted by ${page.sort}`} />
              <Signal icon={<BadgeCheck />} label="Approved pets only" />
              <Signal icon={<Share2 />} label="Badges and embeds ready" />
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1440px] gap-8 px-5 py-12 md:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="font-mono text-xs tracking-[0.22em] text-brand uppercase">
            Selection notes
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
            Pick pets that are easy to install, credit, and share.
          </h2>
        </div>
        <div className="rounded-2xl border border-border-base bg-surface p-5 text-sm leading-7 text-muted-2">
          {page.intro}
        </div>
      </section>

      <section
        id="pets"
        className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-5 py-12 md:px-8 md:py-16"
      >
        <PetGallery
          initial={result}
          totalPets={result.total ?? result.pets.length}
          dexMap={Object.fromEntries(dexMap.entries())}
          ads={[]}
        />
      </section>

      <section className="mx-auto grid w-full max-w-[1440px] gap-4 px-5 py-12 md:grid-cols-2 md:px-8">
        <article className="rounded-2xl border border-border-base bg-surface p-5">
          <h2 className="text-xl font-semibold tracking-tight">
            Related pages
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {page.related.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-border-base bg-background px-3 py-1.5 text-sm text-muted-2 transition hover:border-border-strong hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </article>
        <article className="rounded-2xl border border-border-base bg-surface p-5">
          <h2 className="text-xl font-semibold tracking-tight">FAQ</h2>
          <div className="mt-4 space-y-3">
            {page.faqs.map((item) => (
              <details key={item.question} className="rounded-xl bg-background p-3">
                <summary className="cursor-pointer text-sm font-semibold">
                  {item.question}
                </summary>
                <p className="mt-2 text-sm leading-6 text-muted-2">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </article>
      </section>

      <SiteFooter />
    </main>
  );
}

function Signal({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border-base bg-background px-3 py-2 text-sm text-muted-2">
      <span className="[&>svg]:size-4 [&>svg]:text-brand">{icon}</span>
      {label}
    </div>
  );
}
