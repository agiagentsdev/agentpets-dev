import { runContentAgent } from "./content-agent";
import { runGrowthLoopAgent } from "./growth-loop-agent";
import { runInternalLinkAgent } from "./internal-link-agent";
import { runMetadataAgent } from "./metadata-agent";
import { runPetPageAgent } from "./pet-page-agent";
import { runStructuredDataAgent } from "./structured-data-agent";
import { runTechnicalSeoAgent } from "./technical-agent";
import type { SeoAgentId, SeoAgentSelector, SeoAuditAgent } from "./types";

export type {
  SeoAgentId,
  SeoAgentSelector,
  SeoAuditAgent,
  SeoAuditIssue,
  SeoAuditReport,
} from "./types";
export { averageForAgent } from "./utils";

export const seoAuditAgents = [
  {
    id: "technical",
    name: "Technical SEO Agent",
    role: "Robots, sitemap coverage, route existence, canonical crawlability.",
    run: runTechnicalSeoAgent,
  },
  {
    id: "metadata",
    name: "Metadata SERP Agent",
    role: "Title and meta description length, keyword focus, noindex sanity.",
    run: runMetadataAgent,
  },
  {
    id: "content",
    name: "Content Hub Agent",
    role: "Topic/guide/agent hubs, query intent, crawlable page inventory.",
    run: runContentAgent,
  },
  {
    id: "internal-links",
    name: "Internal Link Graph Agent",
    role: "Homepage/footer/hub links that push authority into money pages.",
    run: runInternalLinkAgent,
  },
  {
    id: "structured-data",
    name: "Structured Data Agent",
    role: "JSON-LD coverage for homepage, pet pages, hubs, guides, and topics.",
    run: runStructuredDataAgent,
  },
  {
    id: "growth-loop",
    name: "Creator Growth Agent",
    role: "Badge/embed/share analytics loops that create links and repeat visits.",
    run: runGrowthLoopAgent,
  },
  {
    id: "pet-pages",
    name: "Pet Page Agent",
    role: "Per-pet SEO fields, intro/FAQ depth, page-level enrichment.",
    run: runPetPageAgent,
  },
] satisfies SeoAuditAgent[];

export const seoAuditAgentIds = seoAuditAgents.map((agent) => agent.id);

export function selectSeoAuditAgents(
  selector: SeoAgentSelector,
): SeoAuditAgent[] {
  if (selector === "all") return seoAuditAgents;
  return seoAuditAgents.filter((agent) => agent.id === selector);
}

export function isSeoAgentSelector(value: string): value is SeoAgentSelector {
  return value === "all" || seoAuditAgentIds.includes(value as SeoAgentId);
}
