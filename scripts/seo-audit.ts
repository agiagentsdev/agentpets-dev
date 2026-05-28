import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { eq } from "drizzle-orm";

import { allBestPages } from "@/lib/best-pages";
import { db, schema } from "@/lib/db/client";
import { auditPetSeo } from "@/lib/seo/audit";
import { seoAgentPages } from "@/lib/seo-agent-pages";
import { guides, topicHubs } from "@/lib/seo-content";
import { getSitemapEntries, sitemapSections } from "@/lib/sitemap-split";

import robots from "@/app/robots";

type SeoAgent =
  | "technical"
  | "metadata"
  | "content"
  | "internal-links"
  | "structured-data"
  | "growth-loop"
  | "pet-pages";

type Issue = {
  code: string;
  severity: "error" | "warning" | "info";
  message: string;
};

type Report = {
  type: string;
  slug: string;
  title: string;
  score: number;
  agent: SeoAgent;
  issues: Issue[];
};

type Args = {
  json: boolean;
  failUnder: number | null;
  limit: number;
  includePassing: boolean;
};

const SEO_AGENT_TEAM: Array<{
  id: SeoAgent;
  name: string;
  role: string;
}> = [
  {
    id: "technical",
    name: "Technical SEO Agent",
    role: "Robots, sitemap coverage, route existence, canonical crawlability.",
  },
  {
    id: "metadata",
    name: "Metadata SERP Agent",
    role: "Title and meta description length, keyword focus, noindex sanity.",
  },
  {
    id: "content",
    name: "Content Hub Agent",
    role: "Topic/guide/agent hubs, query intent, crawlable page inventory.",
  },
  {
    id: "internal-links",
    name: "Internal Link Graph Agent",
    role: "Homepage/footer/hub links that push authority into money pages.",
  },
  {
    id: "structured-data",
    name: "Structured Data Agent",
    role: "JSON-LD coverage for homepage, pet pages, hubs, guides, and topics.",
  },
  {
    id: "growth-loop",
    name: "Creator Growth Agent",
    role: "Badge/embed/share analytics loops that create links and repeat visits.",
  },
  {
    id: "pet-pages",
    name: "Pet Page Agent",
    role: "Per-pet SEO fields, intro/FAQ depth, page-level enrichment.",
  },
];

const REQUIRED_HUBS = [
  "/codex-pets",
  "/claude-code-pets",
  "/cursor-pets",
  "/gemini-cli-pets",
  "/terminal-pets",
  "/ai-agent-pets",
  "/developer-mascots",
] as const;

const REQUIRED_STRUCTURED_DATA_FILES = [
  "src/app/[locale]/page.tsx",
  "src/app/[locale]/pets/[slug]/page.tsx",
  "src/components/seo-agent-page.tsx",
  "src/app/[locale]/best/[slug]/page.tsx",
  "src/app/[locale]/guides/[slug]/page.tsx",
  "src/app/[locale]/topics/[slug]/page.tsx",
] as const;

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
  const [
    pets,
    technicalReports,
    linkReports,
    structuredDataReports,
    growthReports,
  ] = await Promise.all([
    loadApprovedPets(),
    auditTechnicalSeo(),
    auditInternalLinks(),
    auditStructuredData(),
    auditGrowthLoop(),
  ]);

  const petReports = pets
    .map((pet) => {
      const result = auditPetSeo(pet);
      return {
        type: "pet" as const,
        slug: pet.slug,
        title: pet.displayName,
        score: result.score,
        agent: "pet-pages" as const,
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
      agent: "metadata" as const,
      issues: staticIssues(page.metaTitle.en, page.metaDescription.en),
    })),
    ...topicHubs.map((page) => ({
      type: "topic" as const,
      slug: page.slug,
      title: page.metaTitle,
      score: scoreStaticPage(page.metaTitle, page.description),
      agent: "content" as const,
      issues: staticIssues(page.metaTitle, page.description),
    })),
    ...guides.map((page) => ({
      type: "guide" as const,
      slug: page.slug,
      title: page.metaTitle,
      score: scoreStaticPage(page.metaTitle, page.description),
      agent: "content" as const,
      issues: staticIssues(page.metaTitle, page.description),
    })),
  ].sort((a, b) => a.score - b.score || a.slug.localeCompare(b.slug));

  const allReports: Report[] = [
    ...technicalReports,
    ...linkReports,
    ...structuredDataReports,
    ...growthReports,
    ...petReports,
    ...staticReports,
  ];
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
    agents: SEO_AGENT_TEAM.map((agent) => ({
      ...agent,
      score: averageForAgent(allReports, agent.id),
      issues: allReports
        .filter((report) => report.agent === agent.id)
        .reduce((sum, report) => sum + report.issues.length, 0),
    })),
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
        `\n[${report.agent}/${report.type}] ${report.slug} - score ${report.score} - ${report.title}`,
      );
      for (const issue of report.issues) {
        console.log(`  - ${issue.severity}: ${issue.code} - ${issue.message}`);
      }
    }
    console.log("\nSEO agent team:");
    for (const agent of summary.agents) {
      console.log(
        `  - ${agent.name}: score=${agent.score} issues=${agent.issues} (${agent.role})`,
      );
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

async function auditTechnicalSeo(): Promise<Report[]> {
  const issues: Issue[] = [];
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

async function auditInternalLinks(): Promise<Report[]> {
  const home = readSource("src/app/[locale]/page.tsx");
  const footer = readSource("src/components/site-footer.tsx");
  const seoAgentComponent = readSource("src/components/seo-agent-page.tsx");
  const issues: Issue[] = [];

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

async function auditStructuredData(): Promise<Report[]> {
  const issues: Issue[] = [];

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

async function auditGrowthLoop(): Promise<Report[]> {
  const issues: Issue[] = [];
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
    if (!existsSync(join(process.cwd(), file))) {
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

function isPathDisallowed(pathname: string, disallowed: Set<string>): boolean {
  for (const rule of disallowed) {
    if (!rule || rule === "/") return true;

    const normalizedRule = rule.endsWith("/") ? rule : `${rule}/`;
    if (pathname === rule || pathname.startsWith(normalizedRule)) {
      return true;
    }
  }
  return false;
}

function routeFileExists(pathname: string): boolean {
  const routePath =
    pathname === "/"
      ? "src/app/[locale]/page.tsx"
      : `src/app/[locale]${pathname}/page.tsx`;
  return existsSync(join(process.cwd(), routePath));
}

function readSource(file: string): string {
  const absolutePath = join(process.cwd(), file);
  if (!existsSync(absolutePath)) return "";
  return readFileSync(absolutePath, "utf8");
}

function scoreIssues(issues: Issue[]): number {
  const penalty = issues.reduce((sum, issue) => {
    if (issue.severity === "error") return sum + 28;
    if (issue.severity === "warning") return sum + 10;
    return sum + 3;
  }, 0);
  return Math.max(0, 100 - penalty);
}

function averageForAgent(reports: Report[], agent: SeoAgent): number {
  const agentReports = reports.filter((report) => report.agent === agent);
  if (agentReports.length === 0) return 100;
  return Math.round(
    agentReports.reduce((sum, report) => sum + report.score, 0) /
      agentReports.length,
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
