import { eq } from "drizzle-orm";

import { db, schema } from "@/lib/db/client";
import { auditPetSeo } from "@/lib/seo/audit";

import type { SeoAuditReport } from "./types";
import { errorMessage } from "./utils";

export async function runPetPageAgent(): Promise<SeoAuditReport[]> {
  const pets = await loadApprovedPets();

  return pets
    .map((pet) => {
      const result = auditPetSeo(pet);
      return {
        type: "pet",
        slug: pet.slug,
        title: pet.displayName,
        score: result.score,
        agent: "pet-pages" as const,
        issues: result.issues,
      };
    })
    .sort((a, b) => a.score - b.score || a.slug.localeCompare(b.slug));
}

async function loadApprovedPets() {
  try {
    return await db
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
      })
      .from(schema.submittedPets)
      .where(eq(schema.submittedPets.status, "approved"));
  } catch (error) {
    console.warn(
      `SEO audit warning: pet DB audit skipped (${errorMessage(error)}). Static SEO checks still ran.`,
    );
    return [];
  }
}
