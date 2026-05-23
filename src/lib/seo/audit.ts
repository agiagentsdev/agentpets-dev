export type SeoAuditSeverity = "error" | "warning" | "info";

export type SeoAuditIssue = {
  code: string;
  severity: SeoAuditSeverity;
  message: string;
};

export type SeoAuditInput = {
  slug: string;
  displayName: string;
  description: string;
  kind?: string | null;
  tags?: string[] | null;
  vibes?: string[] | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string[] | null;
  seoIntro?: string | null;
  seoFaq?: Array<{ question: string; answer: string }> | null;
};

export type SeoAuditResult = {
  score: number;
  issues: SeoAuditIssue[];
  suggestions: SeoSuggestion;
};

export type SeoSuggestion = {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  seoIntro: string;
  seoFaq: Array<{ question: string; answer: string }>;
};

const TITLE_MIN = 35;
const TITLE_MAX = 68;
const DESCRIPTION_MIN = 110;
const DESCRIPTION_MAX = 158;
const INTRO_MIN = 180;
const KEYWORD_MIN = 6;
const FAQ_MIN = 2;

export function auditPetSeo(input: SeoAuditInput): SeoAuditResult {
  const suggestions = suggestPetSeo(input);
  const issues: SeoAuditIssue[] = [];

  const title = clean(input.seoTitle);
  const description = clean(input.seoDescription);
  const intro = clean(input.seoIntro);
  const keywords = normalizeList(input.seoKeywords);
  const faq = normalizeFaq(input.seoFaq);

  if (!title) {
    issues.push(issue("missing_title", "error", "Missing custom SEO title."));
  } else {
    if (title.length < TITLE_MIN) {
      issues.push(issue("short_title", "warning", "SEO title is too short."));
    }
    if (title.length > TITLE_MAX) {
      issues.push(issue("long_title", "error", "SEO title is too long."));
    }
    if (!title.toLowerCase().includes(input.displayName.toLowerCase())) {
      issues.push(
        issue("title_missing_pet_name", "warning", "Title misses pet name."),
      );
    }
  }

  if (!description) {
    issues.push(
      issue("missing_description", "error", "Missing custom SEO description."),
    );
  } else {
    if (description.length < DESCRIPTION_MIN) {
      issues.push(
        issue("short_description", "warning", "SEO description is too short."),
      );
    }
    if (description.length > DESCRIPTION_MAX) {
      issues.push(
        issue("long_description", "error", "SEO description is too long."),
      );
    }
    if (!description.toLowerCase().includes(input.displayName.toLowerCase())) {
      issues.push(
        issue(
          "description_missing_pet_name",
          "warning",
          "Description misses pet name.",
        ),
      );
    }
  }

  if (keywords.length < KEYWORD_MIN) {
    issues.push(
      issue("thin_keywords", "warning", "Add more focused SEO keywords."),
    );
  }

  if (!intro || intro.length < INTRO_MIN) {
    issues.push(
      issue("thin_intro", "warning", "SEO intro is missing or too thin."),
    );
  }

  if (faq.length < FAQ_MIN) {
    issues.push(issue("thin_faq", "warning", "Add at least two SEO FAQs."));
  }

  const baseDescription = clean(input.description);
  if (
    description &&
    baseDescription &&
    description.toLowerCase() === baseDescription.toLowerCase()
  ) {
    issues.push(
      issue(
        "description_duplicates_body",
        "warning",
        "SEO description duplicates the visible description.",
      ),
    );
  }

  const score = Math.max(
    0,
    100 -
      issues.reduce((sum, item) => {
        if (item.severity === "error") return sum + 18;
        if (item.severity === "warning") return sum + 8;
        return sum + 3;
      }, 0),
  );

  return { score, issues, suggestions };
}

export function suggestPetSeo(input: SeoAuditInput): SeoSuggestion {
  const kind = clean(input.kind) ?? "pet";
  const tags = normalizeList(input.tags).slice(0, 4);
  const vibes = normalizeList(input.vibes).slice(0, 3);
  const name = clean(input.displayName) ?? input.slug;
  const tagPhrase = tags.length ? tags.join(", ") : "AI coding";
  const vibePhrase = vibes.length ? vibes.join(", ") : "focused";

  return {
    seoTitle: compact(
      `${name} AI Coding Pet for Codex, Claude Code, and Cursor`,
      TITLE_MAX,
    ),
    seoDescription: compact(
      `Install ${name}, an animated ${kind} pet for Codex, Claude Code, Cursor, Gemini CLI, and AI coding workflows. Includes a README badge, embed, and API metadata.`,
      DESCRIPTION_MAX,
    ),
    seoKeywords: unique([
      `${name} pet`,
      `${name} Codex pet`,
      `${name} AI coding pet`,
      `${name} developer mascot`,
      "Codex pets",
      "Claude Code pets",
      "Cursor pets",
      "Gemini CLI pets",
      "AI coding pets",
      "developer mascot",
      ...tags,
      ...vibes,
    ]).slice(0, 18),
    seoIntro:
      `${name} is an animated ${kind} for developers who want a ${vibePhrase} companion during AI coding sessions. ` +
      `It fits Codex, Claude Code, Cursor, Gemini CLI, and related agent workflows, while keeping the asset portable through AgentPets install commands, badges, embeds, and public API metadata. ` +
      `Use it for ${tagPhrase} workspaces, demos, READMEs, livestreams, and team setup guides.`,
    seoFaq: [
      {
        question: `How do I install ${name}?`,
        answer: `Run the AgentPets install command from the ${name} page. The CLI downloads the pet package and prepares it for AgentPets-compatible desktop and coding-agent workflows.`,
      },
      {
        question: `Does ${name} work with Codex and other AI coding tools?`,
        answer:
          "Yes. AgentPets packages pets with portable spritesheet and pet.json metadata so they can be reused across Codex-style pets, desktop companion flows, badges, embeds, and future agent integrations.",
      },
      {
        question: `Can I share ${name} in a README or docs page?`,
        answer:
          "Yes. Every approved AgentPets page exposes a README badge, an embeddable pet card, and a public API URL for developer projects.",
      },
    ],
  };
}

function issue(
  code: string,
  severity: SeoAuditSeverity,
  message: string,
): SeoAuditIssue {
  return { code, severity, message };
}

function clean(value: string | null | undefined): string | null {
  const cleaned = value?.replace(/\s+/g, " ").trim();
  return cleaned || null;
}

function normalizeList(value: string[] | null | undefined): string[] {
  if (!Array.isArray(value)) return [];
  return unique(value.map((item) => clean(item)).filter(Boolean) as string[]);
}

function normalizeFaq(
  value: Array<{ question: string; answer: string }> | null | undefined,
): Array<{ question: string; answer: string }> {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => clean(item.question) && clean(item.answer));
}

function unique(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const cleaned = clean(value);
    if (!cleaned) continue;
    const key = cleaned.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(cleaned);
  }
  return out;
}

function compact(value: string, max: number): string {
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  const clipped = cleaned.slice(0, max - 1);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${clipped.slice(0, lastSpace > 40 ? lastSpace : max - 1).trim()}...`;
}
