# AgentPets Admin Production

This file is the production runbook for enabling the private admin area and
bootstrapping the catalog with real pets.

## 1. Make Your Clerk User Admin

1. Open the production site and sign in once.
2. In Clerk Dashboard, copy your production user id. It looks like
   `user_...`.
3. On the VPS, add the id to `/home/agentpets/.env.production`:

```bash
cd /home/agentpets

ADMIN_USER_ID="user_REPLACE_WITH_YOURS"

sed -i 's/\r$//' .env.production
for key in AGENTPETS_ADMIN_USER_IDS PETDEX_ADMIN_USER_IDS NEXT_PUBLIC_AGENTPETS_ADMIN_USER_IDS NEXT_PUBLIC_PETDEX_ADMIN_USER_IDS; do
  grep -q "^${key}=" .env.production \
    && sed -i "s|^${key}=.*|${key}=${ADMIN_USER_ID}|" .env.production \
    || printf '\n%s=%s\n' "$key" "$ADMIN_USER_ID" >> .env.production
done
```

`AGENTPETS_ADMIN_USER_IDS` is the real server-side gate. `PETDEX_ADMIN_USER_IDS`
is kept as a legacy alias for older scripts. The `NEXT_PUBLIC_...` values only
control whether admin links appear in the UI, so they are safe but should still
contain only admin ids.

Rebuild once after changing `NEXT_PUBLIC_AGENTPETS_ADMIN_USER_IDS`:

```bash
cd /home/agentpets
/root/.bun/bin/bun install
/root/.bun/bin/bun run prod:check
/root/.bun/bin/bun run build
sudo systemctl restart agentpets
```

Then open:

```text
https://agentpets.dev/admin
```

## 2. Keep Database Password In Sync

The app and scripts must use the same `DATABASE_URL`.

```bash
cd /home/agentpets

DB_URL="$(grep '^DATABASE_URL=' /root/agentpets-secrets/database.env | cut -d= -f2-)"
sed -i 's/\r$//' .env.production
sed -i "s|^DATABASE_URL=.*|DATABASE_URL=${DB_URL}|" .env.production

sudo systemctl restart agentpets
curl -I http://127.0.0.1:6996
```

If the app returns 500 and journal logs say `password authentication failed`,
run the sync block above again.

After syncing, run:

```bash
cd /home/agentpets
/root/.bun/bin/bun run prod:check
```

## 3. Import Real Petdex Pets

The import script reads Petdex's public manifest and inserts approved,
attribution-first `discover` rows into AgentPets. It does not copy binary
assets into your bucket; it stores the public asset URLs and links back to the
original Petdex page.

Preview the import:

```bash
cd /home/agentpets
export DATABASE_URL="$(grep '^DATABASE_URL=' /root/agentpets-secrets/database.env | cut -d= -f2-)"

/root/.bun/bin/bun --conditions react-server \
  scripts/import-petdex-manifest.ts \
  --limit 200 \
  --featured 24
```

Preview all remote pets after an offset:

```bash
cd /home/agentpets
export DATABASE_URL="$(grep '^DATABASE_URL=' /root/agentpets-secrets/database.env | cut -d= -f2-)"

/root/.bun/bin/bun --conditions react-server \
  scripts/import-petdex-manifest.ts \
  --all \
  --offset 0 \
  --batch-size 100 \
  --featured 24
```

Apply it:

```bash
cd /home/agentpets
export DATABASE_URL="$(grep '^DATABASE_URL=' /root/agentpets-secrets/database.env | cut -d= -f2-)"

/root/.bun/bin/bun --conditions react-server \
  scripts/import-petdex-manifest.ts \
  --limit 200 \
  --featured 24 \
  --apply

sudo systemctl restart agentpets
```

Apply all available manifest pets:

```bash
cd /home/agentpets
export DATABASE_URL="$(grep '^DATABASE_URL=' /root/agentpets-secrets/database.env | cut -d= -f2-)"

/root/.bun/bin/bun --conditions react-server \
  scripts/import-petdex-manifest.ts \
  --all \
  --batch-size 100 \
  --featured 24 \
  --apply

sudo systemctl restart agentpets
```

Verify:

```bash
PGPASSWORD="$(grep '^DB_PASS=' /root/agentpets-secrets/database.env | cut -d= -f2-)" \
psql -h 127.0.0.1 -U agentpets_user -d agentpets \
  -c "select count(*) from submitted_pets where status = 'approved';"

curl -I http://127.0.0.1:6996
curl -s http://127.0.0.1:6996/api/manifest | head
```

To import more later, increase the offset:

```bash
/root/.bun/bin/bun --conditions react-server \
  scripts/import-petdex-manifest.ts \
  --offset 200 \
  --limit 500 \
  --apply
```

To refresh existing imported rows from the manifest:

```bash
/root/.bun/bin/bun --conditions react-server \
  scripts/import-petdex-manifest.ts \
  --limit 500 \
  --featured 24 \
  --replace \
  --apply
```

## 4. Admin Areas

Production admin routes currently include:

- `/admin`: overview, queues, discovered/imported pets.
- `/admin/requests`: pet request matching and fulfillment.
- `/admin/edits`: pending user edits.
- `/admin/feedback`: feedback moderation.
- `/admin/manifest`: manifest fetch diagnostics.
- `/admin/telemetry`: telemetry events.
- `/admin/insights`: catalog and growth insights.
- `/admin/mailing`: email campaigns.
- `/admin/campaigns`: ads/admin campaigns.

## 5. Recommended Production Policy

Use imported Petdex pets as the bootstrap catalog only. Keep attribution visible,
then gradually promote first-party AgentPets pets from your own builder,
community submissions, and curated collections.
