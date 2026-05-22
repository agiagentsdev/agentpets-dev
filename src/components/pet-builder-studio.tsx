"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useUser } from "@clerk/nextjs";
import { track } from "@vercel/analytics";
import JSZip from "jszip";
import {
  CheckCircle2,
  Download,
  Loader2,
  PackageCheck,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  BUILDER_ATLAS,
  buildPetJson,
  defaultBuilderPetInput,
  type BuilderPetInput,
  type BuilderShape,
  slugifyBuilderPetId,
  validateBuilderPetInput,
} from "@/lib/pet-builder";
import { petStates } from "@/lib/pet-states";

import { PetSprite } from "@/components/pet-sprite";

type BuiltPackage = {
  pet: BuilderPetInput;
  petJsonString: string;
  spriteBlob: Blob;
  spriteUrl: string;
  zipBlob: Blob;
  zipFileName: string;
};

type SubmitState =
  | { kind: "idle" }
  | { kind: "building" }
  | { kind: "uploading"; step: "presign" | "upload" | "register" }
  | { kind: "success"; slug: string; status: string }
  | { kind: "error"; message: string };

const SHAPES: Array<{
  id: BuilderShape;
  label: string;
  description: string;
}> = [
  { id: "blob", label: "Blob", description: "Soft mascot with bouncy motion" },
  { id: "robot", label: "Robot", description: "Terminal-friendly square bot" },
  { id: "cat", label: "Cat", description: "Pointy ears and playful motion" },
];

const COLORS = [
  "#4f46e5",
  "#0891b2",
  "#16a34a",
  "#ea580c",
  "#dc2626",
  "#9333ea",
  "#0f172a",
  "#f59e0b",
];

