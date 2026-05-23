import { asc, eq, sql } from "drizzle-orm";

import { db, schema } from "@/lib/db/client";
import { auditPetSeo } from "@/lib/seo/audit";

import { AdminSeoBulkEditor } from "@/components/admin-seo-bulk-editor";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "SEO bulk editor | AgentPets Admin",
  robots: { index: false, follow: false },
};

export default async function AdminSeoPage() {
  const pets = await db
    .select({
      id: schema.submittedPets.id,
      slug: schema.submittedPets.slug,
      displayName: schema.submittedPets.displayName,
      description: schema.submittedPets.description,
      kind: schema.submittedPets.kind,
      tags: schema.submittedPets.tags,
      vibes: schema.submittedPets.vibes,
      seoTitle: schema.submittedPets.seoTitle,
      seoDescription: schema.submittedPets.seoDescription,
      seoKeywords: schema.submittedPets.seoKeywords,
      seoIntro: schema.submittedPets.seoIntro,
      seoFaq: schema.submittedPets.seoFaq,
      seoUpdatedAt: schema.submittedPets.seoUpdatedAt,
    })
    .from(schema.submittedPets)
    .where(eq(schema.submittedPets.status, "approved"))
    .orderBy(
      sql`${schema.submittedPets.seoUpdatedAt} is not null`,
      asc(schema.submittedPets.displayName),
    )
    .limit(80);

  const rows = pets
    .map((pet) => {
      const audit = auditPetSeo(pet);
      return {
        id: pet.id,
        slug: pet.slug,
        displayName: pet.displayName,
        description: pet.description,
        score: audit.score,
        issues: audit.issues,
        suggestion: audit.suggestions,
        seoTitle: pet.seoTitle ?? "",
        seoDescription: pet.seoDescription ?? "",
        seoKeywords: (pet.seoKeywords ?? []).join(", "),
        seoIntro: pet.seoIntro ?? "",
        seoFaq: JSON.stringify(pet.seoFaq ?? [], null, 2),
      };
    })
    .sort((a, b) => a.score - b.score || a.displayName.localeCompare(b.displayName));

  const averageScore =
    rows.length === 0
      ? 100
      : Math.round(rows.reduce((sum, row) => sum + row.score, 0) / rows.length);
  const needsWork = rows.filter((row) => row.score < 90).length;

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 pb-12 md:px-8 md:pb-16">
      <header className="space-y-3">
        <p className="font-mono text-xs tracking-[0.22em] text-brand uppercase">
          SEO operations
        </p>
        <h1 className="text-4xl font-medium tracking-tight md:text-5xl">
          Bulk SEO editor
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-muted-2">
          Audit approved pet pages, apply generated SEO suggestions, and save
          title, description, keywords, intro, and FAQ fields in batches.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <Metric label="Loaded pets" value={rows.length} />
          <Metric label="Average score" value={averageScore} />
          <Metric label="Needs work" value={needsWork} />
        </div>
      </header>

      <AdminSeoBulkEditor rows={rows} />
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border-base bg-surface p-4">
      <p className="text-xs text-muted-3">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
