import { NextResponse } from "next/server";

type AuthResult = {
  userId: string | null;
  sessionId: string | null;
  sessionClaims: Record<string, unknown> | null;
  orgId: string | null;
  orgRole: string | null;
  redirectToSignIn: (_options?: Record<string, unknown>) => Response;
  protect: () => Promise<void>;
};

function disabledAuthResult(): AuthResult {
  return {
    userId: null,
    sessionId: null,
    sessionClaims: null,
    orgId: null,
    orgRole: null,
    redirectToSignIn: () =>
      NextResponse.redirect(new URL("/", "https://agentpets.dev")),
    protect: async () => {
      throw new Error("AgentPets auth is temporarily disabled.");
    },
  };
}

export async function auth(): Promise<AuthResult> {
  return disabledAuthResult();
}

export async function currentUser() {
  return null;
}

export async function clerkClient() {
  return {
    users: {
      getUser: async () => {
        throw new Error("AgentPets auth is temporarily disabled.");
      },
      getUserList: async () => ({ data: [] as unknown[], totalCount: 0 }),
      updateUserMetadata: async () => undefined,
    },
  };
}

type MiddlewareHandler = (
  authObj: {
    protect: () => Promise<void>;
    userId: string | null;
  },
  req: Request,
) => Promise<Response | undefined> | Response | undefined;

export function clerkMiddleware(handler: MiddlewareHandler) {
  return async (req: Request) => {
    return handler(
      {
        protect: async () => {
          throw new Error("AgentPets auth is temporarily disabled.");
        },
        userId: null,
      },
      req,
    );
  };
}

export function createRouteMatcher(patterns: string[]) {
  const normalizedPatterns = patterns.map((pattern) =>
    pattern.replace(/^\/:locale/, "/[^/]+").replace(/\(\.\*\)/g, ".*"),
  );

  return (req: Request | { nextUrl?: { pathname?: string } }) => {
    const pathname =
      "nextUrl" in req && req.nextUrl?.pathname
        ? req.nextUrl.pathname
        : new URL((req as Request).url).pathname;

    return normalizedPatterns.some((pattern) => {
      const source = `^${pattern.replace(/\//g, "\\/")}$`;
      return new RegExp(source).test(pathname);
    });
  };
}
