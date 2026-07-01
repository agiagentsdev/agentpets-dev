# AgentPets Deployment

This repo is configured for the independent AgentPets deployment at
`agentpets.dev`.

## Git Remotes

- `origin`: `https://github.com/agiagentsdev/agentpets-dev.git`
- `upstream`: `https://github.com/crafter-station/petdex.git`

Keep `upstream` only for MIT attribution and selective future merges. Product
links, package links, and public metadata should point at AgentPets.

## Required Launch Env

Set these in Vercel or your hosting provider before the first production build:

```env
DATABASE_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
AGENTPETS_AUTH_DISABLED=1
NEXT_PUBLIC_AGENTPETS_AUTH_DISABLED=1
AGENTPETS_CLERK_CLI_ISSUER=
AGENTPETS_CLERK_CLI_CLIENT_ID=
AGENTPETS_CLERK_CLI_SCOPES=openid profile email
CLERK_CLI_ISSUER=
CLERK_CLI_CLIENT_ID=
CLERK_CLI_SCOPES=openid profile email
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=agentpets-pets
R2_PUBLIC_BASE=https://assets.agentpets.dev
AGENTPETS_URL=https://agentpets.dev
PETDEX_URL=https://agentpets.dev
RESEND_FROM=AgentPets <hello@agentpets.dev>
AGENTPETS_OWNER_EMAIL=hello@agentpets.dev
AGENTPETS_ADMIN_NOTIFY_EMAIL=hello@agentpets.dev
PETDEX_OWNER_EMAIL=hello@agentpets.dev
PETDEX_ADMIN_NOTIFY_EMAIL=hello@agentpets.dev
```

Optional launch services:

- `RESEND_API_KEY` and `RESEND_WEBHOOK_SECRET` for email notifications.
- `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` for ads checkout.
- `NEXT_PUBLIC_DISCORD_INVITE_URL` for community CTAs.
- `AI_GATEWAY_API_KEY`, `OPENAI_API_KEY`, `AI_API_KEY`, and
  `ELEVENLABS_API_KEY` for review/tagging/media helpers.

Use `.env.example` as the full reference.

`PETDEX_*` names are legacy compatibility aliases. New production env should
prefer `AGENTPETS_*`, but keep the old names in sync until every old CLI,
desktop, and import script is gone.

## VPS Production Script

For the Ubuntu + Nginx + systemd server, use the production helper instead of
manually sourcing `.env.production`. It parses the env file safely, mirrors
`AGENTPETS_*`/`PETDEX_*` aliases, validates the database URL, checks required
tables/columns, builds, restarts systemd, and calls `/api/health?deep=1`.

```bash
cd /home/agentpets

# Validate env + DB/schema only.
/root/.bun/bin/bun run prod:check

# Normal deploy: git pull, install, drizzle migrate, build, restart, health.
/root/.bun/bin/bun run prod:deploy
```

For a fresh empty database where the historical migrations do not replay
cleanly, back up first, then run schema push explicitly:

```bash
cd /home/agentpets
/root/.bun/bin/bun run prod:deploy -- --push-schema
```

Useful flags:

- `--skip-git` when code is already current.
- `--skip-build` when only env changed.
- `--skip-restart` when testing validation only.
- `--service agentpets` and `--port 6996` if you rename the service or port.

Public shallow health:

```bash
curl -fsS http://127.0.0.1:6996/api/health
```

Deep health with DB/schema checks:

```bash
curl -fsS http://127.0.0.1:6996/api/health?deep=1
```

## Vercel Setup

1. Import `agiagentsdev/agentpets-dev` into Vercel.
2. Set the production env vars above.
3. Deploy the default branch.
4. Add domains:
   - `agentpets.dev`
   - `www.agentpets.dev` redirecting to `agentpets.dev`
5. In DNS, point the apex/domain records to Vercel as instructed by Vercel.

## Post-Deploy Checks

After deploy, verify:

```bash
curl -I https://agentpets.dev/
curl -I https://agentpets.dev/pets/byte-bunny
curl -I https://agentpets.dev/docs
curl -I https://agentpets.dev/robots.txt
curl -I https://agentpets.dev/sitemap.xml
```

Then inspect:

- Open Graph cards for `/`, `/pets/byte-bunny`, and `/collections`.
- `robots.txt` contains `Host: https://agentpets.dev`.
- `sitemap.xml` contains only `agentpets.dev` URLs.
- Header/footer GitHub links point to `agiagentsdev/agentpets-dev`.
- Main install CTA shows `npx -y https://github.com/agiagentsdev/agentpets-dev/releases/latest/download/agentpets-cli.tgz install boba`.

## Production Admin + Real Pets

Use `docs/ADMIN_PRODUCTION.md` after the first successful deploy. It covers:

- enabling the private Clerk-gated `/admin` area;
- keeping VPS `DATABASE_URL` in sync with Postgres;
- importing real Petdex public-manifest pets into AgentPets with attribution;
- verifying the catalog and manifest after import.

## Current Local Dev

The local dev port is `6996`.

```bash
bun run dev:mock
```

Open `http://localhost:6996`.
