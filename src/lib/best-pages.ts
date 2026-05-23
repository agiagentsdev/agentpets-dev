import type { SortKey } from "@/lib/pet-search";
import type { PetKind, PetVibe } from "@/lib/types";

export type BestPageSlug =
  | "codex-pets"
  | "terminal-ai-agent-pets"
  | "ai-code-editor-pets"
  | "cute-coding-pets"
  | "focus-pets"
  | "developer-mascots";

export type BestPageConfig = {
  slug: BestPageSlug;
  title: string;
  metaTitle: string;
  description: string;
  intro: string;
  query?: string;
  sort: SortKey;
  vibes?: PetVibe[];
  kinds?: PetKind[];
  keywords: string[];
  related: Array<{ href: string; label: string }>;
  faqs: Array<{ question: string; answer: string }>;
};

export const bestPages = {
  "codex-pets": {
    slug: "codex-pets",
    title: "Best Codex pets to install for AI coding sessions",
    metaTitle: "Best Codex Pets to Install",
    description:
      "A curated, metrics-aware page for the best Codex pets on AgentPets: popular animated companions with install commands, badges, embeds, and creator credit.",
    intro:
      "Start here when you want a proven Codex pet instead of browsing the full gallery. This page favors pets that are easy to install, easy to share, and useful as developer mascots in READMEs, demos, streams, and AI coding sessions.",
    query: "codex",
    sort: "installed",
    keywords: [
      "best Codex pets",
      "Codex pets",
      "install Codex pet",
      "AI coding pets",
      "developer mascot",
    ],
    related: [
      { href: "/codex-pets", label: "Codex pets" },
      { href: "/guides/install-codex-pet", label: "Install guide" },
      { href: "/pet-builder", label: "Build a pet" },
    ],
    faqs: [
      {
        question: "How are the best Codex pets ranked?",
        answer:
          "AgentPets uses public metrics such as installs and likes, then keeps the page focused on pets with usable install commands, stable assets, badges, embeds, and creator attribution.",
      },
      {
        question: "Can I submit a Codex pet for this page?",
        answer:
          "Yes. Submit a valid pet package, add clear metadata, and share the approved page so installs, likes, and links can grow naturally.",
      },
    ],
  },
  "terminal-ai-agent-pets": {
    slug: "terminal-ai-agent-pets",
    title: "Best terminal AI agent pets for Codex, Claude Code, and OpenCode",
    metaTitle: "Best Terminal AI Agent Pets",
    description:
      "Browse top terminal-friendly AI agent pets for Codex, Claude Code, Gemini CLI, OpenCode, and developer workflows that live in the shell.",
    intro:
      "Terminal-native AI agents need pets that are lightweight, installable, and easy to reference in setup docs. These picks work well for command-line demos, team onboarding, and coding sessions where the companion should stay visible without taking over the workflow.",
    sort: "installed",
    keywords: [
      "best terminal AI agent pets",
      "terminal coding pets",
      "Claude Code pets",
      "Gemini CLI pets",
      "OpenCode pets",
    ],
    related: [
      { href: "/terminal-ai-agent-pets", label: "Terminal AI agent pets" },
      { href: "/claude-code-pets", label: "Claude Code pets" },
      { href: "/opencode-pets", label: "OpenCode pets" },
    ],
    faqs: [
      {
        question: "Do terminal AI agent pets need a special format?",
        answer:
          "No. AgentPets keeps the package portable: spritesheet assets, pet.json metadata, public URLs, and install commands that agent runtimes can reuse.",
      },
      {
        question: "Which terminal tools are a good fit?",
        answer:
          "Codex, Claude Code, Gemini CLI, OpenCode, and similar terminal-first coding agents are the strongest fit for this collection.",
      },
    ],
  },
  "ai-code-editor-pets": {
    slug: "ai-code-editor-pets",
    title: "Best AI code editor pets for Cursor, Windsurf, and Antigravity",
    metaTitle: "Best AI Code Editor Pets",
    description:
      "A curated page for AI code editor pets that fit Cursor, Windsurf, Google Antigravity, pair-programming demos, and agent IDE culture.",
    intro:
      "AI code editors are becoming social surfaces as much as productivity tools. These pets are good candidates for screenshots, launch pages, docs, and demos around editor-native coding agents.",
    sort: "popular",
    keywords: [
      "best AI code editor pets",
      "Cursor pets",
      "Windsurf pets",
      "Google Antigravity pets",
      "AI IDE pets",
    ],
    related: [
      { href: "/ai-code-editor-pets", label: "AI code editor pets" },
      { href: "/cursor-pets", label: "Cursor pets" },
      { href: "/windsurf-pets", label: "Windsurf pets" },
    ],
    faqs: [
      {
        question: "Can the same pet work across multiple editors?",
        answer:
          "Yes. AgentPets pages expose portable metadata, badges, embeds, and API URLs, so one pet can be reused across many editor-focused workflows.",
      },
      {
        question: "What makes a pet good for AI IDEs?",
        answer:
          "Clear identity, readable sprites, easy install links, and shareable creator attribution make a pet better for editor communities.",
      },
    ],
  },
  "cute-coding-pets": {
    slug: "cute-coding-pets",
    title: "Best cute coding pets for cozy developer workspaces",
    metaTitle: "Best Cute Coding Pets",
    description:
      "Find cute, cozy, cheerful, and wholesome coding pets for developer desks, README badges, streams, docs, and AI coding sessions.",
    intro:
      "Cute coding pets work especially well as low-friction share assets: they make screenshots friendlier, READMEs more memorable, and developer profiles easier to recognize.",
    sort: "popular",
    vibes: ["cozy", "cheerful", "wholesome", "playful"],
    keywords: [
      "cute coding pets",
      "cozy coding pets",
      "developer pets",
      "pixel pets",
      "README mascot",
    ],
    related: [
      { href: "/vibe/cozy", label: "Cozy pets" },
      { href: "/vibe/cheerful", label: "Cheerful pets" },
      { href: "/developer-pets", label: "Developer pets" },
    ],
    faqs: [
      {
        question: "Are cute coding pets still useful for serious projects?",
        answer:
          "Yes. A pet can be playful while still acting as a durable README badge, creator profile asset, and developer community signal.",
      },
      {
        question: "Can I embed a cute pet on my docs page?",
        answer:
          "Yes. Every approved AgentPets pet includes an iframe embed and a canonical pet page for attribution.",
      },
    ],
  },
  "focus-pets": {
    slug: "focus-pets",
    title: "Best focus pets for deep work and AI coding",
    metaTitle: "Best Focus Pets for AI Coding",
    description:
      "Browse focused, calm, and minimal developer pets for deep work sessions, AI coding agents, terminal workflows, and desktop companions.",
    intro:
      "Focus pets are designed for long coding sessions where the companion should be visible but not distracting. They work well with terminal agents, desktop overlays, and team setup guides.",
    sort: "installed",
    vibes: ["focused", "calm"],
    keywords: [
      "best focus pets",
      "focused coding pets",
      "calm developer pets",
      "AI coding companion",
      "deep work mascot",
    ],
    related: [
      { href: "/vibe/focused", label: "Focused pets" },
      { href: "/vibe/calm", label: "Calm pets" },
      { href: "/topics/ai-coding-agents", label: "AI coding agent pets" },
    ],
    faqs: [
      {
        question: "What makes a pet good for focus?",
        answer:
          "Good focus pets are readable at small sizes, visually calm, and easy to install without adding noise to the developer workflow.",
      },
      {
        question: "Can focus pets be used with AI agents?",
        answer:
          "Yes. AgentPets is built around AI coding workflows, including Codex, Claude Code, Cursor, Gemini CLI, and other agent tools.",
      },
    ],
  },
  "developer-mascots": {
    slug: "developer-mascots",
    title: "Best developer mascots for open-source projects",
    metaTitle: "Best Developer Mascots for Open Source",
    description:
      "Browse developer mascots with install commands, README badges, embeds, creator attribution, and public API metadata for open-source projects.",
    intro:
      "A good developer mascot is more than a logo. It should travel through READMEs, docs, launch posts, creator profiles, embeds, and public APIs while keeping attribution intact.",
    sort: "popular",
    keywords: [
      "best developer mascots",
      "open source mascot",
      "GitHub README badge",
      "developer pets",
      "coding mascot",
    ],
    related: [
      { href: "/topics/developer-mascots", label: "Developer mascot topic" },
      { href: "/guides/add-agentpets-badge", label: "Badge guide" },
      { href: "/developers", label: "Developer API" },
    ],
    faqs: [
      {
        question: "Can I use AgentPets as a mascot system?",
        answer:
          "Yes. AgentPets gives each mascot a page, badge, embed, install command, API record, and creator credit.",
      },
      {
        question: "Do mascot pages help SEO?",
        answer:
          "They can, when each page has unique assets, clear attribution, internal links, and useful install/share actions.",
      },
    ],
  },
} satisfies Record<BestPageSlug, BestPageConfig>;

export function getBestPage(slug: string): BestPageConfig | null {
  return (bestPages as Record<string, BestPageConfig>)[slug] ?? null;
}

export function allBestPages(): BestPageConfig[] {
  return Object.values(bestPages);
}
