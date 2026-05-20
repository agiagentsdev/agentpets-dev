# @agentpets/cli

Install, list, submit, and manage animated developer pets from your terminal.

- Gallery: <https://agentpets.dev>
- Docs: <https://agentpets.dev/docs>
- Repo: <https://github.com/agiagentsdev/agentpets-dev>
- Package: <https://www.npmjs.com/package/@agentpets/cli>

## Quick Start

```sh
npx @agentpets/cli install boba
```

After installing a pet, activate it in Codex:

**Settings -> Appearance -> Pets -> Select**

## Commands

```sh
npx @agentpets/cli list
npx @agentpets/cli install boba
npx @agentpets/cli submit ~/.codex/pets/boba
npx @agentpets/cli login
npx @agentpets/cli whoami
npx @agentpets/cli logout
```

Global install is also supported:

```sh
npm install -g @agentpets/cli
agentpets install boba
```

The package still exposes a `petdex` binary alias for compatibility with older
snippets, but new docs should use `agentpets` or `npx @agentpets/cli`.

## Submit Flow

The CLI accepts:

```sh
npx @agentpets/cli submit ~/.codex/pets/boba
npx @agentpets/cli submit ~/Downloads/boba.zip
npx @agentpets/cli submit ~/.codex/pets
```

Per pet, the CLI:

1. Validates `pet.json` and `spritesheet.webp` or `spritesheet.png`.
2. Builds a clean zip in memory.
3. Requests presigned Cloudflare R2 upload URLs from AgentPets.
4. Uploads assets directly to R2.
5. Registers the submission for review.

## Environment Overrides

For non-production testing:

```sh
PETDEX_URL=https://your-host.example.com \
CLERK_ISSUER=https://clerk.your-host.example.com \
CLERK_OAUTH_CLIENT_ID=public_client_id \
npx @agentpets/cli login
```

The environment variable names retain `PETDEX_` where the inherited runtime
already uses them. Public product copy should say AgentPets.

## Common Fixes

| Symptom | Fix |
| --- | --- |
| Node engine error | Use Node.js 20+. |
| Not signed in | Run `npx @agentpets/cli login`. |
| Presign expired | Retry the command; URLs are short-lived by design. |
| Permission denied in `~/.codex/pets` | Fix ownership of `~/.codex` or choose a user-writable pets directory. |

## License

MIT. This package is part of AgentPets and is based on the MIT-licensed Petdex
codebase.
