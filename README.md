<div align="center">

<img src="public/brand/petdex-desktop-icon.png" alt="AgentPets" width="120" />

<h1>AgentPets</h1>

<p>
  Animated companions for AI coding agents.
  <br />
  Browse, install, submit, and share developer pets with one command.
</p>

<p>
  <a href="https://agentpets.dev"><strong>agentpets.dev</strong></a>
  &nbsp;·&nbsp;
  <a href="https://agentpets.dev/ai-coding-pets">AI coding pets</a>
  &nbsp;·&nbsp;
  <a href="https://agentpets.dev/docs">Docs</a>
  &nbsp;·&nbsp;
  <a href="https://www.npmjs.com/package/@agentpets/cli">npm</a>
</p>

<p>
  <a href="https://www.npmjs.com/package/@agentpets/cli"><img src="https://img.shields.io/npm/v/@agentpets/cli?style=flat-square&label=cli&color=000000" alt="npm version" /></a>
  <a href="https://github.com/agiagentsdev/agentpets-dev/stargazers"><img src="https://img.shields.io/github/stars/agiagentsdev/agentpets-dev?style=flat-square&color=000000" alt="GitHub stars" /></a>
  <a href="https://github.com/agiagentsdev/agentpets-dev/blob/main/LICENSE"><img src="https://img.shields.io/github/license/agiagentsdev/agentpets-dev?style=flat-square&color=000000" alt="MIT license" /></a>
</p>

</div>

---

## What is AgentPets?

AgentPets is a developer pet gallery and CLI for AI coding workflows:

1. **Web gallery** at [agentpets.dev](https://agentpets.dev) for browsing, previewing, and sharing animated pets.
2. **CLI** published as [`@agentpets/cli`](https://www.npmjs.com/package/@agentpets/cli) for install, list, submit, and agent hooks.
3. **Pet format** compatible with the existing Codex/Petdex-style `pet.json` plus `spritesheet.webp` package shape.
4. **Roadmap** toward multi-agent support for Codex, Claude Code, Cursor, Gemini CLI, creator tools, curated collections, and a public pet API.

AgentPets is an independent product based on MIT-licensed Petdex code. It does
not claim ownership over Petdex community pets, user-submitted assets, or
underlying character IP.

## Quick Start

```sh
npx @agentpets/cli install boba
```

Open Codex, go to **Settings -> Appearance -> Pets**, and select the installed
pet.

Useful links:

| Goal | Link |
| --- | --- |
| Browse pets | <https://agentpets.dev> |
| Codex pets | <https://agentpets.dev/codex-pets> |
| Claude Code pets | <https://agentpets.dev/claude-code-pets> |
| Cursor pets | <https://agentpets.dev/cursor-pets> |
| Gemini CLI pets | <https://agentpets.dev/gemini-cli-pets> |
| Submit a pet | <https://agentpets.dev/submit> |
| Deploy this repo | [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) |

## Pet Package Format

Every pet is a folder:

```text
my-pet/
├── pet.json
└── spritesheet.webp
```

The spritesheet uses an 8 x 9 grid of 192 x 208 frames. Animation rows map to
states such as `idle`, `wave`, `run`, `failed`, `review`, and `jump`.

## Develop Locally

```sh
git clone https://github.com/agiagentsdev/agentpets-dev.git
cd agentpets-dev
bun install
bun run dev:mock
```

Open [localhost:6996](http://localhost:6996). The mock path requires no real
database, Clerk, Redis, R2, or email credentials.

## Architecture

```text
agentpets-dev
├── src/app/[locale]/       Public site, SEO pages, pet pages, collections
├── src/app/api/            CLI, manifest, submit, telemetry, admin APIs
├── src/lib/                DB, search, SEO config, validation, integrations
├── packages/petdex-cli/    @agentpets/cli package
├── packages/petdex-desktop/ Desktop runtime inherited from the upstream app
├── public/brand/           Brand assets
└── drizzle/                Postgres migrations
```

Core stack: Next.js 16, React 19, Tailwind, Drizzle, Postgres, Redis, Clerk,
Cloudflare R2, Resend, and Bun.

## Attribution

This project is built from the MIT-licensed
[Petdex](https://github.com/crafter-station/petdex) codebase. AgentPets keeps
compatibility with the pet package format while operating under its own brand,
domain, repo, roadmap, and community.

Pet assets are user-submitted fan art. AgentPets does not claim rights to
underlying IP. Rights holders can file a takedown request in this repository.

## License

Source code is MIT. Pet assets remain owned by their submitters and original
rights holders.
