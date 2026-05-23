import { NextResponse } from "next/server";

import { buildOpenApiSpec } from "@/lib/openapi";
import { publicApiHeaders } from "@/lib/public-api";

export const runtime = "nodejs";
export const revalidate = 86400;

export async function GET(): Promise<Response> {
  return NextResponse.json(buildOpenApiSpec(), {
    headers: publicApiHeaders(
      "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    ),
  });
}
