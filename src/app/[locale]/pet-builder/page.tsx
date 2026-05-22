import type { Metadata } from "next";
import Link from "next/link";

import { ArrowRight, CheckCircle2, Code2, FileJson, Upload } from "lucide-react";

import { JsonLd } from "@/components/json-ld";
import { PetBuilderStudio } from "@/components/pet-builder-studio";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

import { buildLocaleAlternates } from "@/lib/locale-routing";
import { siteConfig, siteUrl } from "@/lib/site-config";

import { hasLocale } from "@/i18n/config";

export const dynamic = "force-dynamic";

const title = "Pet Builder for Codex and AI Coding Agents";
const description =
  "Design an animated coding pet in the browser, validate the pet.json package, export a spritesheet ZIP, and submit it to AgentPets.dev.";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const localeValue = hasLocale(locale) ? locale : "en";

  return {
    title,
    description,
    alternates: buildLocaleAlternates("/pet-builder", localeValue),
    keywords: [
      "pet builder",
      "Codex pet builder",
      "AI coding pet generator",
      "pet.json builder",
      "spritesheet generator",
      "developer mascot builder",
      "AgentPets",
    ],
    openGraph: {
      title,
      description,
      url: siteUrl("/pet-builder"),
      siteName: siteConfig.name,
      type: "website",
      images: [
        {
          url: `${siteConfig.url}/api/og`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${siteConfig.url}/api/og`],
    },
  };
}

export default function PetBuilderPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "AgentPets Pet Builder",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      url: siteUrl("/pet-builder"),
      description,
      isPartOf: {
        "@type": "WebSite",
        name: siteConfig.name,
        url: siteConfig.url,
      },
      featureList: [
        "Browser-generated 8x9 pet spritesheets",
        "pet.json package validation",
        "ZIP export",
        "AgentPets gallery submission",
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What does the AgentPets pet builder create?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The builder creates a Petdex-compatible package with pet.json and spritesheet.png in a ZIP file that can be exported locally or submitted to AgentPets.dev.",
          },
        },
        {
          "@type": "Question",
          name: "Can I submit a pet directly from the builder?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Signed-in users can submit the generated package through the same reviewed upload pipeline used by the main AgentPets submission flow.",
          },
        },
      ],
    },
  ];

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <JsonLd data={jsonLd} />
      <SiteHeader />
      <section className="petdex-cloud relative -mt-[84px] overflow-clip pt-[84px]">
        <div className="relative mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-5 pb-12 md:px-8 md:pb-16">
          <header className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
            <div>
              <p className="font-mono text-xs tracking-[0.22em] text-brand uppercase">
                Pet builder
              </p>
              <h1 className="mt-3 max-w-4xl text-balance text-[44px] leading-[0.98] font-semibold tracking-tight md:text-[76px]">
                Build a valid AI coding pet in your browser.
              </h1>
              <p className="mt-5 max-w-2xl text-balance text-base leading-7 text-muted-1 md:text-lg">
                Create a starter animated pet, validate the package, export the
                ZIP, then submit it to the AgentPets gallery. The MVP keeps the
                file format stable so custom drawing, AI generation, and
                advanced sprite editing can layer on later.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#builder"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-inverse px-5 text-sm font-medium text-on-inverse transition hover:bg-inverse-hover"
                >
                  Open builder
                  <ArrowRight className="size-4" />
                </a>
                <Link
                  href="/submit"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border-base bg-surface/70 px-5 text-sm font-medium text-foreground transition hover:border-border-strong"
                >
                  Submit existing ZIP
                </Link>
              </div>
            </div>

            <aside className="grid gap-3 rounded-3xl border border-border-base bg-surface/78 p-5 shadow-sm backdrop-blur">
              <BuilderMetric
                icon={<Code2 className="size-4" />}
                label="No local setup"
                body="Canvas generation runs fully in-browser."
              />
              <BuilderMetric
                icon={<FileJson className="size-4" />}
                label="Safe pet.json"
                body="Metadata is normalized before export."
              />
              <BuilderMetric
                icon={<Upload className="size-4" />}
                label="Reviewed submit"
                body="Uploads use the existing AgentPets review pipeline."
              />
            </aside>
          </header>

          <section id="builder" className="scroll-mt-24">
            <PetBuilderStudio />
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {[
              "Start with a generated 1536x1872 spritesheet that matches the 8-column, 9-row AgentPets animation atlas.",
              "Export a ZIP with root-level pet.json and spritesheet.png for local testing or CLI sharing.",
              "Use this page as a SEO landing page for pet builder, Codex pet generator, and developer mascot builder intent.",
            ].map((item) => (
              <article
                key={item}
                className="flex gap-3 rounded-2xl border border-border-base bg-surface p-4"
              >
                <CheckCircle2 className="mt-1 size-4 shrink-0 text-brand" />
                <p className="text-sm leading-6 text-muted-2">{item}</p>
              </article>
            ))}
          </section>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

function BuilderMetric({
  icon,
  label,
  body,
}: {
  icon: React.ReactNode;
  label: string;
  body: string;
}) {
  return (
    <div className="flex gap-3 rounded-2xl bg-background/72 p-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand">
        {icon}
      </span>
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        <span className="mt-0.5 block text-xs leading-5 text-muted-3">
          {body}
        </span>
      </span>
    </div>
  );
}
