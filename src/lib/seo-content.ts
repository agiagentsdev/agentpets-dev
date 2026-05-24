import { siteUrl } from "@/lib/site-config";

export type SeoContentLink = {
  href: string;
  label: string;
};

export type TopicHub = {
  slug: string;
  eyebrow: string;
  title: string;
  metaTitle: string;
  description: string;
  intro: string;
  keywords: string[];
  primaryCta: SeoContentLink;
  secondaryCta: SeoContentLink;
  sections: Array<{
    title: string;
    body: string;
    links: SeoContentLink[];
  }>;
  faqs: Array<{ question: string; answer: string }>;
};

export type Guide = {
  slug: string;
  eyebrow: string;
  title: string;
  metaTitle: string;
  description: string;
  minutes: number;
  keywords: string[];
  steps: Array<{
    title: string;
    body: string;
    command?: string;
  }>;
  related: SeoContentLink[];
  faqs: Array<{ question: string; answer: string }>;
};

export const topicHubs = [
  {
    slug: "ai-coding-agents",
    eyebrow: "Topic hub",
    title:
      "AI coding agent pets for Codex, Claude Code, Cursor, and Gemini CLI",
    metaTitle: "AI coding agent pets for developer workflows",
    description:
      "Browse animated pets and developer mascots for AI coding agents, terminal workflows, and shareable coding setups.",
    intro:
      "AgentPets turns tiny animated companions into a practical sharing layer for AI coding tools. The catalog is structured around install commands, portable pet packages, creator pages, and public APIs so devs can reuse the same pet across workflows.",
    keywords: [
      "AI coding agent pets",
      "Codex pets",
      "Claude Code pets",
      "Cursor pets",
      "Gemini CLI pets",
      "developer mascot",
    ],
    primaryCta: { href: "/pet-builder", label: "Build a pet" },
    secondaryCta: { href: "/api/v1/pets", label: "Open API" },
    sections: [
      {
        title: "One pet format, many agent surfaces",
        body: "The product keeps the pet package simple: a spritesheet, a pet.json manifest, and stable URLs. That makes it easy to install from the CLI, embed on a profile, or ship inside a developer tool.",
        links: [
          { href: "/docs", label: "Read the CLI docs" },
          { href: "/guides/create-pet-json", label: "pet.json guide" },
        ],
      },
      {
        title: "Searchable by intent, vibe, and tool",
        body: "Topic pages connect high-intent keywords to useful galleries instead of thin landing pages. A developer searching for a focused coding mascot should land near real pets, install commands, and examples.",
        links: [
          { href: "/vibe/focused", label: "Focused pets" },
          { href: "/codex-pets", label: "Codex pets" },
        ],
      },
      {
        title: "Designed for creator loops",
        body: "Every pet can point back to its creator, badge, embed, and install command. This gives creators a reason to share while giving search engines richer internal paths to crawl.",
        links: [
          { href: "/leaderboard", label: "Creator leaderboard" },
          { href: "/guides/add-agentpets-badge", label: "Add a badge" },
        ],
      },
    ],
    faqs: [
      {
        question: "What is an AI coding agent pet?",
        answer:
          "It is a small animated companion packaged for developer workflows. AgentPets exposes each pet with install commands, public URLs, and metadata that tools can reuse.",
      },
      {
        question: "Can one pet work across multiple tools?",
        answer:
          "Yes. The AgentPets package model is intentionally portable: a spritesheet plus pet.json metadata can be reused by CLIs, desktop apps, embeds, and future agent integrations.",
      },
    ],
  },
  {
    slug: "developer-mascots",
    eyebrow: "Topic hub",
    title: "Developer mascots that are installable, shareable, and API-ready",
    metaTitle: "Developer mascots for open source projects",
    description:
      "Use AgentPets to create developer mascots with install commands, share badges, embeds, and profile loops.",
    intro:
      "A developer mascot should do more than sit in a hero image. On AgentPets it becomes an installable asset with a public page, share card, badge, embed, and API payload.",
    keywords: [
      "developer mascot",
      "open source mascot",
      "coding mascot",
      "GitHub badge",
      "developer community growth",
    ],
    primaryCta: { href: "/pet-builder", label: "Design a mascot" },
    secondaryCta: { href: "/guides/add-agentpets-badge", label: "Badge guide" },
    sections: [
      {
        title: "Mascots as distribution assets",
        body: "The best mascot is not just a logo. It appears in README badges, launch posts, docs, and profiles where developers already share proof of work.",
        links: [
          { href: "/api/v1/badge/boba", label: "Example SVG badge" },
          { href: "/built-with", label: "Built with AgentPets" },
        ],
      },
      {
        title: "Keep attribution obvious",
        body: "Creator pages, credits, and public profile links help the asset travel without stripping the person behind it out of the story.",
        links: [
          { href: "/leaderboard", label: "Top creators" },
          { href: "/submit", label: "Submit a pet" },
        ],
      },
      {
        title: "Make it easy to remix later",
        body: "The builder and API are intentionally versioned surfaces. They let the product evolve toward custom pet design without breaking existing install and share flows.",
        links: [
          { href: "/guides/embed-pet-widget", label: "Embed guide" },
          { href: "/api/v1/pets", label: "Public API" },
        ],
      },
    ],
    faqs: [
      {
        question: "Can I use a pet as a GitHub README badge?",
        answer:
          "Yes. AgentPets exposes SVG badge URLs that can be embedded in READMEs and linked back to the pet page.",
      },
      {
        question: "Can a mascot point to my creator profile?",
        answer:
          "Yes. Approved pets keep creator credit and public profile paths so the sharing loop can bring users back to the creator.",
      },
    ],
  },
  {
    slug: "agent-first-coding-tools",
    eyebrow: "Topic hub",
    title: "Agent-first coding tools and the pets that make them shareable",
    metaTitle: "Agent-first coding tools, pets, and developer mascots",
    description:
      "Explore AgentPets pages for Codex, Claude Code, Cursor, Gemini CLI, Google Antigravity, GitHub Copilot, Windsurf, and OpenCode.",
    intro:
      "AI coding tools are splitting across terminals, IDEs, cloud agents, and browser-controlled workspaces. AgentPets gives each workflow a lightweight mascot layer: a public page, install command, badge, embed, and API payload.",
    keywords: [
      "agent-first coding tools",
      "AI coding pets",
      "Codex pets",
      "Google Antigravity pets",
      "GitHub Copilot coding agent pets",
      "Windsurf pets",
      "OpenCode pets",
    ],
    primaryCta: { href: "/ai-coding-pets", label: "Browse AI coding pets" },
    secondaryCta: { href: "/developers", label: "Developer API" },
    sections: [
      {
        title: "Terminal-native agents",
        body: "Terminal tools need pets that stay simple to install and easy to share in docs, READMEs, and team setup guides.",
        links: [
          { href: "/codex-pets", label: "Codex pets" },
          { href: "/claude-code-pets", label: "Claude Code pets" },
          { href: "/terminal-ai-agent-pets", label: "Terminal AI agent pets" },
        ],
      },
      {
        title: "AI IDE and editor workflows",
        body: "Editor-native tools create new developer culture around pair programming, autonomous edits, and workspace-level agents.",
        links: [
          { href: "/cursor-pets", label: "Cursor pets" },
          { href: "/windsurf-pets", label: "Windsurf pets" },
          { href: "/ai-code-editor-pets", label: "AI code editor pets" },
        ],
      },
      {
        title: "Cloud and agent-first platforms",
        body: "Cloud coding agents and agent-first IDEs benefit from portable badges, embeds, and public metadata because the pet can travel beyond the app.",
        links: [
          { href: "/github-copilot-pets", label: "GitHub Copilot pets" },
          {
            href: "/google-antigravity-pets",
            label: "Google Antigravity pets",
          },
          { href: "/opencode-pets", label: "OpenCode pets" },
        ],
      },
    ],
    faqs: [
      {
        question: "Should every AI coding tool have its own pet page?",
        answer:
          "Only when the page has a real search intent, real internal links, and a clear workflow angle. AgentPets keeps these pages data-driven so new tools can be added without thin duplicated content.",
      },
      {
        question: "Can the same pet be reused across tools?",
        answer:
          "Yes. AgentPets keeps pets portable through a spritesheet, pet.json metadata, public URLs, badges, embeds, and API records.",
      },
    ],
  },
  {
    slug: "pet-builder-workflows",
    eyebrow: "Topic hub",
    title: "Pet builder workflows for fast browser-based AI agent pets",
    metaTitle: "Pet builder workflows for AI agent pets",
    description:
      "Plan, validate, export, and submit browser-built pets for AgentPets with a clean path from idea to gallery.",
    intro:
      "The Pet Builder is the fastest path from a rough mascot idea to a valid AgentPets package. It creates a pet.json manifest, renders a spritesheet, exports a ZIP, and submits through the same review path as manual uploads.",
    keywords: [
      "pet builder",
      "Codex pet builder",
      "pet.json generator",
      "spritesheet generator",
      "browser pet creator",
    ],
    primaryCta: { href: "/pet-builder", label: "Open Pet Builder" },
    secondaryCta: { href: "/guides/submit-agent-pet", label: "Submit guide" },
    sections: [
      {
        title: "Validate before upload",
        body: "Good creator tooling catches bad slugs, spammy text, and malformed metadata before it reaches admin review. That keeps the public gallery cleaner.",
        links: [
          { href: "/guides/create-pet-json", label: "pet.json guide" },
          { href: "/submit", label: "Submit manually" },
        ],
      },
      {
        title: "Export a real package",
        body: "The builder exports the same kind of ZIP expected by the upload flow, so creators can keep a local copy or submit it immediately.",
        links: [
          { href: "/docs", label: "CLI docs" },
          { href: "/download", label: "Desktop app" },
        ],
      },
      {
        title: "Make every creation discoverable",
        body: "A builder-created pet gets the same SEO and sharing stack as every approved pet: a page, metadata, install command, badge, embed, and API row.",
        links: [
          { href: "/guides/embed-pet-widget", label: "Embed guide" },
          { href: "/guides/add-agentpets-badge", label: "Badge guide" },
        ],
      },
    ],
    faqs: [
      {
        question: "Does the Pet Builder create a valid package?",
        answer:
          "Yes. It exports a pet.json manifest and spritesheet ZIP that follow the AgentPets atlas format.",
      },
      {
        question: "Can I submit a builder pet to the public gallery?",
        answer:
          "Yes. Signed-in users can upload the generated assets and submit the pet to the same review flow used by manual submissions.",
      },
    ],
  },
] satisfies TopicHub[];

