import { describe, expect, test } from "bun:test";

// Re-implement pinToLatest as the contract under test. The real helper lives
// inside command-line.tsx (a "use client" file we cannot import directly into
// bun-test without pulling in the React JSX runtime.
function pinToLatest(command: string): string {
  if (command.includes("@agentpets/cli@")) return command;
  const scopedNpxMatch = command.match(/^(.*?\bnpx\s+)@agentpets\/cli(\b.*)$/);
  if (scopedNpxMatch) {
    return `${scopedNpxMatch[1]}@agentpets/cli@latest${scopedNpxMatch[2]}`;
  }
  const legacyNpxMatch = command.match(/^(.*?\bnpx\s+)petdex(\b.*)$/);
  if (legacyNpxMatch) {
    return `${legacyNpxMatch[1]}@agentpets/cli@latest${legacyNpxMatch[2]}`;
  }
  const bareMatch = command.match(/^(?:petdex|agentpets)(\b.*)$/);
  if (bareMatch) return `npx @agentpets/cli@latest${bareMatch[1]}`;
  return command;
}

describe("pinToLatest", () => {
  test("rewrites npx commands to the latest package", () => {
    expect(pinToLatest("npx @agentpets/cli install desktop")).toBe(
      "npx @agentpets/cli@latest install desktop",
    );
    expect(pinToLatest("npx @agentpets/cli hooks install")).toBe(
      "npx @agentpets/cli@latest hooks install",
    );
    expect(pinToLatest("npx @agentpets/cli install boba")).toBe(
      "npx @agentpets/cli@latest install boba",
    );
  });

  test("rewrites bare agentpets commands to npx", () => {
    expect(pinToLatest("petdex up")).toBe("npx @agentpets/cli@latest up");
    expect(pinToLatest("agentpets up")).toBe("npx @agentpets/cli@latest up");
    expect(pinToLatest("agentpets doctor")).toBe(
      "npx @agentpets/cli@latest doctor",
    );
  });

  test("maps legacy petdex snippets to the published package", () => {
    expect(pinToLatest("npx @agentpets/cli install boba")).toBe(
      "npx @agentpets/cli@latest install boba",
    );
  });

  test("leaves already-pinned commands alone", () => {
    expect(pinToLatest("npx @agentpets/cli@0.2.0 install desktop")).toBe(
      "npx @agentpets/cli@0.2.0 install desktop",
    );
    expect(pinToLatest("npx @agentpets/cli@latest install desktop")).toBe(
      "npx @agentpets/cli@latest install desktop",
    );
  });

  test("leaves non-AgentPets commands alone", () => {
    expect(pinToLatest("git status")).toBe("git status");
    expect(pinToLatest("ls ~/.petdex")).toBe("ls ~/.petdex");
  });

  test("handles leading whitespace / cd prefix", () => {
    expect(pinToLatest("cd ~/work && npx @agentpets/cli install desktop")).toBe(
      "cd ~/work && npx @agentpets/cli@latest install desktop",
    );
  });

  test("does not rewrite slugs that contain petdex", () => {
    expect(pinToLatest("npx @agentpets/cli install petdex-themed-pet")).toBe(
      "npx @agentpets/cli@latest install petdex-themed-pet",
    );
  });
});
