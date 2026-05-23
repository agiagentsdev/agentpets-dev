"use client";

import { useMemo, useState } from "react";

import { Check, ClipboardCheck, Save } from "lucide-react";

import type { SeoAuditIssue, SeoSuggestion } from "@/lib/seo/audit";

type SeoRow = {
  id: string;
  slug: string;
  displayName: string;
  description: string;
  score: number;
  issues: SeoAuditIssue[];
  suggestion: SeoSuggestion;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  seoIntro: string;
  seoFaq: string;
};

type Props = {
  rows: SeoRow[];
};

export function AdminSeoBulkEditor({ rows }: Props) {
  const [items, setItems] = useState(rows);
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(rows.filter((row) => row.score < 90).map((row) => row.id)),
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const selectedRows = useMemo(
    () => items.filter((item) => selected.has(item.id)),
    [items, selected],
  );

  function patchRow(id: string, patch: Partial<SeoRow>) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function applySuggestion(id: string) {
    const row = items.find((item) => item.id === id);
    if (!row) return;
    patchRow(id, {
      seoTitle: row.suggestion.seoTitle,
      seoDescription: row.suggestion.seoDescription,
      seoKeywords: row.suggestion.seoKeywords.join(", "),
      seoIntro: row.suggestion.seoIntro,
      seoFaq: JSON.stringify(row.suggestion.seoFaq, null, 2),
    });
    setSelected((current) => new Set(current).add(id));
  }

  function applySuggestionsToSelected() {
    for (const row of selectedRows) applySuggestion(row.id);
  }

  async function saveSelected() {
    setSaving(true);
    setMessage(null);
    try {
      const updates = selectedRows.map((row) => ({
        id: row.id,
        seoTitle: row.seoTitle,
        seoDescription: row.seoDescription,
        seoKeywords: row.seoKeywords,
        seoIntro: row.seoIntro,
        seoFaq: row.seoFaq,
      }));
      const res = await fetch("/api/admin/seo/bulk", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      const data = (await res.json().catch(() => null)) as
        | { updated?: number; failed?: number; message?: string }
        | null;
      if (!res.ok) {
        throw new Error(data?.message ?? `Save failed (${res.status})`);
      }
      setMessage(
        `Saved ${data?.updated ?? updates.length} pet SEO update(s)${
          data?.failed ? `, ${data.failed} failed` : ""
        }. Refresh to rerun scores.`,
      );
      setSelected(new Set());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-10 rounded-2xl border border-border-base bg-surface/95 p-4 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-xs tracking-[0.22em] text-brand uppercase">
              Bulk SEO editor
            </p>
            <p className="mt-1 text-sm text-muted-2">
              {selectedRows.length} selected - {items.length} approved pets
              loaded - select rows, apply suggestions, then save.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelected(new Set(items.map((item) => item.id)))}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-border-base px-4 text-sm font-medium transition hover:border-border-strong"
            >
              <Check className="size-4" />
              Select all
            </button>
            <button
              type="button"
              onClick={applySuggestionsToSelected}
              disabled={selectedRows.length === 0}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-border-base px-4 text-sm font-medium transition hover:border-border-strong disabled:opacity-50"
            >
              <ClipboardCheck className="size-4" />
              Apply suggestions
            </button>
            <button
              type="button"
              onClick={saveSelected}
              disabled={saving || selectedRows.length === 0}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-inverse px-4 text-sm font-medium text-on-inverse transition hover:bg-inverse-hover disabled:opacity-50"
            >
              <Save className="size-4" />
              {saving ? "Saving..." : "Save selected"}
            </button>
          </div>
        </div>
        {message ? <p className="mt-3 text-sm text-muted-2">{message}</p> : null}
      </div>

      <div className="space-y-3">
        {items.map((row) => (
          <article
            key={row.id}
            className="rounded-2xl border border-border-base bg-surface p-4"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selected.has(row.id)}
                  onChange={() => toggle(row.id)}
                  className="mt-1 size-4"
                />
                <span>
                  <span className="block text-lg font-semibold">
                    {row.displayName}
                  </span>
                  <span className="font-mono text-xs text-muted-3">
                    /pets/{row.slug}
                  </span>
                </span>
              </label>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    row.score >= 90
                      ? "bg-chip-success-bg text-chip-success-fg"
                      : row.score >= 70
                        ? "bg-chip-warning-bg text-chip-warning-fg"
                        : "bg-chip-danger-bg text-chip-danger-fg"
                  }`}
                >
                  Score {row.score}
                </span>
                <button
                  type="button"
                  onClick={() => applySuggestion(row.id)}
                  className="rounded-full border border-border-base px-3 py-1 text-xs font-medium transition hover:border-border-strong"
                >
                  Use suggestion
                </button>
              </div>
            </div>

            {row.issues.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {row.issues.map((issue) => (
                  <span
                    key={`${row.id}-${issue.code}`}
                    className="rounded-full bg-background px-3 py-1 text-xs text-muted-2"
                  >
                    {issue.severity}: {issue.message}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              <Field
                label={`SEO title - ${row.seoTitle.length}/68`}
                value={row.seoTitle}
                onChange={(seoTitle) => patchRow(row.id, { seoTitle })}
              />
              <Field
                label={`SEO description - ${row.seoDescription.length}/158`}
                value={row.seoDescription}
                onChange={(seoDescription) =>
                  patchRow(row.id, { seoDescription })
                }
              />
              <Field
                label="Keywords"
                value={row.seoKeywords}
                onChange={(seoKeywords) => patchRow(row.id, { seoKeywords })}
              />
              <Field
                label={`Intro - ${row.seoIntro.length}/700`}
                value={row.seoIntro}
                rows={4}
                onChange={(seoIntro) => patchRow(row.id, { seoIntro })}
              />
              <div className="lg:col-span-2">
                <Field
                  label="FAQ JSON"
                  value={row.seoFaq}
                  rows={5}
                  onChange={(seoFaq) => patchRow(row.id, { seoFaq })}
                />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  rows = 2,
  onChange,
}: {
  label: string;
  value: string;
  rows?: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-2">{label}</span>
      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full resize-y rounded-xl border border-border-base bg-background px-3 py-2 text-sm leading-6 outline-none transition focus:border-border-strong"
      />
    </label>
  );
}
