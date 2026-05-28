import { allBestPages } from "@/lib/best-pages";

import { REQUIRED_HUBS } from "./config";
import type { SeoAuditReport } from "./types";
import { readSource, scoreIssues } from "./utils";

export async function runInternalLinkAgent(): Promise<SeoAuditReport[]> {
  const home = readSource("src/app/[locale]/page.tsx");
  const footer = readSource("src/components/site-footer.tsx");
  const seoAgentComponent = readSource("src/components/seo-agent-page.tsx");
  const issues: SeoAuditReport["issues"] = [];

  for (const path of REQUIRED_HUBS) {
    if (!home.includes(path)) {
      issues.push({
        code: "homepage_missing_required_hub_link",
        severity: "warning",
        message: `Homepage does not link to ${path}.`,
      });
    }
    if (!footer.includes(path) && !seoAgentComponent.includes(path)) {
      issues.push({
        code: "global_link_graph_missing_required_hub",
        severity: "warning",
        message: `${path} is not linked from footer or the SEO agent hub link set.`,
      });
    }
  }

  for (const bestPage of allBestPages()) {
    const path = `/best/${bestPage.slug}`;
    if (!footer.includes(path) && !home.includes(path)) {
      issues.push({
        code: "best_page_missing_global_link",
        severity: "info",
        message: `${path} should be linked from a high-authority surface.`,
      });
    }
  }

  return [
    {
      type: "site",
      slug: "internal-link-graph",
      title: "Homepage, footer, and hub internal links",
      agent: "internal-links",
      issues,
      score: scoreIssues(issues),
    },
  ];
}
