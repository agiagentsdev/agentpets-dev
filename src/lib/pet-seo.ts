import { installCommandFor, siteConfig } from "@/lib/site-config";
import type { PetdexPet, PetSeoFaq } from "@/lib/types";

export type ResolvedPetSeo = {
  title: string;
  description: string;
  keywords: string[];
  intro: string;
  faq: PetSeoFaq[];
  useCases: string[];
  internalLinks: Array<{ href: string; label: string; description: string }>;
};

const MAX_TITLE_CHARS = 68;
const MAX_DESCRIPTION_CHARS = 158;

export function resolvePetSeo(pet: PetdexPet): ResolvedPetSeo {
  const keywords = uniqueStrings([
    ...pet.seoKeywords,
    pet.displayName,
    `${pet.displayName} AI coding pet`,
    `${pet.displayName} Codex pet`,
    `${pet.displayName} pixel pet`,
    `${pet.displayName} developer pet`,
    "AI coding pet",
    "Codex pet",
    "Claude Code pet",
    "Cursor pet",
    "Gemini CLI pet",
    "GitHub Copilot pet",
    "Google Antigravity pet",
    "Windsurf pet",
    "OpenCode pet",
    "developer mascot",
    ...pet.tags,
    ...pet.vibes,
  ]).slice(0, 18);

  const title =
    cleanText(pet.seoTitle) ??
    `${pet.displayName} AI Coding Pet for Codex, Claude Code & Cursor`;
  const description =
    cleanText(pet.seoDescription) ??
    compact(
      `Install ${pet.displayName}, an animated ${pet.kind} for AgentPets, Codex and AI coding workflows. ${pet.description}`,
      MAX_DESCRIPTION_CHARS,
    );

  return {
    title: compact(title, MAX_TITLE_CHARS),
    description: compact(description, MAX_DESCRIPTION_CHARS),
    keywords,
    intro:
      cleanText(pet.seoIntro) ??
      `${pet.displayName} is an animated ${pet.kind} built for developers who want a visible companion while working with AI coding agents. Install it with ${installCommandFor(pet.slug)} and use it across AgentPets Desktop, Codex-style pet folders, and agent hook workflows.`,
    faq: pet.seoFaq.length > 0 ? pet.seoFaq : fallbackFaq(pet),
    useCases: buildUseCases(pet),
    internalLinks: buildInternalLinks(pet),
  };
}

export function petCanonicalUrl(slug: string): string {
  return `${siteConfig.url}/pets/${slug}`;
}

function fallbackFaq(pet: PetdexPet): PetSeoFaq[] {
  return [
    {
      question: `How do I install ${pet.displayName}?`,
      answer: `Run ${installCommandFor(pet.slug)} in your terminal. AgentPets downloads the pet package and places it into the local pet directories used by AgentPets and Codex-style desktop pets.`,
    },
    {
      question: `Does ${pet.displayName} work with Codex, Claude Code, Cursor, and Gemini CLI?`,
      answer:
        "Yes. AgentPets is designed as a cross-agent desktop companion layer, with install paths and hooks that can support Codex, Claude Code, Cursor, Gemini CLI, and related developer workflows.",
    },
    {
      question: `Can I share ${pet.displayName} with another developer?`,
      answer: `Yes. Share the pet page at ${petCanonicalUrl(pet.slug)} or send the install command directly so another developer can add it to their local setup.`,
    },
  ];
}

function buildUseCases(pet: PetdexPet): string[] {
  const vibe = pet.vibes[0] ?? "focused";
  const tags = pet.tags.slice(0, 3).join(", ") || "AI coding sessions";
  return [
    `Use ${pet.displayName} as a ${vibe} desktop companion while reviewing diffs, running tests, or pairing with an AI agent.`,
    `Add a recognizable ${pet.kind} mascot to developer demos, livestreams, and workstation screenshots.`,
    `Collect it alongside other ${tags} pets to build a themed coding workspace.`,
  ];
}

function buildInternalLinks(pet: PetdexPet): ResolvedPetSeo["internalLinks"] {
  const links: ResolvedPetSeo["internalLinks"] = [
    {
      href: "/ai-coding-pets",
      label: "AI coding pets",
      description: "Browse pets designed for AI-assisted development.",
    },
    {
      href: "/codex-pets",
      label: "Codex pets",
      description: "Install pets into Codex-compatible local folders.",
    },
    {
      href: "/terminal-ai-agent-pets",
      label: "Terminal AI agent pets",
      description: "Explore pets for Codex, Claude Code, Gemini CLI, and OpenCode.",
    },
    {
      href: "/ai-code-editor-pets",
      label: "AI code editor pets",
      description: "Find pets for Cursor, Windsurf, Antigravity, and agent IDEs.",
    },
    {
      href: "/download",
      label: "AgentPets Desktop",
      description: "Set up the desktop companion and agent hooks.",
    },
  ];

  if (pet.kind) {
    links.unshift({
      href: `/kind/${pet.kind}`,
      label: `${titleCase(pet.kind)} pets`,
      description: `More ${pet.kind} companions from the AgentPets gallery.`,
    });
  }

  return links;
}

function cleanText(value: string | null | undefined): string | null {
  const trimmed = value?.replace(/\s+/g, " ").trim();
  return trimmed || null;
}

function compact(value: string, max: number): string {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const clipped = clean.slice(0, max - 1);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${clipped.slice(0, lastSpace > 40 ? lastSpace : max - 1).trim()}…`;
}

function uniqueStrings(values: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const clean = cleanText(value);
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(clean);
  }
  return out;
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
