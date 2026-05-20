import { installCommandFor, siteConfig, siteUrl } from "@/lib/site-config";

import type { Locale } from "@/i18n/config";

export type SeoAgentSlug =
  | "ai-coding-pets"
  | "codex-pets"
  | "claude-code-pets"
  | "cursor-pets"
  | "gemini-cli-pets"
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
      en: "Install animated developer pets for AI coding agents with npx @agentpets/cli. Browse, preview, submit, and share pets from AgentPets.dev.",
      es: "Instala mascotas animadas para agentes de código con npx @agentpets/cli. Explora, previsualiza, envía y comparte mascotas en AgentPets.dev.",
      zh: "使用 npx @agentpets/cli 为 AI 编码智能体安装动画开发者宠物。在 AgentPets.dev 浏览、预览、提交和分享。",
    },
    commandSlug: "boba",
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
      en: "Browse and install Codex pets from AgentPets.dev. Use npx @agentpets/cli install boba to add an animated companion to Codex.",
      es: "Explora e instala mascotas para Codex desde AgentPets.dev. Usa npx @agentpets/cli install boba para añadir un acompañante animado.",
      zh: "在 AgentPets.dev 浏览并安装 Codex 宠物。使用 npx @agentpets/cli install boba 添加动画伙伴。",
    },
    commandSlug: "boba",
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
      en: "Discover terminal-friendly animated pets for Gemini CLI-style workflows. Install with npx @agentpets/cli and share with devs.",
      es: "Descubre mascotas animadas para flujos tipo Gemini CLI. Instala con npx @agentpets/cli y compártelas con devs.",
      zh: "发现适用于 Gemini CLI 风格工作流的终端友好动画宠物。用 npx @agentpets/cli 安装并分享。",
    },
    commandSlug: "kebo",
    useCases: sharedUseCases,
    faq: sharedFaq,
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
      en: "Plan, package, preview, and submit Codex pets with AgentPets. Install examples with npx @agentpets/cli and follow the roadmap for the web pet generator.",
    },
    commandSlug: "boba",
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