export function PetBuilderStudio() {
  const { isLoaded, isSignedIn } = useUser();
  const [input, setInput] = useState<BuilderPetInput>(() =>
    defaultBuilderPetInput(),
  );
  const [activeState, setActiveState] = useState("idle");
  const [built, setBuilt] = useState<BuiltPackage | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>({ kind: "idle" });

  const validation = useMemo(() => validateBuilderPetInput(input), [input]);
  const normalized = validation.normalized;
  const canSubmit =
    Boolean(built) &&
    validation.ok &&
    isLoaded &&
    isSignedIn &&
    submitState.kind !== "uploading" &&
    submitState.kind !== "building";

  const replaceBuilt = useCallback((next: BuiltPackage) => {
    setBuilt((current) => {
      if (current?.spriteUrl) URL.revokeObjectURL(current.spriteUrl);
      return next;
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timeout = window.setTimeout(() => {
      void buildPackage(normalized).then((next) => {
        if (cancelled) {
          URL.revokeObjectURL(next.spriteUrl);
          return;
        }
        replaceBuilt(next);
      });
    }, 180);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [normalized, replaceBuilt]);

  useEffect(() => {
    return () => {
      if (built?.spriteUrl) URL.revokeObjectURL(built.spriteUrl);
    };
  }, [built?.spriteUrl]);

  function update<K extends keyof BuilderPetInput>(
    key: K,
    value: BuilderPetInput[K],
  ) {
    setSubmitState({ kind: "idle" });
    setInput((current) => {
      const next = { ...current, [key]: value };
      if (key === "displayName") {
        const currentSlug = slugifyBuilderPetId(current.displayName);
        if (!current.id || current.id === currentSlug) {
          next.id = slugifyBuilderPetId(String(value)) || current.id;
        }
      }
      return next;
    });
  }

  async function handleExport() {
    if (!built) return;
    downloadBlob(built.zipBlob, built.zipFileName);
    track("pet_builder_exported", {
      pet_id: built.pet.id,
      shape: built.pet.shape,
      zip_kb: Math.round(built.zipBlob.size / 1024),
    });
  }

  async function handleSubmit() {
    if (!built || !validation.ok || !isSignedIn) return;
    setSubmitState({ kind: "uploading", step: "presign" });
    const startedAt = performance.now();

    try {
      const spriteFile = new File([built.spriteBlob], "spritesheet.png", {
        type: "image/png",
      });
      const petJsonFile = new File([built.petJsonString], "pet.json", {
        type: "application/json",
      });
      const zipFile = new File([built.zipBlob], built.zipFileName, {
        type: "application/zip",
      });

      const presignRes = await fetch("/api/r2/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slugHint: built.pet.id,
          files: [
            {
              role: "zip",
              contentType: "application/zip",
              size: zipFile.size,
            },
            {
              role: "sprite",
              contentType: "image/png",
              size: spriteFile.size,
            },
            {
              role: "petjson",
              contentType: "application/json",
              size: petJsonFile.size,
            },
          ],
        }),
      });

      if (!presignRes.ok) {
        const data = (await presignRes.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
        };
        throw new Error(data.message ?? data.error ?? `presign ${presignRes.status}`);
      }

      const presignData = (await presignRes.json()) as {
        files: Array<{
          role: "zip" | "sprite" | "petjson";
          uploadUrl: string;
          publicUrl: string;
        }>;
      };
      const slots = new Map(presignData.files.map((file) => [file.role, file]));
      const zipSlot = slots.get("zip");
      const spriteSlot = slots.get("sprite");
      const petJsonSlot = slots.get("petjson");
      if (!zipSlot || !spriteSlot || !petJsonSlot) {
        throw new Error("presign response missing upload slots");
      }

      setSubmitState({ kind: "uploading", step: "upload" });
      await putToR2(petJsonSlot.uploadUrl, petJsonFile, "application/json");
      await putToR2(spriteSlot.uploadUrl, spriteFile, "image/png");
      await putToR2(zipSlot.uploadUrl, zipFile, "application/zip");

      setSubmitState({ kind: "uploading", step: "register" });
      const registerRes = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zipUrl: zipSlot.publicUrl,
          spritesheetUrl: spriteSlot.publicUrl,
          petJsonUrl: petJsonSlot.publicUrl,
          displayName: built.pet.displayName,
          description: built.pet.description,
          petId: built.pet.id,
          spritesheetWidth: BUILDER_ATLAS.width,
          spritesheetHeight: BUILDER_ATLAS.height,
        }),
      });

      if (!registerRes.ok) {
        const data = (await registerRes.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
        };
        throw new Error(data.message ?? data.error ?? `register ${registerRes.status}`);
      }

      const result = (await registerRes.json()) as {
        slug: string;
        status: string;
      };
      track("pet_builder_submitted", {
        pet_id: built.pet.id,
        slug: result.slug,
        status: result.status,
        duration_ms: Math.round(performance.now() - startedAt),
      });
      setSubmitState({
        kind: "success",
        slug: result.slug,
        status: result.status,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      track("pet_builder_submit_failed", {
        pet_id: built.pet.id,
        reason: message.slice(0, 120),
      });
      setSubmitState({ kind: "error", message });
    }
  }

  const submitLabel =
    submitState.kind === "uploading"
      ? submitState.step === "presign"
        ? "Preparing upload"
        : submitState.step === "upload"
          ? "Uploading assets"
          : "Submitting"
      : "Submit to gallery";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
      <section className="rounded-3xl border border-border-base bg-surface/82 p-5 shadow-sm backdrop-blur md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] tracking-[0.2em] text-brand uppercase">
              Builder MVP
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Design a valid AgentPets package
            </h2>
          </div>
          <span className="hidden items-center gap-1 rounded-full bg-chip-success-bg px-3 py-1 text-xs font-medium text-chip-success-fg sm:inline-flex">
            <ShieldCheck className="size-3.5" />
            8x9 atlas
          </span>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">
            Display name
            <input
              value={input.displayName}
              maxLength={60}
              onChange={(event) => update("displayName", event.target.value)}
              className="h-11 rounded-2xl border border-border-base bg-background px-3 text-sm outline-none transition focus:border-border-strong"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Pet id
            <input
              value={input.id}
              maxLength={40}
              onChange={(event) =>
                update("id", slugifyBuilderPetId(event.target.value))
              }
              className="h-11 rounded-2xl border border-border-base bg-background px-3 font-mono text-sm outline-none transition focus:border-border-strong"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium md:col-span-2">
            Description
            <textarea
              value={input.description}
              maxLength={280}
              rows={3}
              onChange={(event) => update("description", event.target.value)}
              className="resize-none rounded-2xl border border-border-base bg-background px-3 py-3 text-sm leading-6 outline-none transition focus:border-border-strong"
            />
            <span className="text-xs font-normal text-muted-3">
              {input.description.length}/280 characters. This becomes the public
              gallery description.
            </span>
          </label>
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium">Shape</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {SHAPES.map((shape) => (
              <button
                type="button"
                key={shape.id}
                onClick={() => update("shape", shape.id)}
                className={`rounded-2xl border p-4 text-left transition ${
                  input.shape === shape.id
                    ? "border-border-strong bg-background shadow-sm"
                    : "border-border-base bg-surface/70 hover:bg-background"
                }`}
              >
                <span className="text-sm font-semibold">{shape.label}</span>
                <span className="mt-1 block text-xs leading-5 text-muted-3">
                  {shape.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <ColorPicker
            label="Primary color"
            value={input.primaryColor}
            onChange={(value) => update("primaryColor", value)}
          />
          <ColorPicker
            label="Accent color"
            value={input.accentColor}
            onChange={(value) => update("accentColor", value)}
          />
          <label className="grid gap-2 text-sm font-medium md:col-span-2">
            Discovery tags
            <input
              value={input.tags.join(", ")}
              onChange={(event) =>
                update(
                  "tags",
                  event.target.value
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                )
              }
              className="h-11 rounded-2xl border border-border-base bg-background px-3 text-sm outline-none transition focus:border-border-strong"
            />
            <span className="text-xs font-normal text-muted-3">
              Comma-separated. Saved in pet.json and useful for admin SEO review.
            </span>
          </label>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <ValidationPanel
            title="Validation"
            items={
              validation.issues.length
                ? validation.issues
                : ["Package metadata is ready."]
            }
            ok={validation.issues.length === 0}
          />
          <ValidationPanel
            title="Export contents"
            items={[
              "pet.json with safe metadata",
              "spritesheet.png at 1536x1872",
              `${built ? Math.max(1, Math.round(built.zipBlob.size / 1024)) : 0} KB ZIP package`,
            ]}
            ok={Boolean(built)}
          />
        </div>

        {validation.warnings.length ? (
          <div className="mt-3 rounded-2xl bg-chip-warning-bg p-4 text-sm leading-6 text-chip-warning-fg">
            {validation.warnings.join(" ")}
          </div>
        ) : null}
      </section>

      <aside className="flex flex-col gap-4">
        <section className="rounded-3xl border border-border-base bg-surface/85 p-5 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] tracking-[0.2em] text-muted-3 uppercase">
                Live preview
              </p>
              <h2 className="mt-1 text-xl font-semibold">
                {normalized.displayName}
              </h2>
            </div>
            {built ? (
              <span className="rounded-full bg-background px-3 py-1 font-mono text-[10px] text-muted-2">
                {BUILDER_ATLAS.width}x{BUILDER_ATLAS.height}
              </span>
            ) : null}
          </div>

          <div className="mt-5 grid place-items-center rounded-3xl border border-border-base bg-background py-8">
            {built ? (
              <PetSprite
                src={built.spriteUrl}
                state={activeState as (typeof petStates)[number]["id"]}
                scale={0.82}
                label={`${normalized.displayName} preview`}
              />
            ) : (
              <Loader2 className="size-6 animate-spin text-muted-3" />
            )}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {petStates.map((state) => (
              <button
                key={state.id}
                type="button"
                onClick={() => setActiveState(state.id)}
                className={`h-9 rounded-full px-2 text-xs font-medium transition ${
                  activeState === state.id
                    ? "bg-inverse text-on-inverse"
                    : "bg-background text-muted-2 hover:text-foreground"
                }`}
              >
                {state.label}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-border-base bg-surface/85 p-5 shadow-sm backdrop-blur">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <PackageCheck className="size-4" />
            Ship package
          </div>
          <div className="mt-4 grid gap-2">
            <button
              type="button"
              onClick={() => void buildPackage(normalized).then(replaceBuilt)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border-base bg-background px-4 text-sm font-medium transition hover:border-border-strong"
            >
              <RefreshCw className="size-4" />
              Regenerate
            </button>
            <button
              type="button"
              disabled={!built || !validation.ok}
              onClick={() => void handleExport()}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border-base bg-background px-4 text-sm font-medium transition hover:border-border-strong disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="size-4" />
              Export ZIP
            </button>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={() => void handleSubmit()}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-inverse px-4 text-sm font-medium text-on-inverse transition hover:bg-inverse-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitState.kind === "uploading" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              {submitLabel}
            </button>
          </div>

          {!isLoaded ? null : !isSignedIn ? (
            <p className="mt-3 rounded-2xl bg-chip-warning-bg p-3 text-sm leading-6 text-chip-warning-fg">
              Sign in to submit. Export works locally without an account.
            </p>
          ) : null}

          {submitState.kind === "success" ? (
            <a
              href={`/pets/${submitState.slug}`}
              className="mt-3 flex items-center gap-2 rounded-2xl bg-chip-success-bg p-3 text-sm font-medium text-chip-success-fg"
            >
              <CheckCircle2 className="size-4" />
              Submitted as {submitState.status}. View pet
            </a>
          ) : null}

          {submitState.kind === "error" ? (
            <p className="mt-3 rounded-2xl bg-chip-danger-bg p-3 text-sm leading-6 text-chip-danger-fg">
              {submitState.message}
            </p>
          ) : null}
        </section>
      </aside>
    </div>
  );
}

function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2 text-sm font-medium">
      {label}
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-14 rounded-2xl border border-border-base bg-background p-1"
        />
        <div className="flex flex-wrap gap-1.5">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onChange(color)}
              className="size-7 rounded-full border border-border-base"
              style={{ backgroundColor: color }}
              aria-label={`Use ${color}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ValidationPanel({
  title,
  items,
  ok,
}: {
  title: string;
  items: string[];
  ok: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border-base bg-background p-4">
      <div className="flex items-center gap-2 text-sm font-semibold">
        {ok ? (
          <CheckCircle2 className="size-4 text-emerald-600" />
        ) : (
          <Sparkles className="size-4 text-amber-600" />
        )}
        {title}
      </div>
      <ul className="mt-2 space-y-1 text-sm leading-6 text-muted-2">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

async function buildPackage(input: BuilderPetInput): Promise<BuiltPackage> {
  const validation = validateBuilderPetInput(input);
  const pet = validation.normalized;
  const petJsonString = JSON.stringify(buildPetJson(pet), null, 2);
  const spriteBlob = await renderSpritesheet(pet);
  const spriteUrl = URL.createObjectURL(spriteBlob);
  const zip = new JSZip();
  zip.file("pet.json", petJsonString);
  zip.file("spritesheet.png", spriteBlob);
  const zipBlob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
  });

  return {
    pet,
    petJsonString,
    spriteBlob,
    spriteUrl,
    zipBlob,
    zipFileName: `${pet.id}.zip`,
  };
}

function renderSpritesheet(input: BuilderPetInput): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = BUILDER_ATLAS.width;
  canvas.height = BUILDER_ATLAS.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available.");
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const state of petStates) {
    for (let frame = 0; frame < BUILDER_ATLAS.columns; frame += 1) {
      const x = frame * BUILDER_ATLAS.cellWidth;
      const y = state.row * BUILDER_ATLAS.cellHeight;
      drawFrame(ctx, input, state.id, frame, x, y);
    }
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Could not export spritesheet."));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  input: BuilderPetInput,
  state: string,
  frame: number,
  originX: number,
  originY: number,
) {
  const t = frame / Math.max(1, BUILDER_ATLAS.columns - 1);
  const bob = Math.sin(t * Math.PI * 2) * 5;
  const run = state.includes("running") ? Math.sin(t * Math.PI * 4) * 9 : 0;
  const jump =
    state === "jumping" ? -Math.sin(Math.min(1, t) * Math.PI) * 34 : 0;
  const wave = state === "waving" ? Math.sin(t * Math.PI * 4) * 14 : 0;
  const sad = state === "failed";
  const waiting = state === "waiting";
  const review = state === "review";
  const cx = originX + BUILDER_ATLAS.cellWidth / 2 + run;
  const cy = originY + 105 + bob + jump + (waiting ? 4 : 0);
  const primary = input.primaryColor;
  const accent = input.accentColor;

  ctx.save();
  ctx.shadowColor = "rgba(15, 23, 42, 0.16)";
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(15, 23, 42, 0.12)";
  ellipse(ctx, originX + 96, originY + 176, 44, 10);
  ctx.shadowColor = "transparent";

  if (input.shape === "robot") {
    roundedRect(ctx, cx - 43, cy - 52, 86, 80, 18, primary);
    roundedRect(ctx, cx - 30, cy - 70, 60, 26, 10, accent);
    antenna(ctx, cx, cy - 70, accent);
  } else if (input.shape === "cat") {
    triangle(ctx, cx - 36, cy - 52, cx - 20, cy - 86, cx - 5, cy - 52, primary);
    triangle(ctx, cx + 36, cy - 52, cx + 20, cy - 86, cx + 5, cy - 52, primary);
    ellipse(ctx, cx, cy - 16, 48, 58, primary);
  } else {
    ellipse(ctx, cx, cy - 20, 50, 58, primary);
    ellipse(ctx, cx + 26, cy - 55, 18, 14, accent);
  }

  const eyeY = cy - 32;
  const blink = state === "idle" && frame === 3;
  drawEye(ctx, cx - 18, eyeY, blink, sad);
  drawEye(ctx, cx + 18, eyeY, blink, sad);
  drawMouth(ctx, cx, cy - 8, sad, review);

  ctx.fillStyle = accent;
  const armY = cy - 8;
  if (state === "waving") {
    roundedRect(ctx, cx + 38, armY - 30 - wave, 14, 42, 7, accent);
  } else {
    roundedRect(ctx, cx + 36, armY + wave / 4, 14, 36, 7, accent);
  }
  roundedRect(ctx, cx - 50, armY - wave / 6, 14, 36, 7, accent);

  const footY = cy + 42;
  roundedRect(ctx, cx - 32 - run / 3, footY, 26, 12, 6, darken(primary));
  roundedRect(ctx, cx + 6 + run / 3, footY, 26, 12, 6, darken(primary));

  if (review) {
    ctx.strokeStyle = accent;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(cx + 42, cy - 44, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 50, cy - 34);
    ctx.lineTo(cx + 62, cy - 20);
    ctx.stroke();
  }

  ctx.restore();
}

function drawEye(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  blink: boolean,
  sad: boolean,
) {
  ctx.fillStyle = "#0f172a";
  if (blink) {
    roundedRect(ctx, x - 6, y, 12, 3, 2, "#0f172a");
    return;
  }
  if (sad) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.35);
    roundedRect(ctx, -7, -2, 14, 4, 2, "#0f172a");
    ctx.restore();
    return;
  }
  ellipse(ctx, x, y, 6, 8, "#0f172a");
  ellipse(ctx, x + 2, y - 2, 2, 3, "#ffffff");
}

function drawMouth(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  sad: boolean,
  review: boolean,
) {
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 4;
  ctx.beginPath();
  if (sad) {
    ctx.arc(x, y + 12, 13, Math.PI * 1.12, Math.PI * 1.88);
  } else if (review) {
    ctx.moveTo(x - 10, y + 4);
    ctx.lineTo(x + 10, y + 4);
  } else {
    ctx.arc(x, y, 13, 0.12 * Math.PI, 0.88 * Math.PI);
  }
  ctx.stroke();
}

function antenna(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y - 20);
  ctx.stroke();
  ellipse(ctx, x, y - 25, 7, 7, color);
}

function ellipse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  color?: string,
) {
  if (color) ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function triangle(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  color: string,
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.closePath();
  ctx.fill();
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  color: string,
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.fill();
}

function darken(hex: string) {
  const normalized = hex.replace("#", "");
  const r = Math.max(0, Number.parseInt(normalized.slice(0, 2), 16) - 36);
  const g = Math.max(0, Number.parseInt(normalized.slice(2, 4), 16) - 36);
  const b = Math.max(0, Number.parseInt(normalized.slice(4, 6), 16) - 36);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function toHex(value: number) {
  return value.toString(16).padStart(2, "0");
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function putToR2(url: string, body: Blob, contentType: string) {
  const delays = [0, 700, 1800];
  let lastError: Error | null = null;

  for (const delay of delays) {
    if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));
    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": contentType },
        body,
      });
      if (response.ok) return;
      lastError = new Error(
        `R2 upload failed: ${response.status} ${response.statusText}`,
      );
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  throw lastError ?? new Error("R2 upload failed.");
}