export const guides = [
  {
    slug: "install-codex-pet",
    eyebrow: "Guide",
    title: "Install a Codex pet with AgentPets CLI",
    metaTitle: "How to install a Codex pet",
    description:
      "Install an animated coding pet from AgentPets with one CLI command and verify that the package is available locally.",
    minutes: 3,
    keywords: ["install Codex pet", "AgentPets CLI", "npx agentpets install"],
    steps: [
      {
        title: "Pick a pet from the gallery",
        body: "Start from a pet page so you know the slug, creator credit, and install command. Featured pets are a good first install target.",
      },
      {
        title: "Run the install command",
        body: "The CLI downloads the pet package and places the assets into the local pet directories used by AgentPets-compatible workflows.",
        command:
          "npx -y https://github.com/agiagentsdev/agentpets-dev/releases/latest/download/agentpets-cli.tgz install boba",
      },
      {
        title: "Share the pet page",
        body: "After install, share the public pet page or badge. The public URL gives other developers the same command and attribution trail.",
      },
    ],
    related: [
      { href: "/docs", label: "CLI documentation" },
      { href: "/guides/add-agentpets-badge", label: "Add a badge" },
      { href: "/pet-builder", label: "Build your own pet" },
    ],
    faqs: [
      {
        question: "Do I need to clone the repository to install a pet?",
        answer:
          "No. The public CLI install command fetches hosted pet assets from AgentPets.",
      },
      {
        question: "Can I install more than one pet?",
        answer:
          "Yes. Run the install command with different slugs from the gallery.",
      },
    ],
  },
  {
    slug: "create-pet-json",
    eyebrow: "Guide",
    title: "Create a valid pet.json for an AgentPets package",
    metaTitle: "Create a valid pet.json for AgentPets",
    description:
      "Learn the fields a pet package needs so it can be validated, exported, embedded, and installed.",
    minutes: 6,
    keywords: ["pet.json", "AgentPets package", "spritesheet metadata"],
    steps: [
      {
        title: "Use a stable id",
        body: "The id should be lowercase, URL-safe, and short enough to work in install commands, file paths, and public URLs.",
      },
      {
        title: "Point to the spritesheet",
        body: "AgentPets expects a spritesheet with the standard 8 column by 9 row animation atlas. The builder writes this metadata automatically.",
      },
      {
        title: "Add useful discovery fields",
        body: "Name, description, tags, kind, and vibes help the pet show up in topical pages and public API responses.",
      },
    ],
    related: [
      { href: "/pet-builder", label: "Generate pet.json" },
      { href: "/topics/pet-builder-workflows", label: "Builder workflows" },
      { href: "/api/v1/pets", label: "Public API" },
    ],
    faqs: [
      {
        question: "Can AgentPets generate pet.json for me?",
        answer:
          "Yes. The Pet Builder generates pet.json and validates common fields before export.",
      },
      {
        question: "Should tags include URLs?",
        answer:
          "No. Keep tags descriptive. Public URLs belong in creator profiles, pet pages, and badges rather than user-submitted text fields.",
      },
    ],
  },
  {
    slug: "submit-agent-pet",
    eyebrow: "Guide",
    title: "Submit an AI agent pet to the AgentPets gallery",
    metaTitle: "Submit an AI agent pet to AgentPets",
    description:
      "Submit a pet package, pass validation, and prepare it for SEO, sharing, badges, embeds, and API discovery.",
    minutes: 5,
    keywords: ["submit AI agent pet", "AgentPets gallery", "developer pet"],
    steps: [
      {
        title: "Create or export the package",
        body: "Use Pet Builder for a browser-generated pet or prepare a ZIP with pet.json and spritesheet assets.",
      },
      {
        title: "Submit while signed in",
        body: "Signed-in submissions keep ownership, creator attribution, edit controls, and profile growth loops attached to your account.",
      },
      {
        title: "Polish the public page after approval",
        body: "Approved pets can receive SEO title, intro, FAQ, tags, and better internal links from the admin SEO editor.",
      },
    ],
    related: [
      { href: "/submit", label: "Submit a pet" },
      { href: "/pet-builder", label: "Open Pet Builder" },
      { href: "/leaderboard", label: "Creator leaderboard" },
    ],
    faqs: [
      {
        question: "Why does AgentPets review submissions?",
        answer:
          "Review protects the public gallery from malformed packages, duplicates, unsafe content, and spam.",
      },
      {
        question: "Can I edit a pet later?",
        answer:
          "Yes. Owners can manage approved pets from their profile and submit edits through the product flow.",
      },
    ],
  },
  {
    slug: "add-agentpets-badge",
    eyebrow: "Guide",
    title: "Add an AgentPets badge to a README or launch post",
    metaTitle: "Add an AgentPets badge to GitHub README",
    description:
      "Use the public badge endpoint to show a pet install badge in README files, docs, and launch posts.",
    minutes: 4,
    keywords: ["AgentPets badge", "GitHub README badge", "developer badge"],
    steps: [
      {
        title: "Choose the pet slug",
        body: "Every approved pet has a stable slug. Use it in the SVG badge endpoint and link the badge to the pet page.",
      },
      {
        title: "Add Markdown to your README",
        body: "The badge is an SVG image URL, so it works in GitHub README files and most docs systems.",
        command:
          "[![AgentPets](https://agentpets.dev/api/v1/badge/boba)](https://agentpets.dev/pets/boba?ref=badge)",
      },
      {
        title: "Track the sharing loop",
        body: "The badge sends readers to the public pet page where they can install, like, embed, or find the creator.",
      },
    ],
    related: [
      { href: "/topics/developer-mascots", label: "Developer mascots" },
      { href: "/guides/embed-pet-widget", label: "Embed a pet" },
      { href: "/api/v1/badge/boba", label: "Example badge" },
    ],
    faqs: [
      {
        question: "Is the badge endpoint public?",
        answer:
          "Yes. Badge SVGs are public, cacheable, and designed for README usage.",
      },
      {
        question: "Can I customize the badge style?",
        answer:
          "The first endpoint keeps a stable default style. The public API surface is versioned so more variants can be added later.",
      },
    ],
  },
  {
    slug: "embed-pet-widget",
    eyebrow: "Guide",
    title: "Embed an AgentPets pet on a website",
    metaTitle: "Embed an AgentPets pet widget",
    description:
      "Add an animated pet widget to a docs page, product launch, or creator profile with a public embed URL.",
    minutes: 5,
    keywords: ["AgentPets embed", "pet widget", "animated developer mascot"],
    steps: [
      {
        title: "Use the embed route",
        body: "The public embed page renders a focused pet card that can be placed in an iframe.",
        command:
          '<iframe src="https://agentpets.dev/embed/boba" width="320" height="420" title="Boba on AgentPets"></iframe>',
      },
      {
        title: "Keep the canonical link nearby",
        body: "Embeds are great for product pages, but the canonical pet page should stay the destination for install commands and attribution.",
      },
      {
        title: "Use the API for custom UI",
        body: "If you need native styling, fetch /api/v1/pets/{slug} and render the sprite, install command, and creator credit yourself.",
      },
    ],
    related: [
      { href: "/api/v1/pets/boba", label: "Pet API example" },
      { href: "/embed/boba", label: "Embed example" },
      { href: "/topics/developer-mascots", label: "Developer mascots" },
    ],
    faqs: [
      {
        question: "Should embeds be indexed?",
        answer:
          "No. Embed pages are utility surfaces and point back to the canonical pet page for SEO.",
      },
      {
        question: "Can I build my own embed UI?",
        answer:
          "Yes. Use the public API payload when you want full control over styling.",
      },
    ],
  },
] satisfies Guide[];

export function getTopicHub(slug: string): TopicHub | undefined {
  return topicHubs.find((topic) => topic.slug === slug);
}

export function getGuide(slug: string): Guide | undefined {
  return guides.find((guide) => guide.slug === slug);
}

export function topicHubUrl(slug: string) {
  return siteUrl(`/topics/${slug}`);
}

export function guideUrl(slug: string) {
  return siteUrl(`/guides/${slug}`);
}
