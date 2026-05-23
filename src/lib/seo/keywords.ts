export type SeoIntent =
  | "browse"
  | "install"
  | "build"
  | "api"
  | "share"
  | "learn";

export type KeywordCluster = {
  primary: string;
  secondary: string[];
  aliases: string[];
  intent: SeoIntent[];
};

export const seoKeywordClusters = {
  homepage: {
    primary: "AI coding pets",
    secondary: [
      "animated pets for AI coding agents",
      "developer pets",
      "coding companions",
      "developer mascots",
      "AI agent pet gallery",
    ],
    aliases: ["AgentPets", "agent pets", "coding pets"],
    intent: ["browse", "install", "share"],
  },
  codex: {
    primary: "Codex pets",
    secondary: [
      "Codex pet",
      "OpenAI Codex pets",
      "Codex CLI pet",
      "Codex desktop pet",
      "Codex pet install",
      "Codex pet generator",
      "Codex pet spritesheet",
      "Codex pet json",
    ],
    aliases: ["codex pet", "codex pets", "codex companion"],
    intent: ["browse", "install", "build"],
  },
  claudeCode: {
    primary: "Claude Code pets",
    secondary: [
      "Claude Code mascot",
      "Claude Code companion",
      "Claude Code desktop pet",
      "Claude Code agent pet",
      "Claude Code workflow pet",
    ],
    aliases: ["claude code pet", "claude coding pet"],
    intent: ["browse", "share"],
  },
  cursor: {
    primary: "Cursor pets",
    secondary: [
      "Cursor AI pets",
      "Cursor mascot",
      "AI code editor pets",
      "Cursor coding companion",
      "Cursor developer mascot",
    ],
    aliases: ["cursor pet", "cursor ai pet"],
    intent: ["browse", "share"],
  },
  geminiCli: {
    primary: "Gemini CLI pets",
    secondary: [
      "Gemini CLI mascot",
      "Gemini coding agent pets",
      "terminal AI agent pets",
      "Gemini developer mascot",
    ],
    aliases: ["gemini cli pet", "gemini pet"],
    intent: ["browse", "install"],
  },
  googleAntigravity: {
    primary: "Google Antigravity pets",
    secondary: [
      "Antigravity coding pets",
      "Antigravity AI agent pets",
      "Google coding agent pets",
      "Google Antigravity mascot",
    ],
    aliases: ["antigravity pets", "antigravity pet"],
    intent: ["browse", "share"],
  },
  githubCopilot: {
    primary: "GitHub Copilot coding agent pets",
    secondary: [
      "GitHub Copilot pets",
      "Copilot coding agent mascot",
      "GitHub Copilot developer pets",
      "Copilot AI coding companion",
    ],
    aliases: ["copilot pets", "github copilot pet"],
    intent: ["browse", "share"],
  },
  windsurf: {
    primary: "Windsurf pets",
    secondary: [
      "Windsurf AI IDE pets",
      "Windsurf coding companion",
      "Windsurf mascot",
      "AI IDE pets",
    ],
    aliases: ["windsurf pet", "windsurf ai pet"],
    intent: ["browse", "share"],
  },
  opencode: {
    primary: "OpenCode pets",
    secondary: [
      "OpenCode AI coding agent pets",
      "open-source AI coding agent pets",
      "terminal coding agent pets",
      "OpenCode mascot",
    ],
    aliases: ["opencode pet", "open code pets"],
    intent: ["browse", "install"],
  },
  petBuilder: {
    primary: "pet builder",
    secondary: [
      "Codex pet builder",
      "pet.json generator",
      "spritesheet generator",
      "browser pet creator",
      "AI pet generator",
    ],
    aliases: ["pet creator", "agent pet builder"],
    intent: ["build", "learn"],
  },
  api: {
    primary: "AgentPets API",
    secondary: [
      "pet gallery API",
      "developer pet API",
      "AgentPets badge API",
      "animated pet embed API",
    ],
    aliases: ["agentpets public api", "petdex api"],
    intent: ["api", "share"],
  },
} satisfies Record<string, KeywordCluster>;

export function clusterKeywords(...clusters: KeywordCluster[]): string[] {
  const seen = new Set<string>();
  const keywords: string[] = [];
  for (const cluster of clusters) {
    for (const keyword of [
      cluster.primary,
      ...cluster.secondary,
      ...cluster.aliases,
    ]) {
      const clean = keyword.trim();
      const key = clean.toLowerCase();
      if (!clean || seen.has(key)) continue;
      seen.add(key);
      keywords.push(clean);
    }
  }
  return keywords;
}
