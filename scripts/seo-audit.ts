import {
  averageForAgent,
  isSeoAgentSelector,
  type SeoAgentSelector,
  type SeoAuditReport,
  selectSeoAuditAgents,
  seoAuditAgentIds,
} from "@/lib/seo/audit-agents";

type Args = {
  agent: SeoAgentSelector;
  json: boolean;
  failUnder: number | null;
  limit: number;
  includePassing: boolean;
};

function parseArgs(argv: string[]): Args {
  const args: Args = {
    agent: "all",
    json: false,
    failUnder: null,
    limit: 50,
    includePassing: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--json") args.json = true;
    else if (arg === "--include-passing") args.includePassing = true;
    else if (arg === "--agent") {
      args.agent = parseAgent(argv[++i] ?? "");
    } else if (arg.startsWith("--agent=")) {
      args.agent = parseAgent(arg.split("=", 2)[1] ?? "");
    } else if (arg === "--fail-under") {
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
  const selectedAgents = selectSeoAuditAgents(args.agent);
  const agentReports = await Promise.all(
    selectedAgents.map((agent) => agent.run()),
  );
  const allReports = agentReports
    .flat()
    .sort(
      (a, b) =>
        a.score - b.score ||
        a.agent.localeCompare(b.agent) ||
        a.slug.localeCompare(b.slug),
    );
  const averageScore = averageScoreForReports(allReports);
  const failing = allReports.filter((report) =>
    report.issues.some((issue) => issue.severity === "error"),
  );
  const needsWork = allReports.filter((report) => report.score < 90);
  const visible = (args.includePassing ? allReports : needsWork).slice(
    0,
    args.limit,
  );

  const summary = {
    selectedAgent: args.agent,
    agents: selectedAgents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      role: agent.role,
      score: averageForAgent(allReports, agent.id),
      issues: allReports
        .filter((report) => report.agent === agent.id)
        .reduce((sum, report) => sum + report.issues.length, 0),
    })),
    checked: allReports.length,
    pets: allReports.filter((report) => report.type === "pet").length,
    staticPages: allReports.filter((report) =>
      ["landing", "topic", "guide"].includes(report.type),
    ).length,
    averageScore,
    failing: failing.length,
    needsWork: needsWork.length,
    reports: visible,
  };

  if (args.json) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    console.log(
      `SEO audit: agent=${summary.selectedAgent} checked=${summary.checked} pets=${summary.pets} static=${summary.staticPages} average=${summary.averageScore} failing=${summary.failing} needsWork=${summary.needsWork}`,
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

function parseAgent(value: string): SeoAgentSelector {
  if (isSeoAgentSelector(value)) return value;

  console.error(
    `Invalid --agent "${value}". Use one of: all, ${seoAuditAgentIds.join(", ")}.`,
  );
  process.exit(1);
}

function averageScoreForReports(reports: SeoAuditReport[]): number {
  if (reports.length === 0) return 100;
  return Math.round(
    reports.reduce((sum, report) => sum + report.score, 0) / reports.length,
  );
}

function printHelp() {
  console.log(`Usage: bun --conditions react-server scripts/seo-audit.ts [options]

Options:
  --agent <name>         Run one audit agent or all. Default: all.
                         Agents: all, ${seoAuditAgentIds.join(", ")}
  --json                 Print JSON summary.
  --limit <n>            Number of low-score rows to print. Default: 50.
  --include-passing      Include passing pages in output.
  --fail-under <score>   Exit 1 when average score is below score.

Examples:
  bun --conditions react-server scripts/seo-audit.ts --agent technical
  bun --conditions react-server scripts/seo-audit.ts --agent content
  bun --conditions react-server scripts/seo-audit.ts --agent all --fail-under 98
`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
