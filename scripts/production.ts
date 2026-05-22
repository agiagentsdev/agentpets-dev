import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

import postgres from "postgres";

type Mode = "check" | "deploy";
type Env = Record<string, string | undefined>;

type Options = {
  mode: Mode;
  envFile: string;
  service: string;
  port: string;
  skipGit: boolean;
  skipInstall: boolean;
  skipBuild: boolean;
  skipRestart: boolean;
  pushSchema: boolean;
};

const REQUIRED_SUBMITTED_PETS_COLUMNS = [
  "slug",
  "display_name",
  "description",
  "spritesheet_url",
  "pet_json_url",
  "zip_url",
  "kind",
  "vibes",
  "tags",
  "dominant_color",
  "color_family",
  "seo_title",
  "seo_description",
  "seo_keywords",
  "seo_intro",
  "seo_faq",
  "seo_updated_at",
  "featured",
  "status",
  "source",
  "gallery_position",
] as const;

const BUN = process.env.BUN_BIN || process.execPath || "bun";

main().catch((error) => {
  console.error(`\n[agentpets:production] ${error.message}`);
  process.exit(1);
});

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const env = normalizeEnv({
    ...process.env,
    ...readEnvFile(options.envFile),
  });

  validateEnv(env);
  await checkDatabase(env);

  if (options.mode === "check") {
    console.log("[agentpets:production] OK: env + database schema are ready.");
    return;
  }

  if (!options.skipGit) run("git", ["pull", "origin", "main"], env);
  if (!options.skipInstall) run(BUN, ["install"], env);

  if (options.pushSchema) {
    run(BUN, ["x", "drizzle-kit", "push", "--force"], env);
  } else {
    run(BUN, ["x", "drizzle-kit", "migrate"], env);
  }

  await checkDatabase(env);

  if (!options.skipBuild) run(BUN, ["run", "build"], env);

  if (!options.skipRestart && process.platform !== "win32") {
    run("systemctl", ["restart", options.service], env);
    await checkHttpHealth(options, env);
  }

  console.log("[agentpets:production] OK: deploy completed.");
}

function parseArgs(args: string[]): Options {
  const mode = args[0] === "deploy" ? "deploy" : "check";
  const options: Options = {
    mode,
    envFile: ".env.production",
    service: "agentpets",
    port: "6996",
    skipGit: false,
    skipInstall: false,
    skipBuild: false,
    skipRestart: false,
    pushSchema: false,
  };

  for (let i = mode === "deploy" ? 1 : 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];
    switch (arg) {
      case "--env-file":
        if (!next) throw new Error("--env-file requires a value");
        options.envFile = next;
        i++;
        break;
      case "--service":
        if (!next) throw new Error("--service requires a value");
        options.service = next;
        i++;
        break;
      case "--port":
        if (!next) throw new Error("--port requires a value");
        options.port = next;
        i++;
        break;
      case "--skip-git":
        options.skipGit = true;
        break;
      case "--skip-install":
        options.skipInstall = true;
        break;
      case "--skip-build":
        options.skipBuild = true;
        break;
      case "--skip-restart":
        options.skipRestart = true;
        break;
      case "--push-schema":
        options.pushSchema = true;
        break;
      default:
        if (arg !== "check") throw new Error(`unknown argument: ${arg}`);
    }
  }

  return options;
}

