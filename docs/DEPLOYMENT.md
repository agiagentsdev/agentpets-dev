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
CLERK_CLI_ISSUER=https://clerk.agentpets.dev
CLERK_CLI_CLIENT_ID=
CLERK_CLI_SCOPES=openid profile email
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=agentpets-pets
R2_PUBLIC_BASE=https://assets.agentpets.dev
PETDEX_URL=https://agentpets.dev
RESEND_FROM=AgentPets <hello@agentpets.dev>
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
- Main install CTA shows `npx @agentpets/cli install boba`.

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
