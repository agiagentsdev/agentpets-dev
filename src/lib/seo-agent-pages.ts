import { installCommandFor, siteConfig, siteUrl } from "@/lib/site-config";
import { seoKeywordClusters } from "@/lib/seo/keywords";

import type { Locale } from "@/i18n/config";

export type SeoAgentSlug =
  | "ai-coding-pets"
  | "codex-pets"
  | "claude-code-pets"
  | "cursor-pets"
  | "gemini-cli-pets"
  | "google-antigravity-pets"
  | "github-copilot-pets"
  | "windsurf-pets"
  | "opencode-pets"
  | "terminal-ai-agent-pets"
  | "ai-code-editor-pets"
  | "codex-pet-generator"
  | "ai-agent-pet-gallery"
  | "developer-pets"
  | "open-source-codex-pets"
  | "pet-builder";

type LocalizedText = { en: string } & Partial<Record<Locale, string>>;

type SeoAgentPage = {
  slug: SeoAgentSlug;
  agentName: string;
  eyebrow: LocalizedText;
  title: LocalizedText;
  description: LocalizedText;
  metaTitle: LocalizedText;
  metaDescription: LocalizedText;
  commandSlug: string;
  keywords: string[];
  useCases: LocalizedText[];
  faq: { q: LocalizedText; a: LocalizedText }[];
};

function productFaq(topic: string): SeoAgentPage["faq"] {
  return [
    {
      q: { en: `What is ${topic}?` },
      a: {
        en: `${topic} is part of AgentPets.dev, a developer-first catalog and toolchain for animated coding companions that can be installed, shared, and submitted by the community.`,
      },
    },
    {
      q: { en: "Can I submit my own pet?" },
      a: {
        en: "Yes. AgentPets supports the open pet.json plus spritesheet package format today, and the roadmap includes a browser pet builder for designing pets without leaving the site.",
      },
    },
  ];
}

const productUseCases: LocalizedText[] = [
  {
    en: "Create search-focused pages around the terms developers already use when looking for Codex pets, AI coding mascots, and pet builders.",
  },
  {
    en: "Give every launch post, README, tutorial, and community reply a focused page to link to instead of only sending people to the homepage.",
  },
  {
    en: "Keep the product extensible: gallery, CLI, package format, builder, and multi-agent runtime support can grow without changing the URL strategy.",
  },
];

const sharedUseCases: LocalizedText[] = [
  {
    en: "Give long coding sessions a visible companion without changing your editor workflow.",
    es: "Dale a tus sesiones largas de código un acompañante visible sin cambiar tu editor.",
    zh: "在不改变编辑器工作流的前提下，为长时间编码添加一个可见伙伴。",
  },
  {
    en: "Share a pet install command in a README, stream overlay, tutorial, or team setup guide.",
    es: "Comparte un comando de instalación en un README, overlay, tutorial o guía de equipo.",
    zh: "把宠物安装命令放进 README、直播叠层、教程或团队配置指南。",
  },
  {
    en: "Use the same pet package format across Codex today and more agent runtimes as AgentPets expands.",
    es: "Usa el mismo formato de paquete en Codex hoy y en más agentes a medida que AgentPets crece.",
    zh: "现在可在 Codex 使用同一宠物包格式，后续也能扩展到更多智能体运行时。",
  },
];

const sharedFaq = [
  {
    q: {
      en: "Do I need an account to install a pet?",
      es: "¿Necesito una cuenta para instalar una mascota?",
      zh: "安装宠物需要账号吗？",
    },
    a: {
      en: "No. Installs are public. You only sign in when you submit, claim, or manage your own pets.",
      es: "No. Las instalaciones son públicas. Solo inicias sesión para enviar, reclamar o administrar tus mascotas.",
      zh: "不需要。安装是公开的。只有提交、认领或管理自己的宠物时才需要登录。",
    },
  },
  {
    q: {
      en: "Can I design my own pet later?",
      es: "¿Puedo diseñar mi propia mascota después?",
      zh: "之后可以设计自己的宠物吗？",
    },
    a: {
      en: "Yes. AgentPets keeps the Petdex-compatible pet.json plus spritesheet format, and the roadmap includes a web pet builder/generator.",
      es: "Sí. AgentPets mantiene el formato compatible con Petdex: pet.json más spritesheet, y el roadmap incluye un generador web.",
      zh: "可以。AgentPets 保留兼容 Petdex 的 pet.json 加 spritesheet 格式，路线图包含网页宠物生成器。",
    },
  },
] satisfies SeoAgentPage["faq"];

