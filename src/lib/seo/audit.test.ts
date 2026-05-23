import { describe, expect, it } from "bun:test";

import { auditPetSeo, suggestPetSeo } from "./audit";

const basePet = {
  slug: "boba",
  displayName: "Boba",
  description: "A calm coding companion.",
  kind: "creature",
  tags: ["pixel", "focus"],
  vibes: ["focused"],
};

describe("auditPetSeo", () => {
  it("flags missing custom SEO fields", () => {
    const result = auditPetSeo(basePet);

    expect(result.score).toBeLessThan(80);
    expect(result.issues.map((issue) => issue.code)).toContain(
      "missing_title",
    );
    expect(result.issues.map((issue) => issue.code)).toContain(
      "missing_description",
    );
    expect(result.suggestions.seoTitle).toContain("Boba");
  });

  it("scores complete SEO higher", () => {
    const suggestion = suggestPetSeo(basePet);
    const result = auditPetSeo({ ...basePet, ...suggestion });

    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.issues.filter((issue) => issue.severity === "error")).toEqual(
      [],
    );
  });
});
