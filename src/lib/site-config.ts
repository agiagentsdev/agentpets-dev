export const siteConfig = {
  name: "AgentPets",
  shortName: "AgentPets",
  domain: "agentpets.dev",
  url: "https://agentpets.dev",
  repoUrl: "https://github.com/agiagentsdev/agentpets-dev",
  repoSlug: "agiagentsdev/agentpets-dev",
  npmPackage:
    "https://github.com/agiagentsdev/agentpets-dev/releases/latest/download/agentpets-cli.tgz",
  cliName: "agentpets",
  installCommand: "npx -y https://github.com/agiagentsdev/agentpets-dev/releases/latest/download/agentpets-cli.tgz install",
  supportEmail: "hello@agentpets.dev",
  upstreamName: "Petdex",
  upstreamUrl: "https://petdex.crafter.run",
  upstreamRepoUrl: "https://github.com/crafter-station/petdex",
} as const;

export function installCommandFor(slug: string) {
  return `${siteConfig.installCommand} ${slug}`;
}

export function siteUrl(pathname = "/") {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return new URL(path, siteConfig.url).toString();
}
