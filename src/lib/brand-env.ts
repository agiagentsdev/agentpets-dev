export function firstEnv(...names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return undefined;
}

export function getAppBaseUrl(): string {
  const configured = firstEnv("AGENTPETS_URL", "PETDEX_URL");
  if (configured) return configured.replace(/\/+$/, "");
  const vercelUrl = firstEnv("VERCEL_URL");
  if (vercelUrl) return `https://${vercelUrl.replace(/^https?:\/\//, "")}`;
  return "http://localhost:6996";
}

export function getAdminUserIdsRaw(): string {
  return firstEnv("AGENTPETS_ADMIN_USER_IDS", "PETDEX_ADMIN_USER_IDS") ?? "";
}

export function getPublicAdminUserIdsRaw(): string {
  return (
    firstEnv(
      "NEXT_PUBLIC_AGENTPETS_ADMIN_USER_IDS",
      "NEXT_PUBLIC_PETDEX_ADMIN_USER_IDS",
    ) ?? ""
  );
}

export function getClerkCliIssuer(): string {
  return (
    firstEnv("AGENTPETS_CLERK_CLI_ISSUER", "CLERK_CLI_ISSUER") ??
    "https://clerk.agentpets.dev"
  );
}

export function getOwnerEmail(): string | undefined {
  return firstEnv("AGENTPETS_OWNER_EMAIL", "PETDEX_OWNER_EMAIL");
}

export function getAdminNotifyEmail(): string | undefined {
  return firstEnv("AGENTPETS_ADMIN_NOTIFY_EMAIL", "PETDEX_ADMIN_NOTIFY_EMAIL");
}
