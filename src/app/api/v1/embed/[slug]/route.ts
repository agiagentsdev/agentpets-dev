import { NextResponse } from "next/server";

import { getPetWithMetrics } from "@/lib/pets";
import {
  publicApiEnvelope,
  publicApiHeaders,
  serializePublicPet,
} from "@/lib/public-api";
import { siteUrl } from "@/lib/site-config";

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

  const iframe = `<iframe src="${siteUrl(`/embed/${pet.slug}`)}" width="320" height="420" title="${escapeHtml(
    pet.displayName,
  )} on AgentPets" loading="lazy"></iframe>`;

  return NextResponse.json(
    publicApiEnvelope({
      pet: serializePublicPet(pet),
      embed: {
        iframe,
        url: siteUrl(`/embed/${pet.slug}`),
        width: 320,
        height: 420,
      },
    }),
    {
      headers: publicApiHeaders(
        "public, max-age=60, s-maxage=300, stale-while-revalidate=1800",
      ),
    },
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
