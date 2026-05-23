"use client";

import { useEffect, useState } from "react";

const examples = [
  {
    label: "List popular pets",
    path: "/api/v1/pets?limit=3&sort=popular",
  },
  {
    label: "Fetch Boba",
    path: "/api/v1/pets/boba",
  },
  {
    label: "Top creators",
    path: "/api/v1/creators?metric=pets&limit=3",
  },
  {
    label: "Embed snippet",
    path: "/api/v1/embed/boba",
  },
] as const;

type ApiExample = (typeof examples)[number];

export function ApiLiveExamples() {
  const [selected, setSelected] = useState<ApiExample>(examples[0]);
  const [body, setBody] = useState("Loading...");

  useEffect(() => {
    const controller = new AbortController();
    setBody("Loading...");
    fetch(selected.path, { signal: controller.signal })
      .then(async (res) => {
        const text = await res.text();
        try {
          setBody(JSON.stringify(JSON.parse(text), null, 2));
        } catch {
          setBody(text);
        }
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setBody(error instanceof Error ? error.message : "Request failed");
      });
    return () => controller.abort();
  }, [selected]);

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-4 px-5 pb-16 md:px-8 lg:grid-cols-[280px_1fr]">
      <div className="rounded-2xl border border-border-base bg-surface p-4">
        <p className="font-mono text-xs tracking-[0.22em] text-brand uppercase">
          Live examples
        </p>
        <div className="mt-4 grid gap-2">
          {examples.map((example) => (
            <button
              key={example.path}
              type="button"
              onClick={() => setSelected(example)}
              className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                selected.path === example.path
                  ? "border-brand bg-brand-tint text-brand-deep"
                  : "border-border-base bg-background text-muted-2 hover:border-border-strong hover:text-foreground"
              }`}
            >
              <span className="block font-medium">{example.label}</span>
              <span className="mt-1 block break-all font-mono text-[11px] opacity-75">
                {example.path}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="min-w-0 rounded-2xl border border-border-base bg-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-xs text-muted-3">GET {selected.path}</p>
          <a
            href={selected.path}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-border-base px-3 py-1 text-xs font-medium transition hover:border-border-strong"
          >
            Open
          </a>
        </div>
        <pre className="mt-4 max-h-[520px] overflow-auto rounded-xl border border-border-base bg-background p-4 text-xs leading-6 text-muted-2">
          <code>{body}</code>
        </pre>
      </div>
    </section>
  );
}
