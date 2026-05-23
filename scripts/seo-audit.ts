import { eq } from "drizzle-orm";

import { db, schema } from "@/lib/db/client";
import { auditPetSeo } from "@/lib/seo/audit";
import { seoAgentPages } from "@/lib/seo-agent-pages";
import { topicHubs, guides } from "@/lib/seo-content";

type Args = {
  json: boolean;
  failUnder: number | null;
  limit: number;
  includePassing: boolean;
};

function parseArgs(argv: string[]): Args {
  const args: Args = {
    json: false,
    failUnder: null,
    limit: 50,
    includePassing: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--json") args.json = true;
    else if (arg === "--include-passing") args.includePassing = true;
    else if (arg === "--fail-under") {
      args.failUnder = Number(argv[++i] ?? "");
    } else if (arg.startsWith("--fail-under=")) {
      args.failUnder = Number(arg.split("=", 2)[1]);
    } else if (arg === "--limit") {
      args.limit = Number(argv[++i] ?? "");
    } else if (arg.startsWith("--limit=")) {
      args.limit = Number(arg.split("=", 2)[1]);
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
  }

  if (!Number.isFinite(args.limit) || args.limit < 1) args.limit = 50;
  if (args.failUnder !== null && !Number.isFinite(args.failUnder)) {
    args.failUnder = null;
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const pets = await loadApprovedPets();

  const petReports = pets
    .map((pet) => {
      const result = auditPetSeo(pet);
      return {
        type: "pet" as const,
        slug: pet.slug,
        title: pet.displayName,
        score: result.score,
        issues: result.issues,
      };
    })
    .sort((a, b) => a.score - b.score || a.slug.localeCompare(b.slug));

  const staticReports = [
    ...Object.values(seoAgentPages).map((page) => ({
      type: "landing" as const,
      slug: page.slug,
      title: page.metaTitle.en,
      score: scoreStaticPage(page.metaTitle.en, page.metaDescription.en),
      issues: staticIssues(page.metaTitle.en, page.metaDescription.en),
    })),
    ...topicHubs.map((page) => ({
      type: "topic" as const,
      slug: page.slug,
      title: page.metaTitle,
      score: scoreStaticPage(page.metaTitle, page.description),
      issues: staticIssues(page.metaTitle, page.description),
    })),
    ...guides.map((page) => ({
      type: "guide" as const,
      slug: page.slug,
      title: page.metaTitle,
      score: scoreStaticPage(page.metaTitle, page.description),
      issues: staticIssues(page.metaTitle, page.description),
    })),
  ].sort((a, b) => a.score - b.score || a.slug.localeCompare(b.slug));

  const allReports = [...petReports, ...staticReports];
  const averageScore =
    allReports.length === 0
      ? 100
      : Math.round(
          allReports.reduce((sum, report) => sum + report.score, 0) /
            allReports.length,
        );
  const failing = allReports.filter((report) =>
    report.issues.some((issue) => issue.severity === "error"),
  );
  const needsWork = allReports.filter((report) => report.score < 90);
  const visible = (args.includePassing ? allReports : needsWork).slice(
    0,
    args.limit,
  );

  const summary = {
    checked: allReports.length,
    pets: petReports.length,
    staticPages: staticReports.length,
    averageScore,
    failing: failing.length,
    needsWork: needsWork.length,
    reports: visible,
  };

  if (args.json) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    console.log(
      `SEO audit: checked=${summary.checked} pets=${summary.pets} static=${summary.staticPages} average=${summary.averageScore} failing=${summary.failing} needsWork=${summary.needsWork}`,
    );
    for (const report of visible) {
      console.log(
        `\n[${report.type}] ${report.slug} - score ${report.score} - ${report.title}`,
      );
      for (const issue of report.issues) {
        console.log(`  - ${issue.severity}: ${issue.code} - ${issue.message}`);
      }
    }
  }

  if (args.failUnder !== null && averageScore < args.failUnder) {
    console.error(
      `SEO audit failed: average score ${averageScore} < ${args.failUnder}`,
    );
    process.exit(1);
  }
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

function staticIssues(title: string, description: string) {
  const issues: Array<{
    code: string;
    severity: "error" | "warning";
    message: string;
  }> = [];
  if (title.length < 30) {
    issues.push({
      code: "short_title",
      severity: "warning",
      message: "Static page title is short.",
    });
  }
  if (title.length > 68) {
    issues.push({
      code: "long_title",
      severity: "error",
      message: "Static page title is too long.",
    });
  }
  if (description.length < 100) {
    issues.push({
      code: "short_description",
      severity: "warning",
      message: "Static page description is short.",
    });
  }
  if (description.length > 170) {
    issues.push({
      code: "long_description",
      severity: "error",
      message: "Static page description is too long.",
    });
  }
  return issues;
}

function scoreStaticPage(title: string, description: string): number {
  return Math.max(
    0,
    100 -
      staticIssues(title, description).reduce(
        (sum, issue) => sum + (issue.severity === "error" ? 18 : 8),
        0,
      ),
  );
}

function printHelp() {
  console.log(`Usage: bun --conditions react-server scripts/seo-audit.ts [options]

Options:
  --json                 Print JSON summary.
  --limit <n>            Number of low-score rows to print. Default: 50.
  --include-passing      Include passing pages in output.
  --fail-under <score>   Exit 1 when average score is below score.
`);
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
