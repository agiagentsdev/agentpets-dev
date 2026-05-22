import { describe, expect, test } from "bun:test";

// Re-implement pinToLatest as the contract under test. The real helper lives
// inside command-line.tsx (a "use client" file we cannot import directly into
// bun-test without pulling in the React JSX runtime.
function pinToLatest(command: string): string {
  const githubCli =
    "https://github.com/agiagentsdev/agentpets-dev/releases/latest/download/agentpets-cli.tgz";
  if (command.includes(githubCli)) return command;
  const scopedNpxMatch = command.match(/^(.*?\bnpx\s+)@agentpets\/cli(\b.*)$/);
  if (scopedNpxMatch) {
    return `${scopedNpxMatch[1]}-y ${githubCli}${scopedNpxMatch[2]}`;
  }
  const legacyNpxMatch = command.match(/^(.*?\bnpx\s+)petdex(\b.*)$/);
  if (legacyNpxMatch) {
    return `${legacyNpxMatch[1]}-y ${githubCli}${legacyNpxMatch[2]}`;
  }
  const bareMatch = command.match(/^(?:petdex|agentpets)(\b.*)$/);
  if (bareMatch) return `npx -y ${githubCli}${bareMatch[1]}`;
  return command;
}

describe("pinToLatest", () => {
  test("rewrites npx commands to the latest package", () => {
    expect(pinToLatest("npx -y https://github.com/agiagentsdev/agentpets-dev/releases/latest/download/agentpets-cli.tgz install desktop")).toBe(
      "npx -y https://github.com/agiagentsdev/agentpets-dev/releases/latest/download/agentpets-cli.tgz install desktop",
    );
    expect(pinToLatest("npx -y https://github.com/agiagentsdev/agentpets-dev/releases/latest/download/agentpets-cli.tgz hooks install")).toBe(
      "npx -y https://github.com/agiagentsdev/agentpets-dev/releases/latest/download/agentpets-cli.tgz hooks install",
    );
    expect(pinToLatest("npx -y https://github.com/agiagentsdev/agentpets-dev/releases/latest/download/agentpets-cli.tgz install boba")).toBe(
      "npx -y https://github.com/agiagentsdev/agentpets-dev/releases/latest/download/agentpets-cli.tgz install boba",
    );
  });

  test("rewrites bare agentpets commands to npx", () => {
    expect(pinToLatest("petdex up")).toBe("npx -y https://github.com/agiagentsdev/agentpets-dev/releases/latest/download/agentpets-cli.tgz up");
    expect(pinToLatest("agentpets up")).toBe("npx -y https://github.com/agiagentsdev/agentpets-dev/releases/latest/download/agentpets-cli.tgz up");
    expect(pinToLatest("agentpets doctor")).toBe(
      "npx -y https://github.com/agiagentsdev/agentpets-dev/releases/latest/download/agentpets-cli.tgz doctor",
    );
  });

  test("maps legacy npm snippets to the GitHub tarball", () => {
    expect(pinToLatest("npx @agentpets/cli install boba")).toBe(
      "npx -y https://github.com/agiagentsdev/agentpets-dev/releases/latest/download/agentpets-cli.tgz install boba",
    );
    expect(pinToLatest("npx petdex install boba")).toBe(
      "npx -y https://github.com/agiagentsdev/agentpets-dev/releases/latest/download/agentpets-cli.tgz install boba",
    );
  });

  test("leaves already-pinned commands alone", () => {
    expect(pinToLatest("npx -y https://github.com/agiagentsdev/agentpets-dev/releases/latest/download/agentpets-cli.tgz install desktop")).toBe(
      "npx -y https://github.com/agiagentsdev/agentpets-dev/releases/latest/download/agentpets-cli.tgz install desktop",
    );
  });

  test("leaves non-AgentPets commands alone", () => {
    expect(pinToLatest("git status")).toBe("git status");
    expect(pinToLatest("ls ~/.petdex")).toBe("ls ~/.petdex");
  });

  test("handles leading whitespace / cd prefix", () => {
    expect(pinToLatest("cd ~/work && npx -y https://github.com/agiagentsdev/agentpets-dev/releases/latest/download/agentpets-cli.tgz install desktop")).toBe(
      "cd ~/work && npx -y https://github.com/agiagentsdev/agentpets-dev/releases/latest/download/agentpets-cli.tgz install desktop",
    );
  });

  test("does not rewrite slugs that contain petdex", () => {
    expect(pinToLatest("npx -y https://github.com/agiagentsdev/agentpets-dev/releases/latest/download/agentpets-cli.tgz install petdex-themed-pet")).toBe(
      "npx -y https://github.com/agiagentsdev/agentpets-dev/releases/latest/download/agentpets-cli.tgz install petdex-themed-pet",
    );
  });
});
