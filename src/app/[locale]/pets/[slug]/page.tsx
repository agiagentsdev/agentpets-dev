import Link from "next/link";
import { notFound } from "next/navigation";

import { Layers, Shuffle, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { getCollectionsContainingPet } from "@/lib/collections";
import { formatDexNumber, getDexEntryMap } from "@/lib/dex";
import { buildLocaleAlternates } from "@/lib/locale-routing";
import { resolveStoredOwnerCreditForSlug } from "@/lib/owner-credit";
import {
  petCanonicalUrl,
  type ResolvedPetSeo,
  resolvePetSeo,
} from "@/lib/pet-seo";
import { getPet, getStaticPetSlugs } from "@/lib/pets";
import { siteConfig } from "@/lib/site-config";
import type { PetdexPet } from "@/lib/types";
import { getVariantsFor } from "@/lib/variants";

import { ClaimCTA } from "@/components/claim-cta";
import { CreatorShareKit } from "@/components/creator-share-kit";
import { InstallCommand } from "@/components/install-command";
import { InstallCommandCompact } from "@/components/install-command-compact";
import { JsonLd } from "@/components/json-ld";
import { LikeButton } from "@/components/like-button";
import { OpenInPetdexButton } from "@/components/open-in-petdex-button";
import { OwnerPetControls } from "@/components/owner-pet-controls";
import {
  PetActionMenu,
  PetTakedownReportButton,
} from "@/components/pet-action-menu";
import { PetCountersBar } from "@/components/pet-counters-bar";
import { PetFloater } from "@/components/pet-floater";
import { PetKeyboardNav } from "@/components/pet-keyboard-nav";
import { PetPageAnalytics } from "@/components/pet-page-analytics";
import { PetRadarClient } from "@/components/pet-radar-client";
import { PetSoundButton } from "@/components/pet-sound-button";
import { PetSprite } from "@/components/pet-sprite";
import { PetStateViewer } from "@/components/pet-state-viewer";
import { ReducedMotionHint } from "@/components/reduced-motion-hint";
import { SaveAsSticker } from "@/components/save-as-sticker";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StaticPetSprite } from "@/components/static-pet-sprite";
import { SubmittedBy } from "@/components/submitted-by";

import { hasLocale } from "@/i18n/config";

type PageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export const dynamicParams = true;
// Long ISR window — the shell is byte-stable (metrics fetched
// client-side), so the page only needs to regenerate when its
// editorial fields change. Write paths call revalidateTag('pet:${slug}')
// to flush immediately on edit/withdraw/claim/feature.
export const revalidate = 86400;

type DexNavPet = {
  slug: string;
  displayName: string;
  dexNumber: number;
};

