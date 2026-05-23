import { describe, expect, it } from "bun:test";

import { clusterKeywords, seoKeywordClusters } from "./keywords";

describe("seo keyword clusters", () => {
  it("keeps homepage focused on the category, not a single pet", () => {
    const keywords = clusterKeywords(
      seoKeywordClusters.homepage,
      seoKeywordClusters.codex,
      seoKeywordClusters.cursor,
    );

    expect(keywords[0]).toBe("AI coding pets");
    expect(keywords).toContain("Codex pets");
    expect(keywords).toContain("Cursor pets");
    expect(new Set(keywords.map((keyword) => keyword.toLowerCase())).size).toBe(
      keywords.length,
    );
  });

  it("covers expansion clusters for newer coding-agent surfaces", () => {
    expect(seoKeywordClusters.googleAntigravity.primary).toBe(
      "Google Antigravity pets",
    );
    expect(seoKeywordClusters.githubCopilot.primary).toBe(
      "GitHub Copilot coding agent pets",
    );
    expect(seoKeywordClusters.windsurf.primary).toBe("Windsurf pets");
    expect(seoKeywordClusters.opencode.primary).toBe("OpenCode pets");
  });
});
