import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { SeoAgentId, SeoAuditIssue, SeoAuditReport } from "./types";

export function readSource(file: string): string {
  const absolutePath = join(process.cwd(), file);
  if (!existsSync(absolutePath)) return "";
  return readFileSync(absolutePath, "utf8");
}

export function fileExists(file: string): boolean {
  return existsSync(join(process.cwd(), file));
}

export function routeFileExists(pathname: string): boolean {
  const routePath =
    pathname === "/"
      ? "src/app/[locale]/page.tsx"
      : `src/app/[locale]${pathname}/page.tsx`;
  return fileExists(routePath);
}

export function isPathDisallowed(
  pathname: string,
  disallowed: Set<string>,
): boolean {
  for (const rule of disallowed) {
    if (!rule || rule === "/") return true;

    const normalizedRule = rule.endsWith("/") ? rule : `${rule}/`;
    if (pathname === rule || pathname.startsWith(normalizedRule)) {
      return true;
    }
  }
  return false;
}

export function scoreIssues(issues: SeoAuditIssue[]): number {
  const penalty = issues.reduce((sum, issue) => {
    if (issue.severity === "error") return sum + 28;
    if (issue.severity === "warning") return sum + 10;
    return sum + 3;
  }, 0);
  return Math.max(0, 100 - penalty);
}

export function averageForAgent(
  reports: SeoAuditReport[],
  agent: SeoAgentId,
): number {
  const agentReports = reports.filter((report) => report.agent === agent);
  if (agentReports.length === 0) return 100;
  return Math.round(
    agentReports.reduce((sum, report) => sum + report.score, 0) /
      agentReports.length,
  );
}

export function staticIssues(
  title: string,
  description: string,
): SeoAuditIssue[] {
  const issues: SeoAuditIssue[] = [];
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

export function scoreStaticPage(title: string, description: string): number {
  return Math.max(
    0,
    100 -
      staticIssues(title, description).reduce(
        (sum, issue) => sum + (issue.severity === "error" ? 18 : 8),
        0,
      ),
  );
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