export async function generateStaticParams() {
  if (process.env.PETDEX_MOCK_SKIP_DB_BOOTSTRAP === "1") return [];
  try {
    const slugs = await getStaticPetSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch (error) {
    console.warn(
      "[pets] skipped static pet generation; database is not ready:",
      error instanceof Error ? error.message : String(error),
    );
    return [];
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { slug, locale } = await params;
  const pet = await getPet(slug);

  if (!pet) {
    return {
      title: "Pet not found",
      robots: { index: false, follow: false },
    };
  }

  const seo = resolvePetSeo(pet);
  const title = seo.title;
  const description = seo.description;
  const url = petCanonicalUrl(pet.slug);

  return {
    title,
    description,
    alternates: buildLocaleAlternates(
      `/pets/${pet.slug}`,
      hasLocale(locale) ? locale : undefined,
    ),
    keywords: [...seo.keywords],
    openGraph: {
      title,
      description,
      url,
      type: "article",
      // Pin to the locale-stripped path. The auto-detected URL from
      // opengraph-image.tsx includes the [locale] segment, which
      // next-intl 307-redirects under localePrefix="as-needed". Most
      // OG scrapers don't follow redirects and fall back to the
      // generic site image.
      images: [
        {
          url: `${siteConfig.url}/pets/${pet.slug}/opengraph-image`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${siteConfig.url}/pets/${pet.slug}/opengraph-image`],
    },
  };
}

export default async function PetPage({ params }: PageProps) {
  const { slug } = await params;
  const pet = await getPet(slug);
  const tPet = await getTranslations("pet");

  if (!pet) {
    notFound();
  }

  const dexMap = await getDexEntryMap();
  const currentDexNumber = dexMap.get(slug)?.dexNumber ?? null;

  let prevSlug: string | null = null;
  let nextSlug: string | null = null;
  if (currentDexNumber != null) {
    for (const [entrySlug, entry] of dexMap.entries()) {
      if (entry.dexNumber === currentDexNumber - 1) prevSlug = entrySlug;
      if (entry.dexNumber === currentDexNumber + 1) nextSlug = entrySlug;
    }
  }

  const prevEntry = prevSlug ? dexMap.get(prevSlug) : undefined;
  const nextEntry = nextSlug ? dexMap.get(nextSlug) : undefined;
  const prevPet =
    prevSlug && prevEntry
      ? {
          slug: prevSlug,
          displayName: prevEntry.displayName,
          dexNumber: prevEntry.dexNumber,
        }
      : null;
  const nextPet =
    nextSlug && nextEntry
      ? {
          slug: nextSlug,
          displayName: nextEntry.displayName,
          dexNumber: nextEntry.dexNumber,
        }
      : null;

  const [ownerCreditResult, variants, memberOfCollections] = await Promise.all([
    resolveStoredOwnerCreditForSlug(slug),
    getVariantsFor(slug),
    getCollectionsContainingPet(slug),
  ]);
  const ownerCredit = ownerCreditResult?.credit ?? null;

  const url = petCanonicalUrl(pet.slug);
  const seo = resolvePetSeo(pet);
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      "@id": `${url}#pet`,
      name: pet.displayName,
      description: seo.description,
      url,
      image: pet.spritesheetPath,
      keywords: seo.keywords.join(", "),
      genre: pet.kind,
      datePublished: pet.importedAt,
      isPartOf: { "@type": "WebSite", "@id": `${siteConfig.url}/#website` },
      ...(ownerCredit
        ? {
            creator: {
              "@type": "Person",
              name: ownerCredit.name,
              ...(ownerCredit.externals[0]
                ? { url: ownerCredit.externals[0].url }
                : {}),
              ...(ownerCredit.imageUrl ? { image: ownerCredit.imageUrl } : {}),
            },
          }
        : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: siteConfig.name,
          item: siteConfig.url,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Pets",
          item: `${siteConfig.url}/#gallery`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: pet.displayName,
          item: url,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: seo.faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ];

  const shuffleHref = `/api/pets/random?exclude=${encodeURIComponent(pet.slug)}`;
  const petPageUrl = `${siteConfig.url}/pets/${pet.slug}`;
  const badgeMarkdown = `[![AgentPets: ${pet.displayName}](${siteConfig.url}/api/v1/badge/${pet.slug})](${petPageUrl}?ref=badge)`;
  const embedHtml = `<iframe src="${siteConfig.url}/embed/${pet.slug}" width="320" height="420" title="${pet.displayName} on AgentPets" loading="lazy"></iframe>`;

  return (
    <main className="min-h-dvh bg-background">
      <JsonLd data={jsonLd} />
      <PetPageAnalytics slug={pet.slug} />

      {/* Wire keyboard shortcuts: ←/→ for prev/next, Space for shuffle.
          Renders nothing — purely a side-effect listener. */}
      <PetKeyboardNav
        prevSlug={prevPet?.slug ?? null}
        nextSlug={nextPet?.slug ?? null}
        shuffleHref={shuffleHref}
      />

      <SiteHeader />
      {/* Hero — single full-width section with petdex-cloud gradient.
          Two-column lockup on lg+: animated sprite (the product) on the
          left, identity + CTAs on the right. Mobile collapses to a
          natural vertical stack: dex nav, sprite, info+CTAs. */}
      <section className="petdex-cloud relative -mt-[84px] overflow-visible pt-[84px]">
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 pb-8 md:gap-6 md:px-8 md:pb-14">
          {/* Dex nav strip — Pokédex chrome at the top. */}
          <nav
            aria-label={tPet("navigation.ariaLabel")}
            className="flex flex-wrap items-center justify-between gap-3"
          >
            <DexNavPill pet={prevPet} direction="prev" />
            <Link
              href={shuffleHref}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-border-base bg-surface/80 px-4 text-sm font-medium text-foreground backdrop-blur transition hover:border-border-strong"
              title={tPet("navigation.shuffleTitle")}
            >
              <Shuffle className="size-4" />
              Shuffle
              <kbd className="ml-1 rounded border border-border-base bg-surface px-1.5 py-0.5 font-mono text-[10px] tracking-[0.05em] text-muted-3">
                Space
              </kbd>
            </Link>
            <DexNavPill pet={nextPet} direction="next" />
          </nav>

          {/* Two-column hero. lg breakpoint splits sprite and info
              side-by-side; on mobile the floater stage shrinks to a
              short banner above the info so the title isn't pushed
              off-screen. The full state viewer (sprite + state tabs)
              renders below the hero. */}
          <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-10">
            {/* Left column: pet sprite stage.
                - Mobile: a static centered PetSprite (PetFloater
                  disables itself below 768px because the drag/portal
                  logic doesn't make sense on a phone).
                - md+: interactive PetFloater that wanders, idle-cycles
                  states, and reacts to drag inside this card.
                .petdex-floater-stage scopes the floater's bounds.
                Sticky on lg+ so it stays visible while the right
                column scrolls. */}
            <div className="lg:sticky lg:top-24">
              <div className="petdex-floater-stage relative h-56 w-full overflow-hidden rounded-3xl sm:h-72 lg:aspect-square lg:h-auto">
                {/* Static fallback for mobile + first paint. Anchored
                    upper-left so the pet reads like a peeking
                    character, not a centered specimen photo. Hidden
                    on md+ where the floater takes over. */}
                <span className="absolute top-2 left-3 md:hidden">
                  <PetSprite
                    src={pet.spritesheetPath}
                    state="idle"
                    scale={0.95}
                    label={`${pet.displayName} idle`}
                  />
                </span>
                {/* Interactive floater on md+ only. PetFloater
                    self-positions inside the stage. */}
                <span className="hidden md:block">
                  <PetFloater
                    src={pet.spritesheetPath}
                    petName={pet.displayName}
                    size={180}
                    initialFraction={{ x: 0.25, y: 0.3 }}
                  />
                </span>
              </div>
            </div>

            {/* Right column: identity + CTAs + meta. Order is intentional:
                eyebrow → name → description → primary CTA (Open in
                AgentPets) → secondary CTA (install command) → quick
                actions (like/sound/menu + stats) → tags → collections. */}
            <header className="flex flex-col gap-5">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                <p className="font-mono text-xs tracking-[0.22em] text-brand uppercase">
                  {pet.featured ? "Featured" : "AgentPets entry"}
                </p>
                {currentDexNumber != null ? (
                  <p className="font-mono text-xs tracking-[0.22em] text-muted-3 uppercase">
                    No. {formatDexNumber(currentDexNumber)}
                  </p>
                ) : null}
                <p className="font-mono text-xs tracking-[0.22em] text-muted-3 uppercase">
                  {pet.kind}
                </p>
              </div>

              <div className="flex flex-wrap items-start justify-between gap-4">
                <h1 className="text-balance text-[34px] leading-[0.95] font-semibold tracking-tight text-foreground sm:text-[40px] md:text-[56px]">
                  {pet.displayName}
                </h1>
                <OwnerPetControls
                  slug={pet.slug}
                  currentDisplayName={pet.displayName}
                  currentDescription={pet.description}
                />
              </div>

              <p className="text-balance text-base leading-7 text-muted-1 md:text-lg">
                {pet.description}
              </p>

              <OpenInPetdexButton slug={pet.slug} />

              {/* Secondary CTA: single-line npx command + link to the
                  full install guide. The verbose tabs/instructions
                  live under the state viewer so they don't crowd the
                  hero — anyone who needs them is already scrolling. */}
              <InstallCommandCompact
                slug={pet.slug}
                displayName={pet.displayName}
              />

              {/* Quick actions row + stats. */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <LikeButton slug={pet.slug} />
                {pet.soundUrl ? (
                  <PetSoundButton
                    soundUrl={pet.soundUrl}
                    displayName={pet.displayName}
                    labelPrefix="Play signature sound for"
                  />
                ) : null}
                <PetActionMenu
                  pet={{
                    slug: pet.slug,
                    displayName: pet.displayName,
                    zipUrl: pet.zipUrl,
                    description: pet.description,
                  }}
                  variant="detail"
                />
                <SaveAsSticker slug={pet.slug} displayName={pet.displayName} />
                <PetTakedownReportButton
                  pet={{ slug: pet.slug, displayName: pet.displayName }}
                />
                <PetCountersBar slug={pet.slug} />
              </div>

              {/* Tags + collections collapsed into compact metadata. */}
              {pet.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {pet.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-brand-tint px-2.5 py-1 text-xs font-medium text-brand dark:bg-brand-tint-dark"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}

              {memberOfCollections.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.18em] text-muted-3 uppercase">
                    <Layers className="size-3.5" />
                    Part of
                  </span>
                  {memberOfCollections.map((col) => (
                    <Link
                      key={col.slug}
                      href={`/collections/${col.slug}`}
                      className="rounded-full border border-border-base bg-surface px-2.5 py-1 text-xs font-medium text-muted-2 transition hover:border-border-strong hover:text-foreground"
                    >
                      {col.title}
                    </Link>
                  ))}
                </div>
              ) : null}
            </header>
          </div>

          {/* Keyboard hint strip — full-width footer of the hero, only
              on pointer-fine media. */}
          <p className="mt-2 hidden flex-wrap items-center gap-3 font-mono text-[11px] tracking-[0.18em] text-muted-3 uppercase md:flex">
            <span>{tPet("keyboardHint.tip")}</span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-border-base bg-surface px-1.5 py-0.5 text-[10px] text-muted-2">
                ←
              </kbd>
              <kbd className="rounded border border-border-base bg-surface px-1.5 py-0.5 text-[10px] text-muted-2">
                →
              </kbd>
              {tPet("keyboardHint.browse")}
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-border-base bg-surface px-1.5 py-0.5 text-[10px] text-muted-2">
                Space
              </kbd>
              {tPet("keyboardHint.shuffle")}
            </span>
          </p>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-12 md:px-8 md:py-16">
        {/* Lets users on Windows / macOS who disabled animations in OS
            settings know the static sprite is intentional, not a bug.
            Reported via feedback on /zh/pets/nyami where the user
            could not see the animation in Edge + Chrome. */}
        <ReducedMotionHint />

        {/* Full state viewer — sprite + state tabs lockup. Lives below
            the hero so its internal 2-column layout has the full content
            width to breathe. The hero idle preview keeps users grounded
            while they scroll into the state grid. */}
        <PetStateViewer src={pet.spritesheetPath} petName={pet.displayName} />

        <PetSeoTemplate
          pet={pet}
          seo={seo}
          collectionCount={memberOfCollections.length}
        />

        {/* Full install guide. CLI + Curl tabs, platform-specific
            terminal instructions, "Activate in Codex" steps. Lives
            under the state viewer so it doesn't crowd the hero where
            the primary CTA (Open in AgentPets Desktop) plus a compact
            one-line npx command already cover the common path. */}
        <div id="install" className="scroll-mt-24">
          <InstallCommand slug={pet.slug} displayName={pet.displayName} />
        </div>

        <CreatorShareKit
          title={`Share ${pet.displayName}`}
          subtitle="Add this pet to a README, embed it on a launch page, or share the install page with developers."
          pageUrl={petPageUrl}
          xText={`I found ${pet.displayName}, an AI coding pet on AgentPets. Install it with npx -y https://github.com/agiagentsdev/agentpets-dev/releases/latest/download/agentpets-cli.tgz install ${pet.slug}`}
          snippets={[
            {
              id: "badge",
              label: "Add badge to README",
              description:
                "Markdown badge that links back to the canonical pet page.",
              value: badgeMarkdown,
            },
            {
              id: "embed",
              label: "Embed this pet",
              description:
                "Iframe card for docs, launch pages, and creator profiles.",
              value: embedHtml,
            },
            {
              id: "link",
              label: "Public API payload",
              description: "JSON endpoint for custom widgets and bots.",
              value: `${siteConfig.url}/api/v1/pets/${pet.slug}`,
            },
          ]}
        />

        {/* Owner credit + claim CTA. Compact row that wraps cleanly on
            small screens. */}
        {ownerCredit ? (
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <SubmittedBy credit={ownerCredit} />
            {ownerCreditResult?.ownerIsProxy ? (
              <ClaimCTA
                petName={pet.displayName}
                authorLabel={ownerCredit.name}
                githubUrl={
                  ownerCredit.externals.find((e) => e.provider === "github")
                    ?.url ?? null
                }
              />
            ) : null}
          </div>
        ) : null}

        {/* Stats + variants. Single column when no variants exist (so
            the radar doesn't sit in a half-empty grid); 2-column when
            variants are available. */}
        <div
          className={
            variants.length > 0 ? "grid gap-6 md:grid-cols-2" : "grid gap-6"
          }
        >
          <InfoCard
            title={tPet("stats.title")}
            icon={<Sparkles className="size-4" />}
          >
            <div className="flex items-center justify-center py-2">
              <PetRadarClient
                slug={pet.slug}
                importedAt={pet.importedAt}
                ariaLabel={tPet("stats.ariaLabel")}
                labels={{
                  vibrance: tPet("stats.vibrance"),
                  popularity: tPet("stats.popularity"),
                  loved: tPet("stats.loved"),
                  freshness: tPet("stats.freshness"),
                }}
              />
            </div>
          </InfoCard>

          {variants.length > 0 ? (
            <section className="rounded-2xl border border-border-base bg-surface/76 p-5 shadow-sm shadow-blue-950/5 backdrop-blur">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Sparkles className="size-4" />
                {tPet("variants.title")}
              </div>
              <p className="mt-2 text-sm text-muted-2">
                {tPet("variants.description")}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {variants.map((variant) => (
                  <Link
                    key={variant.slug}
                    href={`/pets/${variant.slug}`}
                    className="group flex items-center gap-3 rounded-2xl border border-border-base bg-background/70 p-3 transition hover:-translate-y-0.5 hover:border-brand/35 hover:bg-background"
                  >
                    <div className="shrink-0 rounded-2xl border border-border-base bg-surface p-2">
                      <StaticPetSprite
                        src={variant.spritesheetUrl}
                        scale={0.45}
                        label={variant.displayName}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground transition group-hover:text-brand">
                        {variant.displayName}
                      </p>
                      <p className="mt-1 font-mono text-[11px] tracking-[0.16em] text-muted-3 uppercase">
                        #{formatDexNumber(variant.dexNumber)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        {!ownerCredit ? (
          <InfoCard title="Submission" icon={<Sparkles className="size-4" />}>
            <p>Curated entry.</p>
            <p>Updated {new Date(pet.importedAt).toLocaleDateString()}</p>
          </InfoCard>
        ) : null}
      </section>

      <SiteFooter />
    </main>
  );
}

function PetSeoTemplate({
  pet,
  seo,
  collectionCount,
}: {
  pet: PetdexPet;
  seo: ResolvedPetSeo;
  collectionCount: number;
}) {
  const installCommand = `${siteConfig.installCommand} ${pet.slug}`;
  const tagLine =
    pet.tags.length > 0
      ? pet.tags.slice(0, 4).join(", ")
      : `${pet.kind} companion`;

  return (
    <section
      aria-labelledby="pet-guide-title"
      className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"
    >
      <div className="rounded-2xl border border-border-base bg-surface/76 p-5 shadow-sm shadow-blue-950/5 backdrop-blur md:p-6">
        <p className="font-mono text-[11px] tracking-[0.2em] text-brand uppercase">
          Developer pet guide
        </p>
        <h2
          id="pet-guide-title"
          className="mt-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl"
        >
          Install {pet.displayName} as your AI coding companion
        </h2>
        <p className="mt-4 text-sm leading-7 text-muted-1 md:text-base">
          {seo.intro}
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <SeoStat label="Install command" value={installCommand} />
          <SeoStat label="Pet style" value={`${pet.kind} · ${tagLine}`} />
          <SeoStat
            label="Gallery links"
            value={`${collectionCount} collection${collectionCount === 1 ? "" : "s"}`}
          />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {seo.useCases.map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-border-base bg-background/70 p-4"
            >
              <p className="text-sm leading-6 text-muted-2">{item}</p>
            </div>
          ))}
        </div>
      </div>

      <aside className="space-y-4">
        <InfoCard title="Related paths" icon={<Layers className="size-4" />}>
          <div className="space-y-3">
            {seo.internalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-xl border border-border-base bg-background/70 p-3 transition hover:border-brand/35 hover:bg-background"
              >
                <span className="text-sm font-semibold text-foreground">
                  {link.label}
                </span>
                <span className="mt-1 block text-xs leading-5 text-muted-3">
                  {link.description}
                </span>
              </Link>
            ))}
          </div>
        </InfoCard>
      </aside>

      <div className="lg:col-span-2">
        <InfoCard title="FAQ" icon={<Sparkles className="size-4" />}>
          <div className="grid gap-3 md:grid-cols-3">
            {seo.faq.map((item) => (
              <details
                key={item.question}
                className="group rounded-2xl border border-border-base bg-background/70 p-4"
              >
                <summary className="cursor-pointer list-none text-sm font-semibold text-foreground">
                  {item.question}
                </summary>
                <p className="mt-3 text-sm leading-6 text-muted-2">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </InfoCard>
      </div>
    </section>
  );
}

function SeoStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border-base bg-background/70 p-3">
      <p className="font-mono text-[10px] tracking-[0.18em] text-muted-3 uppercase">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium text-foreground">
        {value}
      </p>
    </div>
  );
}

function DexNavPill({
  pet,
  direction,
}: {
  pet: DexNavPet | null;
  direction: "prev" | "next";
}) {
  if (!pet) return null;

  return (
    <Link
      href={`/pets/${pet.slug}`}
      className={`inline-flex min-h-10 items-center gap-2 rounded-full border border-border-base bg-surface px-4 py-2 text-sm text-foreground transition hover:border-border-strong ${direction === "next" ? "ml-auto" : ""}`}
    >
      {direction === "prev" ? <span aria-hidden="true">←</span> : null}
      <span className="font-mono text-xs tracking-[0.16em]">
        #{formatDexNumber(pet.dexNumber)}
      </span>
      <span className="font-normal">{pet.displayName}</span>
      {direction === "next" ? <span aria-hidden="true">→</span> : null}
    </Link>
  );
}

function InfoCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border-base bg-surface/76 p-5 shadow-sm shadow-blue-950/5 backdrop-blur">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        {icon}
        {title}
      </div>
      <div className="mt-4 space-y-2 break-words text-sm leading-6 text-muted-2">
        {children}
      </div>
    </div>
  );
}