function readEnvFile(filePath: string): Env {
  const resolved = path.resolve(process.cwd(), filePath);
  if (!existsSync(resolved)) {
    throw new Error(`env file not found: ${resolved}`);
  }
  const env: Env = {};
  const text = readFileSync(resolved, "utf8").replace(/^\uFEFF/, "");
  for (const line of text.split(/\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value.replace(/\r$/, "");
  }
  return env;
}

function normalizeEnv(env: Env): Env {
  const out = { ...env };
  alias(out, "AGENTPETS_URL", "PETDEX_URL");
  alias(out, "AGENTPETS_ADMIN_USER_IDS", "PETDEX_ADMIN_USER_IDS");
  alias(
    out,
    "NEXT_PUBLIC_AGENTPETS_ADMIN_USER_IDS",
    "NEXT_PUBLIC_PETDEX_ADMIN_USER_IDS",
  );
  alias(out, "AGENTPETS_OWNER_EMAIL", "PETDEX_OWNER_EMAIL");
  alias(out, "AGENTPETS_ADMIN_NOTIFY_EMAIL", "PETDEX_ADMIN_NOTIFY_EMAIL");
  alias(out, "AGENTPETS_HEALTH_TOKEN", "HEALTHCHECK_TOKEN");
  alias(out, "AGENTPETS_CLERK_CLI_ISSUER", "CLERK_CLI_ISSUER");
  out.NODE_ENV = "production";
  return out;
}

function alias(env: Env, preferred: string, legacy: string) {
  const preferredValue = clean(env[preferred]);
  const legacyValue = clean(env[legacy]);
  if (preferredValue && !legacyValue) env[legacy] = preferredValue;
  if (legacyValue && !preferredValue) env[preferred] = legacyValue;
}

function validateEnv(env: Env) {
  const required = [
    "DATABASE_URL",
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    "CLERK_SECRET_KEY",
    "AGENTPETS_URL",
  ];
  const missing = required.filter((key) => !clean(env[key]));
  if (missing.length > 0) {
    throw new Error(`missing required env: ${missing.join(", ")}`);
  }

  const databaseUrl = clean(env.DATABASE_URL);
  if (!databaseUrl) throw new Error("DATABASE_URL is empty");
  if (/\s/.test(databaseUrl)) {
    throw new Error("DATABASE_URL contains whitespace; regenerate or rewrite it");
  }
  if (/PASTE_|CHANGE_ME|REPLACE_/i.test(databaseUrl)) {
    throw new Error("DATABASE_URL still contains a placeholder");
  }
  const parsed = new URL(databaseUrl);
  if (!["postgres:", "postgresql:"].includes(parsed.protocol)) {
    throw new Error("DATABASE_URL must be a postgres/postgresql URL");
  }

  const appUrl = clean(env.AGENTPETS_URL);
  if (!appUrl) throw new Error("AGENTPETS_URL is empty");
  const app = new URL(appUrl);
  if (app.protocol !== "https:" && app.hostname !== "localhost") {
    throw new Error("AGENTPETS_URL should be https in production");
  }

  const upstashUrl = clean(env.UPSTASH_REDIS_REST_URL);
  const upstashToken = clean(env.UPSTASH_REDIS_REST_TOKEN);
  if ((upstashUrl && !upstashToken) || (!upstashUrl && upstashToken)) {
    throw new Error(
      "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set together",
    );
  }
  if (upstashUrl && !upstashUrl.startsWith("https://")) {
    console.warn(
      "[agentpets:production] WARN: Upstash URL is not https; Redis features will be disabled by the app.",
    );
  }
}

async function checkDatabase(env: Env) {
  const databaseUrl = clean(env.DATABASE_URL);
  if (!databaseUrl) throw new Error("DATABASE_URL is empty");
  const sql = postgres(databaseUrl, { max: 1, connect_timeout: 5 });
  try {
    const [identity] = await sql<
      { current_database: string; current_user: string }[]
    >`select current_database(), current_user`;
    console.log(
      `[agentpets:production] DB: ${identity.current_database} as ${identity.current_user}`,
    );

    const [tables] = await sql<{
      submitted_pets: string | null;
      pet_metrics: string | null;
      ad_campaigns: string | null;
    }[]>`
      select
        to_regclass('public.submitted_pets')::text as submitted_pets,
        to_regclass('public.pet_metrics')::text as pet_metrics,
        to_regclass('public.ad_campaigns')::text as ad_campaigns
    `;
    const missingTables = Object.entries(tables)
      .filter(([, value]) => !value)
      .map(([key]) => key);
    if (missingTables.length > 0) {
      throw new Error(
        `database schema missing tables: ${missingTables.join(", ")}. Run deploy with --push-schema once for a fresh DB, or fix migrations.`,
      );
    }

    const rows = await sql<{ column_name: string }[]>`
      select column_name
      from information_schema.columns
      where table_schema = 'public' and table_name = 'submitted_pets'
    `;
    const columns = new Set(rows.map((row) => row.column_name));
    const missingColumns = REQUIRED_SUBMITTED_PETS_COLUMNS.filter(
      (column) => !columns.has(column),
    );
    if (missingColumns.length > 0) {
      throw new Error(
        `submitted_pets missing columns: ${missingColumns.join(", ")}. Run deploy with --push-schema after backing up DB.`,
      );
    }
  } finally {
    await sql.end({ timeout: 1 }).catch(() => {});
  }
}

async function checkHttpHealth(options: Options, env: Env) {
  const url = `http://127.0.0.1:${options.port}/api/health?deep=1`;
  const headers = new Headers();
  const token = clean(env.AGENTPETS_HEALTH_TOKEN);
  if (token) headers.set("x-agentpets-health-token", token);

  const deadline = Date.now() + 30_000;
  let lastError = "";
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { headers, cache: "no-store" });
      const text = await res.text();
      if (res.ok) {
        console.log(`[agentpets:production] health OK: ${url}`);
        return;
      }
      lastError = `${res.status} ${text.slice(0, 300)}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
  throw new Error(`health check failed after restart: ${lastError}`);
}

function run(command: string, args: string[], env: Env) {
  console.log(`[agentpets:production] $ ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    env: env as NodeJS.ProcessEnv,
    shell: process.platform === "win32",
    stdio: "inherit",
  });
  if (result.status !== 0) {
    throw new Error(
      `command failed (${result.status ?? "signal"}): ${command} ${args.join(" ")}`,
    );
  }
}

function clean(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
