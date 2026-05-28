export const REQUIRED_HUBS = [
  "/codex-pets",
  "/claude-code-pets",
  "/cursor-pets",
  "/gemini-cli-pets",
  "/terminal-pets",
  "/ai-agent-pets",
  "/developer-mascots",
] as const;

export const REQUIRED_STRUCTURED_DATA_FILES = [
  "src/app/[locale]/page.tsx",
  "src/app/[locale]/pets/[slug]/page.tsx",
  "src/components/seo-agent-page.tsx",
  "src/app/[locale]/best/[slug]/page.tsx",
  "src/app/[locale]/guides/[slug]/page.tsx",
  "src/app/[locale]/topics/[slug]/page.tsx",
] as const;
