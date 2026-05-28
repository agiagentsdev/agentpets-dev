import { seoAgentPages } from "@/lib/seo-agent-pages";

import type { SeoAuditReport } from "./types";
import { scoreStaticPage, staticIssues } from "./utils";

export async function runMetadataAgent(): Promise<SeoAuditReport[]> {
  return Object.values(seoAgentPages)
    .map((page) => ({
      type: "landing",
      slug: page.slug,
      title: page.metaTitle.en,
      score: scoreStaticPage(page.metaTitle.en, page.metaDescription.en),
      agent: "metadata" as const,
      issues: staticIssues(page.metaTitle.en, page.metaDescription.en),
    }))
    .sort((a, b) => a.score - b.score || a.slug.localeCompare(b.slug));
}