export const seoAgentPages: Record<SeoAgentSlug, SeoAgentPage> = {
  "ai-coding-pets": {
    slug: "ai-coding-pets",
    agentName: "AI coding agents",
    eyebrow: {
      en: "AI coding pets",
      es: "Mascotas para agentes de código",
      zh: "AI 编码宠物",
    },
    title: {
      en: "Animated pets for AI coding agents",
      es: "Mascotas animadas para agentes de código con IA",
      zh: "适用于 AI 编码智能体的动画宠物",
    },
    description: {
      en: "Browse developer pets that can travel across Codex, Claude Code, Cursor, Gemini CLI, and future agent workflows.",
      es: "Explora mascotas para desarrolladores que pueden acompañar Codex, Claude Code, Cursor, Gemini CLI y futuros flujos de agentes.",
      zh: "浏览可用于 Codex、Claude Code、Cursor、Gemini CLI 以及未来智能体工作流的开发者宠物。",
    },
    metaTitle: {
      en: "AI Coding Pets for Codex, Claude Code, Cursor, and Gemini CLI",
      es: "Mascotas de código IA para Codex, Claude Code, Cursor y Gemini CLI",
      zh: "适用于 Codex、Claude Code、Cursor 和 Gemini CLI 的 AI 编码宠物",
    },
    metaDescription: {
      en: "Install animated developer pets for AI coding agents with npx -y https://github.com/agiagentsdev/agentpets-dev/releases/latest/download/agentpets-cli.tgz. Browse, preview, submit, and share pets from AgentPets.dev.",
      es: "Instala mascotas animadas para agentes de código con npx -y https://github.com/agiagentsdev/agentpets-dev/releases/latest/download/agentpets-cli.tgz. Explora, previsualiza, envía y comparte mascotas en AgentPets.dev.",
      zh: "使用 npx -y https://github.com/agiagentsdev/agentpets-dev/releases/latest/download/agentpets-cli.tgz 为 AI 编码智能体安装动画开发者宠物。在 AgentPets.dev 浏览、预览、提交和分享。",
    },
    commandSlug: "boba",
    keywords: [
      seoKeywordClusters.homepage.primary,
      ...seoKeywordClusters.codex.secondary,
      ...seoKeywordClusters.claudeCode.secondary,
      ...seoKeywordClusters.cursor.secondary,
      ...seoKeywordClusters.geminiCli.secondary,
    ],
    useCases: sharedUseCases,
    faq: sharedFaq,
  },
  "codex-pets": {
    slug: "codex-pets",
    agentName: "Codex",
    eyebrow: {
      en: "Codex pets",
      es: "Mascotas para Codex",
      zh: "Codex 宠物",
    },
    title: {
      en: "Codex pets you can install with one command",
      es: "Mascotas para Codex instalables con un comando",
      zh: "一条命令即可安装的 Codex 宠物",
    },
    description: {
      en: "Preview animated companions for Codex Desktop, then install one into ~/.codex/pets with a clean CLI command.",
      es: "Previsualiza acompañantes animados para Codex Desktop e instala uno en ~/.codex/pets con un comando limpio.",
      zh: "预览 Codex Desktop 动画伙伴，并用简洁 CLI 命令安装到 ~/.codex/pets。",
    },
    metaTitle: {
      en: "Codex Pets: Animated Companions for OpenAI Codex",
      es: "Mascotas para Codex: acompañantes animados para OpenAI Codex",
      zh: "Codex 宠物：OpenAI Codex 的动画伙伴",
    },
    metaDescription: {
      en: "Browse and install Codex pets from AgentPets.dev. Use npx -y https://github.com/agiagentsdev/agentpets-dev/releases/latest/download/agentpets-cli.tgz install boba to add an animated companion to Codex.",
      es: "Explora e instala mascotas para Codex desde AgentPets.dev. Usa npx -y https://github.com/agiagentsdev/agentpets-dev/releases/latest/download/agentpets-cli.tgz install boba para añadir un acompañante animado.",
      zh: "在 AgentPets.dev 浏览并安装 Codex 宠物。使用 npx -y https://github.com/agiagentsdev/agentpets-dev/releases/latest/download/agentpets-cli.tgz install boba 添加动画伙伴。",
    },
    commandSlug: "boba",
    keywords: [
      seoKeywordClusters.codex.primary,
      ...seoKeywordClusters.codex.secondary,
      ...seoKeywordClusters.codex.aliases,
    ],
    useCases: sharedUseCases,
    faq: sharedFaq,
  },
  "claude-code-pets": {
    slug: "claude-code-pets",
    agentName: "Claude Code",
    eyebrow: {
      en: "Claude Code pets",
      es: "Mascotas para Claude Code",
      zh: "Claude Code 宠物",
    },
    title: {
      en: "Claude Code pets for agent-driven dev sessions",
      es: "Mascotas para sesiones con Claude Code",
      zh: "适用于 Claude Code 开发会话的宠物",
    },
    description: {
      en: "Use AgentPets as the gallery layer for pets that fit Claude Code workflows, tutorials, and team culture.",
      es: "Usa AgentPets como galería para mascotas que encajan con Claude Code, tutoriales y cultura de equipo.",
      zh: "使用 AgentPets 为 Claude Code 工作流、教程和团队文化挑选宠物。",
    },
    metaTitle: {
      en: "Claude Code Pets and Developer Mascots",
      es: "Mascotas para Claude Code y desarrolladores",
      zh: "Claude Code 宠物与开发者吉祥物",
    },
    metaDescription: {
      en: "Discover animated developer pets for Claude Code workflows. AgentPets keeps the format open and ready for multi-agent support.",
      es: "Descubre mascotas animadas para flujos de Claude Code. AgentPets mantiene un formato abierto y preparado para multiagente.",
      zh: "发现适用于 Claude Code 工作流的动画开发者宠物。AgentPets 保持开放格式，并面向多智能体支持。",
    },
    commandSlug: "boxcat",
    keywords: [
      seoKeywordClusters.claudeCode.primary,
      ...seoKeywordClusters.claudeCode.secondary,
      ...seoKeywordClusters.claudeCode.aliases,
    ],
    useCases: sharedUseCases,
    faq: sharedFaq,
  },
  "cursor-pets": {
    slug: "cursor-pets",
    agentName: "Cursor",
    eyebrow: {
      en: "Cursor pets",
      es: "Mascotas para Cursor",
      zh: "Cursor 宠物",
    },
    title: {
      en: "Cursor pets for AI-first editor culture",
      es: "Mascotas para la cultura de editores con IA",
      zh: "面向 AI 编辑器文化的 Cursor 宠物",
    },
    description: {
      en: "A focused landing page for developers who want shareable pets around Cursor, AI pair programming, and editor-native agents.",
      es: "Una página para desarrolladores que quieren mascotas compartibles alrededor de Cursor, programación con IA y agentes dentro del editor.",
      zh: "为希望围绕 Cursor、AI 结对编程和编辑器内智能体分享宠物的开发者准备。",
    },
    metaTitle: {
      en: "Cursor Pets for AI Pair Programming",
      es: "Mascotas para Cursor y pair programming con IA",
      zh: "适用于 AI 结对编程的 Cursor 宠物",
    },
    metaDescription: {
      en: "Browse animated pets for Cursor-style AI coding workflows and share install commands with your developer community.",
      es: "Explora mascotas animadas para flujos tipo Cursor y comparte comandos de instalación con tu comunidad dev.",
      zh: "浏览适用于 Cursor 风格 AI 编码工作流的动画宠物，并与开发者社区分享安装命令。",
    },
    commandSlug: "boba",
    keywords: [
      seoKeywordClusters.cursor.primary,
      ...seoKeywordClusters.cursor.secondary,
      ...seoKeywordClusters.cursor.aliases,
    ],
    useCases: sharedUseCases,
    faq: sharedFaq,
  },
  "gemini-cli-pets": {
    slug: "gemini-cli-pets",
    agentName: "Gemini CLI",
    eyebrow: {
      en: "Gemini CLI pets",
      es: "Mascotas para Gemini CLI",
      zh: "Gemini CLI 宠物",
    },
    title: {
      en: "Gemini CLI pets for terminal-native agents",
      es: "Mascotas para Gemini CLI y agentes de terminal",
      zh: "适用于终端智能体的 Gemini CLI 宠物",
    },
    description: {
      en: "Installable pixel companions for developers who live in terminals and want agent activity to feel visible.",
      es: "Compañeros pixel art instalables para devs que viven en la terminal y quieren ver la actividad del agente.",
      zh: "为终端重度用户准备的可安装像素伙伴，让智能体活动更可见。",
    },
    metaTitle: {
      en: "Gemini CLI Pets for Terminal AI Workflows",
      es: "Mascotas para Gemini CLI y flujos de IA en terminal",
      zh: "适用于终端 AI 工作流的 Gemini CLI 宠物",
    },
    metaDescription: {
      en: "Discover terminal-friendly animated pets for Gemini CLI-style workflows. Install with npx -y https://github.com/agiagentsdev/agentpets-dev/releases/latest/download/agentpets-cli.tgz and share with devs.",
      es: "Descubre mascotas animadas para flujos tipo Gemini CLI. Instala con npx -y https://github.com/agiagentsdev/agentpets-dev/releases/latest/download/agentpets-cli.tgz y compártelas con devs.",
      zh: "发现适用于 Gemini CLI 风格工作流的终端友好动画宠物。用 npx -y https://github.com/agiagentsdev/agentpets-dev/releases/latest/download/agentpets-cli.tgz 安装并分享。",
    },
    commandSlug: "kebo",
    keywords: [
      seoKeywordClusters.geminiCli.primary,
      ...seoKeywordClusters.geminiCli.secondary,
      ...seoKeywordClusters.geminiCli.aliases,
    ],
    useCases: sharedUseCases,
    faq: sharedFaq,
  },
  "google-antigravity-pets": {
    slug: "google-antigravity-pets",
    agentName: "Google Antigravity",
    eyebrow: { en: "Google Antigravity pets" },
    title: { en: "Google Antigravity pets for agent-first coding" },
    description: {
      en: "A focused page for animated developer pets that fit Google Antigravity, Gemini-powered coding agents, and agent-first IDE workflows.",
    },
    metaTitle: { en: "Google Antigravity Pets for Agent-First Coding" },
    metaDescription: {
      en: "Browse and share animated pets for Google Antigravity-style AI coding workflows. AgentPets gives every pet an install command, badge, embed, and API record.",
    },
    commandSlug: "kebo",
    keywords: [
      seoKeywordClusters.googleAntigravity.primary,
      ...seoKeywordClusters.googleAntigravity.secondary,
      ...seoKeywordClusters.googleAntigravity.aliases,
    ],
    useCases: sharedUseCases,
    faq: productFaq("Google Antigravity Pets"),
  },
  "github-copilot-pets": {
    slug: "github-copilot-pets",
    agentName: "GitHub Copilot coding agent",
    eyebrow: { en: "GitHub Copilot pets" },
    title: { en: "GitHub Copilot coding agent pets for README-first sharing" },
    description: {
      en: "Give Copilot coding-agent workflows a shareable mascot layer with installable pets, README badges, embeds, and creator attribution.",
    },
    metaTitle: { en: "GitHub Copilot Coding Agent Pets and Mascots" },
    metaDescription: {
      en: "Explore animated pets and developer mascots for GitHub Copilot coding agent workflows. Share pets with badges, embeds, and AgentPets API links.",
    },
    commandSlug: "boba",
    keywords: [
      seoKeywordClusters.githubCopilot.primary,
      ...seoKeywordClusters.githubCopilot.secondary,
      ...seoKeywordClusters.githubCopilot.aliases,
    ],
    useCases: sharedUseCases,
    faq: productFaq("GitHub Copilot Coding Agent Pets"),
  },
  "windsurf-pets": {
    slug: "windsurf-pets",
    agentName: "Windsurf",
    eyebrow: { en: "Windsurf pets" },
    title: { en: "Windsurf pets for AI IDE workflows" },
    description: {
      en: "Browse animated pets and developer mascots designed for AI IDE culture, demos, READMEs, and shareable Windsurf setups.",
    },
    metaTitle: { en: "Windsurf Pets for AI IDE Developer Workflows" },
    metaDescription: {
      en: "Find shareable Windsurf pets and AI IDE mascots with AgentPets. Copy install commands, README badges, embeds, and public API links.",
    },
    commandSlug: "byte-bunny",
    keywords: [
      seoKeywordClusters.windsurf.primary,
      ...seoKeywordClusters.windsurf.secondary,
      ...seoKeywordClusters.windsurf.aliases,
    ],
    useCases: sharedUseCases,
    faq: productFaq("Windsurf Pets"),
  },
  "opencode-pets": {
    slug: "opencode-pets",
    agentName: "OpenCode",
    eyebrow: { en: "OpenCode pets" },
    title: { en: "OpenCode pets for open-source coding agents" },
    description: {
      en: "A landing page for terminal-native, open-source AI coding agent pets that can travel through install commands, embeds, and public metadata.",
    },
    metaTitle: { en: "OpenCode Pets for Open-Source AI Coding Agents" },
    metaDescription: {
      en: "Browse OpenCode pets and terminal AI coding mascots on AgentPets. Install, embed, badge, and reuse pet metadata through the public API.",
    },
    commandSlug: "boba",
    keywords: [
      seoKeywordClusters.opencode.primary,
      ...seoKeywordClusters.opencode.secondary,
      ...seoKeywordClusters.opencode.aliases,
    ],
    useCases: sharedUseCases,
    faq: productFaq("OpenCode Pets"),
  },
  "terminal-ai-agent-pets": {
    slug: "terminal-ai-agent-pets",
    agentName: "terminal AI agents",
    eyebrow: { en: "Terminal AI agent pets" },
    title: { en: "Terminal AI agent pets for visible coding sessions" },
    description: {
      en: "Installable animated companions for developers who live in terminals and want Codex, Claude Code, Gemini CLI, and OpenCode sessions to feel visible.",
    },
    metaTitle: { en: "Terminal AI Agent Pets for Codex, Claude Code, and OpenCode" },
    metaDescription: {
      en: "Browse terminal AI agent pets for Codex, Claude Code, Gemini CLI, and OpenCode. AgentPets packages every mascot with install commands and share links.",
    },
    commandSlug: "kebo",
    keywords: [
      "terminal AI agent pets",
      "terminal coding pets",
      seoKeywordClusters.geminiCli.primary,
      seoKeywordClusters.opencode.primary,
      seoKeywordClusters.claudeCode.primary,
      seoKeywordClusters.codex.primary,
    ],
    useCases: sharedUseCases,
    faq: productFaq("Terminal AI Agent Pets"),
  },
  "ai-code-editor-pets": {
    slug: "ai-code-editor-pets",
    agentName: "AI code editors",
    eyebrow: { en: "AI code editor pets" },
    title: { en: "AI code editor pets for Cursor, Windsurf, and agent IDEs" },
    description: {
      en: "A discovery page for editor-native coding mascots that fit Cursor, Windsurf, Google Antigravity, and future AI IDE workflows.",
    },
    metaTitle: { en: "AI Code Editor Pets for Cursor, Windsurf, and Antigravity" },
    metaDescription: {
      en: "Browse AI code editor pets for Cursor, Windsurf, Google Antigravity, and agent IDEs. Share install commands, badges, embeds, and profile links.",
    },
    commandSlug: "byte-bunny",
    keywords: [
      "AI code editor pets",
      "AI IDE pets",
      seoKeywordClusters.cursor.primary,
      seoKeywordClusters.windsurf.primary,
      seoKeywordClusters.googleAntigravity.primary,
      "developer mascot",
    ],
    useCases: sharedUseCases,
    faq: productFaq("AI Code Editor Pets"),
  },
  "codex-pet-generator": {
    slug: "codex-pet-generator",
    agentName: "Codex pet generator",
    eyebrow: { en: "Codex pet generator" },
    title: { en: "Generate and package Codex pets for your AI workspace" },
    description: {
      en: "AgentPets is building the generator layer for Codex pets: validate a pet.json, preview animation states, package spritesheets, and share an install command.",
    },
    metaTitle: { en: "Codex Pet Generator: Build Animated AI Coding Pets" },
    metaDescription: {
      en: "Plan, package, preview, and submit Codex pets with AgentPets. Install examples with npx -y https://github.com/agiagentsdev/agentpets-dev/releases/latest/download/agentpets-cli.tgz and follow the roadmap for the web pet generator.",
    },
    commandSlug: "boba",
    keywords: [
      seoKeywordClusters.petBuilder.primary,
      ...seoKeywordClusters.petBuilder.secondary,
      "Codex pet generator",
      "Codex pet builder",
    ],
    useCases: productUseCases,
    faq: productFaq("Codex Pet Generator"),
  },
  "ai-agent-pet-gallery": {
    slug: "ai-agent-pet-gallery",
    agentName: "AI agent pet gallery",
    eyebrow: { en: "AI agent pet gallery" },
    title: { en: "A shareable gallery for AI agent pets" },
    description: {
      en: "Browse animated pets for Codex, Claude Code, Cursor, Gemini CLI, and future agent runtimes from one developer-focused gallery.",
    },
    metaTitle: { en: "AI Agent Pet Gallery for Developer Workflows" },
    metaDescription: {
      en: "Browse installable AI agent pets, copy CLI commands, preview animations, and submit your own developer mascot on AgentPets.dev.",
    },
    commandSlug: "boba",
    keywords: [
      seoKeywordClusters.homepage.primary,
      "AI agent pet gallery",
      "developer pet gallery",
      "animated coding pets",
    ],
    useCases: productUseCases,
    faq: productFaq("AI Agent Pet Gallery"),
  },
  "developer-pets": {
    slug: "developer-pets",
    agentName: "Developer pets",
    eyebrow: { en: "Developer pets" },
    title: { en: "Developer pets for long coding sessions" },
    description: {
      en: "Turn developer culture into tiny animated companions: pets for READMEs, demos, livestreams, team setups, and AI coding workflows.",
    },
    metaTitle: { en: "Developer Pets: Animated Mascots for Coding Sessions" },
    metaDescription: {
      en: "Find developer pets and animated coding mascots you can install, share, and submit. AgentPets is a gallery and CLI for AI coding companions.",
    },
    commandSlug: "byte-bunny",
    keywords: [
      "developer pets",
      "developer mascot",
      "coding mascot",
      "animated developer pets",
    ],
    useCases: productUseCases,
    faq: productFaq("Developer Pets"),
  },
  "open-source-codex-pets": {
    slug: "open-source-codex-pets",
    agentName: "Open source Codex pets",
    eyebrow: { en: "Open source Codex pets" },
    title: { en: "Open-source Codex pets with attribution-first sharing" },
    description: {
      en: "AgentPets keeps the platform open, credits creators, and preserves compatibility with the pet package format developers can inspect and extend.",
    },
    metaTitle: { en: "Open Source Codex Pets and AI Coding Companions" },
    metaDescription: {
      en: "Browse open-source Codex pets, inspect the AgentPets platform, and share one-command installs for animated AI coding companions.",
    },
    commandSlug: "boba",
    keywords: [
      "open source Codex pets",
      "open-source AI coding pets",
      "Codex pets GitHub",
      seoKeywordClusters.codex.primary,
    ],
    useCases: productUseCases,
    faq: productFaq("Open Source Codex Pets"),
  },
  "pet-builder": {
    slug: "pet-builder",
    agentName: "Pet builder",
    eyebrow: { en: "Pet builder" },
    title: { en: "A pet builder roadmap for AI coding companions" },
    description: {
      en: "AgentPets is moving from gallery to creation workflow: design pets, validate spritesheets, preview animation states, export packages, and submit to the catalog.",
    },
    metaTitle: { en: "Pet Builder for Codex and AI Coding Agents" },
    metaDescription: {
      en: "Follow the AgentPets pet builder roadmap: design animated coding pets, validate pet packages, preview spritesheets, and submit them to the gallery.",
    },
    commandSlug: "boba",
    keywords: [
      seoKeywordClusters.petBuilder.primary,
      ...seoKeywordClusters.petBuilder.secondary,
      ...seoKeywordClusters.petBuilder.aliases,
    ],
    useCases: productUseCases,
    faq: productFaq("Pet Builder"),
  },
};

export function getSeoAgentPage(slug: SeoAgentSlug) {
  return seoAgentPages[slug];
}

export function seoText(text: LocalizedText, locale: string): string {
  if (locale === "en" || locale === "es" || locale === "zh") {
    return text[locale] ?? text.en;
  }
  return text.en;
}

export function seoAgentInstallCommand(slug: SeoAgentSlug) {
  return installCommandFor(seoAgentPages[slug].commandSlug);
}

export function seoAgentUrl(slug: SeoAgentSlug) {
  return siteUrl(`/${slug}`);
}

export function seoAgentBreadcrumb(slug: SeoAgentSlug, locale: string) {
  const page = seoAgentPages[slug];
  return [
    { name: siteConfig.name, url: siteConfig.url },
    { name: seoText(page.title, locale), url: seoAgentUrl(slug) },
  ];
}
