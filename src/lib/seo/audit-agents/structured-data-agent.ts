import { REQUIRED_STRUCTURED_DATA_FILES } from "./config";
import type { SeoAuditReport } from "./types";
import { readSource, scoreIssues } from "./utils";

export async function runStructuredDataAgent(): Promise<SeoAuditReport[]> {
  const issues: SeoAuditReport["issues"] = [];

  for (const file of REQUIRED_STRUCTURED_DATA_FILES) {
    const source = readSource(file);
    if (!source.includes("<JsonLd") && !source.includes("JsonLd data")) {
      issues.push({
        code: "missing_json_ld_component",
        severity: "warning",
        message: `${file} does not appear to render JsonLd.`,
      });
    }
  }

  const petPage = readSource("src/app/[locale]/pets/[slug]/page.tsx");
  for (const type of ["CreativeWork", "BreadcrumbList", "FAQPage"]) {
    if (!petPage.includes(type)) {
      issues.push({
        code: "pet_page_schema_missing_type",
        severity: "error",
        message: `Pet page JSON-LD is missing ${type}.`,
      });
    }
  }

  const home = readSource("src/app/[locale]/page.tsx");
  for (const type of ["WebSite", "SearchAction", "ItemList"]) {
    if (!home.includes(type)) {
      issues.push({
        code: "homepage_schema_missing_type",
        severity: "warning",
        message: `Homepage JSON-LD is missing ${type}.`,
      });
    }
  }

  return [
    {
      type: "site",
      slug: "structured-data",
      title: "JSON-LD coverage for rich crawl context",
      agent: "structured-data",
      issues,
      score: scoreIssues(issues),
    },
  ];
}
