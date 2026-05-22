import { NextResponse } from "next/server";
import postgres from "postgres";

import { firstEnv, getAppBaseUrl } from "@/lib/brand-env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Check = {
  ok: boolean;
  name: string;
  detail?: string | number | boolean | Record<string, unknown>;
};

const REQUIRED_SUBMITTED_PETS_COLUMNS = [
  "slug",
  "display_name",
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

function hasDetailAccess(req: Request): boolean {
  const token = firstEnv("AGENTPETS_HEALTH_TOKEN", "HEALTHCHECK_TOKEN");
  if (!token) return true;
  return req.headers.get("x-agentpets-health-token") === token;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const deep = url.searchParams.get("deep") === "1";
  const includeDetails = hasDetailAccess(req);
  const checks: Check[] = [
    { name: "app", ok: true, detail: "AgentPets" },
    { name: "url", ok: true, detail: getAppBaseUrl() },
  ];

  if (deep) {
    checks.push(...(await checkDatabase(includeDetails)));
  }

  const ok = checks.every((check) => check.ok);
  return NextResponse.json(
    {
      ok,
      service: "agentpets",
      checkedAt: new Date().toISOString(),
      checks: includeDetails
        ? checks
        : checks.map(({ name, ok }) => ({ name, ok })),
    },
    {
      status: ok ? 200 : 503,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

async function checkDatabase(includeDetails: boolean): Promise<Check[]> {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    return [{ name: "database_url", ok: false, detail: "missing" }];
  }

  let sql: postgres.Sql | null = null;
  try {
    sql = postgres(databaseUrl, { max: 1, connect_timeout: 5 });
    const [ping] = await sql<{ ok: number }[]>`select 1 as ok`;
    const [schema] = await sql<
      {
        submitted_pets: string | null;
        pet_metrics: string | null;
        ad_campaigns: string | null;
      }[]
    >`
      select
        to_regclass('public.submitted_pets')::text as submitted_pets,
        to_regclass('public.pet_metrics')::text as pet_metrics,
        to_regclass('public.ad_campaigns')::text as ad_campaigns
    `;
    const columns = await sql<{ column_name: string }[]>`
      select column_name
      from information_schema.columns
      where table_schema = 'public' and table_name = 'submitted_pets'
    `;
    const columnSet = new Set(columns.map((row) => row.column_name));
    const missingColumns = REQUIRED_SUBMITTED_PETS_COLUMNS.filter(
      (name) => !columnSet.has(name),
    );
    const [pets] = await sql<{ approved_count: string }[]>`
      select count(*)::text as approved_count
      from submitted_pets
      where status = 'approved'
    `;

    return [
      { name: "database", ok: ping?.ok === 1 },
      {
        name: "schema",
        ok: Boolean(
          schema?.submitted_pets && schema.pet_metrics && schema.ad_campaigns,
        ),
        detail: includeDetails ? schema : undefined,
      },
      {
        name: "submitted_pets_columns",
        ok: missingColumns.length === 0,
        detail: includeDetails
          ? { missing: missingColumns, checked: REQUIRED_SUBMITTED_PETS_COLUMNS }
          : undefined,
      },
      {
        name: "approved_pets",
        ok: true,
        detail: includeDetails ? Number(pets?.approved_count ?? 0) : undefined,
      },
    ];
  } catch (error) {
    return [
      {
        name: "database",
        ok: false,
        detail: includeDetails
          ? error instanceof Error
            ? error.message
            : String(error)
          : undefined,
      },
    ];
  } finally {
    await sql?.end({ timeout: 1 }).catch(() => {});
  }
}
