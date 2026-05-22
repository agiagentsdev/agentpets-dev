import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getPetWithMetrics } from "@/lib/pets";
import { siteConfig, siteUrl } from "@/lib/site-config";

import { PetSprite } from "@/components/pet-sprite";

type Props = { params: Promise<{ slug: string }> };

export const runtime = "nodejs";
export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pet = await getPetWithMetrics(slug.toLowerCase());
  if (!pet) return { title: "Pet not found", robots: { index: false } };

  return {
    title: `${pet.displayName} embed`,
    description: `Embeddable AgentPets card for ${pet.displayName}.`,
    robots: { index: false, follow: true },
    alternates: { canonical: siteUrl(`/pets/${pet.slug}`) },
  };
}

export default async function EmbedPetPage({ params }: Props) {
  const { slug } = await params;
  const pet = await getPetWithMetrics(slug.toLowerCase());
  if (!pet) notFound();

  return (
    <main className="min-h-dvh bg-transparent p-3 text-foreground">
      <Link
        href={siteUrl(`/pets/${pet.slug}`)}
        target="_blank"
        rel="noreferrer"
        className="group flex min-h-[396px] flex-col items-center justify-between rounded-2xl border border-border-base bg-surface p-5 text-center shadow-lg shadow-blue-950/10 transition hover:border-border-strong"
      >
        <div>
          <p className="font-mono text-[10px] tracking-[0.18em] text-muted-3 uppercase">
            AgentPets
          </p>
          <h1 className="mt-2 text-balance text-2xl font-semibold tracking-tight">
            {pet.displayName}
          </h1>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-2">
            {pet.description}
          </p>
        </div>

        <div className="my-4 grid size-40 place-items-center rounded-3xl bg-background">
          <PetSprite
            src={pet.spritesheetPath}
            state="idle"
            scale={0.58}
            label={pet.displayName}
          />
        </div>

        <div>
          <p className="font-mono text-xs text-muted-2">
            npx {siteConfig.npmPackage} install {pet.slug}
          </p>
          <span className="mt-3 inline-flex h-9 items-center rounded-full bg-inverse px-4 text-sm font-medium text-on-inverse transition group-hover:bg-inverse-hover">
            Install pet
          </span>
        </div>
      </Link>
    </main>
  );
}
