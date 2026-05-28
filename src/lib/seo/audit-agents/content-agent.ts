import { guides, topicHubs } from "@/lib/seo-content";

import type { SeoAuditReport } from "./types";
import { scoreStaticPage, staticIssues } from "./utils";

export async function runContentAgent(): Promise<SeoAuditReport[]> {
  return [
    ...topicHubs.map((page) => ({
      type: "topic",
      slug: page.slug,
      title: page.metaTitle,
      score: scoreStaticPage(page.metaTitle, page.description),
      agent: "content" as const,
      issues: staticIssues(page.metaTitle, page.description),
    })),
    ...guides.map((page) => ({
      type: "guide",
      slug: page.slug,
      title: page.metaTitle,
      score: scoreStaticPage(page.metaTitle, page.description),
      agent: "content" as const,
      issues: staticIssues(page.metaTitle, page.description),
    })),
  ].sort((a, b) => a.score - b.score || a.slug.localeCompare(b.slug));
}
