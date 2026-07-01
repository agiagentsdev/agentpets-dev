export function isAuthDisabled(): boolean {
  return (
    process.env.AGENTPETS_AUTH_DISABLED === "1" ||
    process.env.NEXT_PUBLIC_AGENTPETS_AUTH_DISABLED === "1"
  );
}

export function isClientAuthDisabled(): boolean {
  return process.env.NEXT_PUBLIC_AGENTPETS_AUTH_DISABLED === "1";
}
