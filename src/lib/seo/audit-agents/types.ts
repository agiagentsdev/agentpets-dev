export type SeoAgentId =
  | "technical"
  | "metadata"
  | "content"
  | "internal-links"
  | "structured-data"
  | "growth-loop"
  | "pet-pages";

export type SeoAgentSelector = SeoAgentId | "all";

export type SeoAuditIssue = {
  code: string;
  severity: "error" | "warning" | "info";
  message: string;
};

export type SeoAuditReport = {
  type: string;
  slug: string;
  title: string;
  score: number;
  agent: SeoAgentId;
  issues: SeoAuditIssue[];
};

export type SeoAuditAgent = {
  id: SeoAgentId;
  name: string;
  role: string;
  run: () => Promise<SeoAuditReport[]>;
};
