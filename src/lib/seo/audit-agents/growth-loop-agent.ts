import type { SeoAuditReport } from "./types";
import { fileExists, readSource, scoreIssues } from "./utils";

export async function runGrowthLoopAgent(): Promise<SeoAuditReport[]> {
  const issues: SeoAuditReport["issues"] = [];
  const checks = [
    [
      "src/app/api/analytics/event/route.ts",
      "Product analytics ingestion route",
    ],
    ["src/app/[locale]/admin/analytics/page.tsx", "Admin analytics dashboard"],
    ["src/components/pet-page-analytics.tsx", "Pet page analytics beacon"],
    ["src/lib/product-analytics.ts", "Product analytics query layer"],
  ] as const;

  for (const [file, label] of checks) {
    if (!fileExists(file)) {
      issues.push({
        code: "growth_loop_file_missing",
        severity: "error",
        message: `${label} is missing (${file}).`,
      });
    }
  }

  const badgeRoute = readSource("src/app/api/v1/badge/[slug]/route.ts");
  if (!badgeRoute.includes("badge_impression")) {
    issues.push({
      code: "badge_impression_not_tracked",
      severity: "warning",
      message: "Badge endpoint should log badge_impression for README CTR.",
    });
  }

  const petPage = readSource("src/app/[locale]/pets/[slug]/page.tsx");
  if (!petPage.includes("?ref=badge")) {
    issues.push({
      code: "badge_links_missing_ref",
      severity: "warning",
      message: "Pet page README badge snippet should include ?ref=badge.",
    });
  }

  return [
    {
      type: "site",
      slug: "creator-growth-loop",
      title: "Badge, embed, share, and analytics loop",
      agent: "growth-loop",
      issues,
      score: scoreIssues(issues),
    },
  ];
}
