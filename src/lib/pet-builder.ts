import { petStates } from "@/lib/pet-states";

export const BUILDER_ATLAS = {
  columns: 8,
  rows: 9,
  cellWidth: 192,
  cellHeight: 208,
  width: 1536,
  height: 1872,
} as const;

export const builderShapes = ["blob", "robot", "cat"] as const;
export type BuilderShape = (typeof builderShapes)[number];

export type BuilderPetInput = {
  id: string;
  displayName: string;
  description: string;
  shape: BuilderShape;
  primaryColor: string;
  accentColor: string;
  tags: string[];
};

export type BuilderValidation = {
  ok: boolean;
  issues: string[];
  warnings: string[];
  normalized: BuilderPetInput;
};

export type BuilderPetJson = {
  id: string;
  displayName: string;
  description: string;
  version: 1;
  generator: "agentpets-builder";
  tags: string[];
  spritesheet: {
    file: "spritesheet.png";
    width: number;
    height: number;
    columns: number;
    rows: number;
    cellWidth: number;
    cellHeight: number;
  };
  states: Array<{
    id: string;
    row: number;
    frames: number;
    durationMs: number;
  }>;
  design: {
    shape: BuilderShape;
    primaryColor: string;
    accentColor: string;
  };
};

const HEX_COLOR_RE = /^#[0-9a-f]{6}$/i;
const URL_RE = /\b(?:https?:\/\/|www\.|[a-z0-9-]+\.[a-z]{2,})(?:[^\s]*)?/i;

const DEFAULT_INPUT: BuilderPetInput = {
  id: "agent-pet",
  displayName: "Agent Pet",
  description: "A tiny animated coding companion built with AgentPets.",
  shape: "blob",
  primaryColor: "#4f46e5",
  accentColor: "#22c55e",
  tags: ["builder", "codex", "ai-agent"],
};

export function defaultBuilderPetInput(): BuilderPetInput {
  return { ...DEFAULT_INPUT, tags: [...DEFAULT_INPUT.tags] };
}

export function slugifyBuilderPetId(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function normalizeBuilderTags(value: string | string[]): string[] {
  const raw = Array.isArray(value) ? value : value.split(",");
  const seen = new Set<string>();
  const tags: string[] = [];

  for (const item of raw) {
    const tag = item
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 32);
    if (!tag || seen.has(tag)) continue;
    seen.add(tag);
    tags.push(tag);
    if (tags.length >= 8) break;
  }

  return tags;
}

export function validateBuilderPetInput(
  input: Partial<BuilderPetInput>,
): BuilderValidation {
  const rawDisplayName = cleanText(input.displayName ?? DEFAULT_INPUT.displayName);
  const rawDescription = cleanText(input.description ?? DEFAULT_INPUT.description);
  const displayName = rawDisplayName.slice(0, 60);
  const description = rawDescription.slice(0, 280);
  const id =
    slugifyBuilderPetId(input.id ?? "") ||
    slugifyBuilderPetId(displayName) ||
    DEFAULT_INPUT.id;
  const shape = isBuilderShape(input.shape) ? input.shape : DEFAULT_INPUT.shape;
  const primaryColor = normalizeColor(
    input.primaryColor,
    DEFAULT_INPUT.primaryColor,
  );
  const accentColor = normalizeColor(input.accentColor, DEFAULT_INPUT.accentColor);
  const tags = normalizeBuilderTags(input.tags ?? DEFAULT_INPUT.tags);

  const issues: string[] = [];
  const warnings: string[] = [];

  if (!displayName) issues.push("Display name is required.");
  if (rawDisplayName.length > 60) {
    issues.push("Display name must be 60 characters or fewer.");
  }
  if (!description) issues.push("Description is required.");
  if (rawDescription.length > 280) {
    issues.push("Description must be 280 characters or fewer.");
  }
  if (!id) issues.push("Pet id must contain at least one letter or number.");
  if (URL_RE.test(displayName) || URL_RE.test(description)) {
    issues.push("Name and description cannot contain URLs.");
  }
  if (tags.length === 0) warnings.push("Add at least one tag for better discovery.");
  if (primaryColor.toLowerCase() === accentColor.toLowerCase()) {
    warnings.push("Use different primary and accent colors for a clearer sprite.");
  }

  return {
    ok: issues.length === 0,
    issues,
    warnings,
    normalized: {
      id,
      displayName,
      description,
      shape,
      primaryColor,
      accentColor,
      tags,
    },
  };
}

export function buildPetJson(input: BuilderPetInput): BuilderPetJson {
  const validation = validateBuilderPetInput(input);
  const pet = validation.normalized;

  return {
    id: pet.id,
    displayName: pet.displayName,
    description: pet.description,
    version: 1,
    generator: "agentpets-builder",
    tags: pet.tags,
    spritesheet: {
      file: "spritesheet.png",
      width: BUILDER_ATLAS.width,
      height: BUILDER_ATLAS.height,
      columns: BUILDER_ATLAS.columns,
      rows: BUILDER_ATLAS.rows,
      cellWidth: BUILDER_ATLAS.cellWidth,
      cellHeight: BUILDER_ATLAS.cellHeight,
    },
    states: petStates.map((state) => ({
      id: state.id,
      row: state.row,
      frames: state.frames,
      durationMs: state.durationMs,
    })),
    design: {
      shape: pet.shape,
      primaryColor: pet.primaryColor,
      accentColor: pet.accentColor,
    },
  };
}

function cleanText(value: string | null | undefined): string {
  return (value ?? "").replace(/[\u0000-\u001f\u007f]+/g, " ").trim();
}

function normalizeColor(value: string | null | undefined, fallback: string) {
  return value && HEX_COLOR_RE.test(value) ? value : fallback;
}

function isBuilderShape(value: unknown): value is BuilderShape {
  return typeof value === "string" && builderShapes.includes(value as BuilderShape);
}
