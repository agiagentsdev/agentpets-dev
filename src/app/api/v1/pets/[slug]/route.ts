import { NextResponse } from "next/server";

import { getPetWithMetrics } from "@/lib/pets";
import {
  publicApiEnvelope,
  publicApiHeaders,
  serializePublicPet,
} from "@/lib/public-api";

export const runtime = "nodejs";
export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Props): Promise<Response> {
  const { slug } = await params;
  const pet = await getPetWithMetrics(slug.toLowerCase());
  if (!pet) {
    return NextResponse.json(
      publicApiEnvelope({ error: "pet_not_found" }),
      { status: 404, headers: publicApiHeaders("public, max-age=60") },
    );
  }

  return NextResponse.json(publicApiEnvelope(serializePublicPet(pet)), {
    headers: publicApiHeaders(
      "public, max-age=60, s-maxage=300, stale-while-revalidate=1800",
    ),
  });
}
