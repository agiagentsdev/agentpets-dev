import { getSitemapEntries, sitemapSections } from "@/lib/sitemap-split";

import robots from "@/app/robots";
import { REQUIRED_HUBS } from "./config";
import type { SeoAuditReport } from "./types";
import { isPathDisallowed, routeFileExists, scoreIssues } from "./utils";

export async function runTechnicalSeoAgent(): Promise<SeoAuditReport[]> {
  const issues: SeoAuditReport["issues"] = [];
  const staticEntries = await getSitemapEntries("static");
  const staticPaths = new Set(staticEntries.map((entry) => entry.pathname));
  const robotRules = robots().rules;
  const rules = Array.isArray(robotRules)
    ? robotRules
    : robotRules
      ? [robotRules]
      : [];
  const disallowed = new Set(
    rules
      .flatMap((rule) =>
        Array.isArray(rule.disallow)
          ? rule.disallow
          : rule.disallow
            ? [rule.disallow]
            : [],
      )
      .filter((path): path is string => typeof path === "string"),
  );

  for (const path of staticPaths) {
    if (isPathDisallowed(path, disallowed)) {
      issues.push({
        code: "sitemap_path_blocked_by_robots",
        severity: "error",
        message: `${path} appears in the static sitemap but is blocked by robots.txt.`,
      });
    }
  }

  for (const path of REQUIRED_HUBS) {
    if (!staticPaths.has(path)) {
      issues.push({
        code: "required_hub_missing_from_sitemap",
        severity: "error",
        message: `${path} is a required SEO hub but is missing from the static sitemap.`,
      });
    }
    if (!routeFileExists(path)) {
      issues.push({
        code: "required_hub_route_missing",
        severity: "error",
        message: `${path} is a required SEO hub but no route file exists.`,
      });
    }
  }

  for (const section of [
    "static",
    "pets",
    "collections",
    "facets",
    "topics",
    "guides",
  ] as const) {
    if (!sitemapSections.includes(section)) {
      issues.push({
        code: "sitemap_section_missing",
        severity: "error",
        message: `Sitemap section ${section} is missing from sitemapSections.`,
      });
    }
  }

  return [
    {
      type: "site",
      slug: "technical-seo",
      title: "Robots, sitemap, and required hub coverage",
      agent: "technical",
      issues,
      score: scoreIssues(issues),
    },
  ];
}
