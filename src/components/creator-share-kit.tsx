"use client";

import { useCallback, useState } from "react";

import { Check, Code2, Copy, ExternalLink, Share2 } from "lucide-react";

type ShareSnippet = {
  id: string;
  label: string;
  description: string;
  value: string;
};

type CreatorShareKitProps = {
  title: string;
  subtitle: string;
  pageUrl: string;
  xText: string;
  snippets: ShareSnippet[];
};

export function CreatorShareKit({
  title,
  subtitle,
  pageUrl,
  xText,
  snippets,
}: CreatorShareKitProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = useCallback(async (snippet: ShareSnippet) => {
    try {
      await navigator.clipboard.writeText(snippet.value);
      setCopied(snippet.id);
      window.setTimeout(() => setCopied(null), 1400);
    } catch {
      setCopied(null);
    }
  }, []);

  const shareToX = useCallback(() => {
    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(
      xText,
    )}&url=${encodeURIComponent(pageUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer,width=560,height=540");
  }, [pageUrl, xText]);

  return (
    <section className="rounded-2xl border border-border-base bg-surface/80 p-5 shadow-sm shadow-blue-950/5 backdrop-blur md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-mono text-[11px] tracking-[0.2em] text-brand uppercase">
            Creator share kit
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-2">
            {subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={shareToX}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-inverse px-4 text-sm font-medium text-on-inverse transition hover:bg-inverse-hover"
        >
          <Share2 className="size-4" />
          Share on X
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {snippets.map((snippet) => (
          <article
            key={snippet.id}
            className="flex min-h-44 flex-col justify-between rounded-2xl border border-border-base bg-background p-4"
          >
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                {snippet.id === "embed" ? (
                  <Code2 className="size-4 text-brand" />
                ) : snippet.id === "link" ? (
                  <ExternalLink className="size-4 text-brand" />
                ) : (
                  <Copy className="size-4 text-brand" />
                )}
                {snippet.label}
              </div>
              <p className="mt-2 text-xs leading-5 text-muted-3">
                {snippet.description}
              </p>
              <pre className="mt-3 max-h-20 overflow-hidden rounded-xl border border-border-base bg-surface p-3 text-[11px] leading-5 text-muted-2">
                <code>{snippet.value}</code>
              </pre>
            </div>
            <button
              type="button"
              onClick={() => void copy(snippet)}
              className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-full border border-border-base bg-surface px-3 text-xs font-medium text-muted-2 transition hover:border-border-strong hover:text-foreground"
            >
              {copied === snippet.id ? (
                <Check className="size-3.5 text-emerald-600" />
              ) : (
                <Copy className="size-3.5" />
              )}
              {copied === snippet.id ? "Copied" : "Copy"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
