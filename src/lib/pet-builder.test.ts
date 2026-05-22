import { describe, expect, it } from "bun:test";

import {
  BUILDER_ATLAS,
  buildPetJson,
  normalizeBuilderTags,
  slugifyBuilderPetId,
  validateBuilderPetInput,
} from "@/lib/pet-builder";

describe("slugifyBuilderPetId", () => {
  it("creates install-safe pet ids", () => {
    expect(slugifyBuilderPetId("  Boba Bot!! v2  ")).toBe("boba-bot-v2");
  });
});

describe("normalizeBuilderTags", () => {
  it("dedupes and limits tags", () => {
    expect(
      normalizeBuilderTags(
        "Codex, codex, AI Agent, bad tag!!, one, two, three, four, five",
      ),
    ).toEqual([
      "codex",
      "ai-agent",
      "bad-tag",
      "one",
      "two",
      "three",
      "four",
      "five",
    ]);
  });
});

describe("validateBuilderPetInput", () => {
  it("rejects URLs in public text fields", () => {
    const result = validateBuilderPetInput({
      displayName: "Builder",
      description: "Download at https://example.com",
    });

    expect(result.ok).toBe(false);
    expect(result.issues.join(" ")).toContain("URLs");
  });

  it("normalizes missing values into a valid starter pet", () => {
    const result = validateBuilderPetInput({});

    expect(result.ok).toBe(true);
    expect(result.normalized.id).toBe("agent-pet");
    expect(result.normalized.shape).toBe("blob");
  });
});

describe("buildPetJson", () => {
  it("exports the canonical 8x9 AgentPets atlas metadata", () => {
    const json = buildPetJson({
      id: "boba-builder",
      displayName: "Boba Builder",
      description: "A starter pet.",
      shape: "robot",
      primaryColor: "#4f46e5",
      accentColor: "#22c55e",
      tags: ["builder"],
    });

    expect(json.spritesheet).toEqual({
      file: "spritesheet.png",
      width: BUILDER_ATLAS.width,
      height: BUILDER_ATLAS.height,
      columns: BUILDER_ATLAS.columns,
      rows: BUILDER_ATLAS.rows,
      cellWidth: BUILDER_ATLAS.cellWidth,
      cellHeight: BUILDER_ATLAS.cellHeight,
    });
    expect(json.states).toHaveLength(BUILDER_ATLAS.rows);
  });
});
