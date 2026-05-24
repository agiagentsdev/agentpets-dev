"use client";

import { useEffect } from "react";

type Props = {
  slug: string;
};

export function PetPageAnalytics({ slug }: Props) {
  useEffect(() => {
    const path = `${window.location.pathname}${window.location.search}`;
    const searchParams = new URLSearchParams(window.location.search);
    const source =
      searchParams.get("ref") === "badge"
        ? "badge"
        : searchParams.get("utm_medium") === "badge"
          ? "readme_badge"
          : searchParams.get("utm_source");

    const body = JSON.stringify({
      event: "pet_page_view",
      petSlug: slug,
      path,
      source,
      referrer: document.referrer || null,
    });

    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/analytics/event", blob);
      return;
    }

    void fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  }, [slug]);

  return null;
}
