import { NextResponse } from "next/server";

export const runtime = "nodejs";

export function GET(): Response {
  return NextResponse.json(
    {
      error: "auth_disabled",
      message:
        "AgentPets login is temporarily disabled while Clerk production DNS is configured.",
    },
    { status: 503 },
  );
}
