"use client";

import { Fragment, useState } from "react";

import { track } from "@vercel/analytics";
import { Check, CircleAlert, Copy } from "lucide-react";
import { useTranslations } from "next-intl";

import { CodexLogo } from "@/components/codex-logo";

type CommandLineProps = {
  command: string;
  /** Lighter prefix prepended without being copied (eg. "$ "). Visual only. */
  prefix?: string;
  /** Tracking event payload key. */
  source?: string;
  className?: string;
  /**
   * If provided, render a Codex deep-link button next to the copy
   * affordance. The seed prompt is wrapped as
   * `Install this AgentPets pet by running: <command>` so Codex Desktop
   * runs the install without the user needing a terminal.
   */
  codexPrompt?: string;
};

const GITHUB_CLI =
  "https://github.com/agiagentsdev/agentpets-dev/releases/latest/download/agentpets-cli.tgz";
const GITHUB_NPX = `npx -y ${GITHUB_CLI}`;

/**
 * Display and copy use the GitHub package spec. Legacy npm snippets are mapped
 * to GitHub so old content does not keep copying a package that is not public.
 */
function pinToLatest(command: string): string {
  if (command.includes(GITHUB_CLI)) return command;
  const scopedNpxMatch = command.match(/^(.*?\bnpx\s+)@agentpets\/cli(\b.*)$/);
  if (scopedNpxMatch) {
    return `${scopedNpxMatch[1]}-y ${GITHUB_CLI}${scopedNpxMatch[2]}`;
  }
  const legacyNpxMatch = command.match(/^(.*?\bnpx\s+)petdex(\b.*)$/);
  if (legacyNpxMatch) {
    return `${legacyNpxMatch[1]}-y ${GITHUB_CLI}${legacyNpxMatch[2]}`;
  }
  const bareMatch = command.match(/^(?:petdex|agentpets)(\b.*)$/);
  if (bareMatch) return `${GITHUB_NPX}${bareMatch[1]}`;
  return command;
}

async function writeClipboard(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
  } catch {
    // Fall through to the textarea fallback for browsers that expose the API
    // but block it in the current permission context.
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) {
    throw new Error("Clipboard write failed");
  }
}

// Soft, light-on-light syntax: command word in brand blue, subcommands darker,
// flags accent-violet, paths/strings stone, pipes/redirects muted.
function tokenize(command: string): React.ReactNode {
  const parts = command.split(/(\s+|\||&&|\|\||;)/g).filter((s) => s !== "");
  let cmdSeen = false;
  let firstWordSeen = false;
  let offset = 0;

  return parts.map((p) => {
    const key = `${offset}:${p}`;
    offset += p.length;
    if (/^\s+$/.test(p)) {
      return <Fragment key={key}>{p}</Fragment>;
    }
    if (p === "|" || p === "&&" || p === "||" || p === ";") {
      return (
        <span key={key} className="text-muted-4">
          {p}
        </span>
      );
    }
    if (!firstWordSeen) {
      firstWordSeen = true;
      cmdSeen = true;
      return (
        <span key={key} className="font-medium text-brand-deep">
          {p}
        </span>
      );
    }
    if (p.startsWith("-")) {
      return (
        <span key={key} className="text-brand">
          {p}
        </span>
      );
    }
    if (cmdSeen && /^[a-z][a-z0-9-]*$/.test(p)) {
      cmdSeen = false;
      return (
        <span key={key} className="font-medium text-foreground">
          {p}
        </span>
      );
    }
    return (
      <span key={key} className="text-muted-2">
        {p}
      </span>
    );
  });
}

export function CommandLine({
  command,
  prefix = "$ ",
  source,
  className = "",
  codexPrompt,
}: CommandLineProps) {
  const t = useTranslations("commandLine");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const copied = copyState === "copied";
  const failed = copyState === "failed";

  async function handleCopy() {
    // Keep copied legacy snippets aligned with the GitHub install path.
    const toCopy = pinToLatest(command);
    try {
      await writeClipboard(toCopy);
      setCopyState("copied");
      track("command_line_copied", {
        command: command.slice(0, 80),
        source: source ?? "unknown",
      });
      window.setTimeout(() => setCopyState("idle"), 1500);
    } catch {
      setCopyState("failed");
      window.setTimeout(() => setCopyState("idle"), 1800);
    }
  }

  // The whole row is the click target for copy. We split into div + inner
  // controls only when a Codex link is present so the second action is its
  // own anchor (button-in-button is invalid HTML and also defeats the copy).
  if (codexPrompt) {
    return (
      <div
        style={{
          fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
        }}
        className={`group inline-flex items-center gap-2 rounded-xl border border-border-base bg-surface/80 px-3 py-2 text-left text-[12px] text-foreground backdrop-blur transition hover:border-brand-light/40 hover:bg-surface ${className}`}
      >
        <button
          type="button"
          onClick={() => void handleCopy()}
          aria-label={
            copied ? t("copiedAria") : failed ? t("failedAria") : t("copyAria")
          }
          className="flex flex-1 items-center gap-2 truncate text-left"
        >
          <span className="select-none text-brand">{prefix}</span>
          <span className="flex-1 truncate">{tokenize(command)}</span>
          <span className="grid size-6 shrink-0 place-items-center rounded-md text-muted-3 transition group-hover:bg-brand-tint group-hover:text-brand-deep">
            {copied ? (
              <Check className="size-3.5 text-brand-deep" />
            ) : failed ? (
              <CircleAlert className="size-3.5 text-rose-600" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </span>
        </button>
        <a
          href={`codex://new?prompt=${encodeURIComponent(`Install this AgentPets pet by running: ${pinToLatest(command)}`)}`}
          aria-label={t("openInCodexAria")}
          onClick={() =>
            track("command_line_codex_clicked", {
              command: command.slice(0, 80),
              source: source ?? "unknown",
            })
          }
          className="grid size-6 shrink-0 place-items-center rounded-md text-muted-3 transition hover:bg-brand-tint"
        >
          <CodexLogo className="size-3.5" />
        </a>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      aria-label={
        copied ? t("copiedAria") : failed ? t("failedAria") : t("copyAria")
      }
      style={{ fontFamily: "var(--font-geist-mono), ui-monospace, monospace" }}
      className={`group inline-flex items-center gap-2 rounded-xl border border-border-base bg-surface/80 px-3 py-2 text-left text-[12px] text-foreground backdrop-blur transition hover:border-brand-light/40 hover:bg-surface ${className}`}
    >
      <span className="select-none text-brand">{prefix}</span>
      <span className="flex-1 truncate">{tokenize(command)}</span>
      <span className="grid size-6 shrink-0 place-items-center rounded-md text-muted-3 transition group-hover:bg-brand-tint group-hover:text-brand-deep">
        {copied ? (
          <Check className="size-3.5 text-brand-deep" />
        ) : failed ? (
          <CircleAlert className="size-3.5 text-rose-600" />
        ) : (
          <Copy className="size-3.5" />
        )}
      </span>
    </button>
  );
}
