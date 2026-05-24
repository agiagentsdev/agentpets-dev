import Link from "next/link";

import {
  BadgePercent,
  Eye,
  MousePointerClick,
  Share2,
  Users,
} from "lucide-react";

import { getProductAnalyticsSummary } from "@/lib/product-analytics";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Product analytics | AgentPets admin",
  robots: { index: false, follow: false },
};

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const params = await searchParams;
  const days = clampDays(params.days);
  const summary = await getProductAnalyticsSummary(days);

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 pb-16 md:px-8">
      <header>
        <p className="font-mono text-xs tracking-[0.22em] text-brand uppercase">
          Product analytics
        </p>
        <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          SEO and creator growth signals
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-2">
          Internal dashboard for pet pageviews, public badge impressions, and
          badge-referred clicks. Use it to decide which pets deserve better SEO
          copy, feature slots, hub links, or creator outreach.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {[7, 30, 90].map((option) => (
          <Link
            key={option}
            href={`/admin/analytics?days=${option}`}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${
              option === summary.days
                ? "border-brand bg-brand-tint text-brand"
                : "border-border-base text-muted-2 hover:border-border-strong hover:text-foreground"
            }`}
          >
            {option} days
          </Link>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          icon={<Eye />}
          label="Pet pageviews"
          value={summary.totals.petPageViews}
        />
        <StatCard
          icon={<Users />}
          label="Unique visitors"
          value={summary.totals.uniqueVisitors}
        />
        <StatCard
          icon={<Share2 />}
          label="Badge impressions"
          value={summary.totals.badgeImpressions}
        />
        <StatCard
          icon={<MousePointerClick />}
          label="Badge clicks"
          value={summary.totals.badgeClicks}
        />
        <StatCard
          icon={<BadgePercent />}
          label="Badge CTR"
          value={`${summary.totals.badgeCtr.toFixed(1)}%`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">
            Top pets by tracked demand
          </CardTitle>
          <CardDescription>
            Pageviews are from pet pages. Badge impressions are SVG endpoint
            loads that reach origin. Badge clicks are pet pageviews carrying
            <code className="mx-1 rounded bg-surface px-1">ref=badge</code> or a
            GitHub referrer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {summary.topPets.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border-base bg-surface/60 p-8 text-center text-sm text-muted-2">
              No product analytics events yet. Visit a pet page or load a badge
              after deploy, then this table will populate.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-border-base text-xs text-muted-3 uppercase">
                  <tr>
                    <th className="py-2 pr-3 font-medium">Pet</th>
                    <th className="px-3 py-2 font-medium">Pageviews</th>
                    <th className="px-3 py-2 font-medium">Badge views</th>
                    <th className="px-3 py-2 font-medium">Badge clicks</th>
                    <th className="px-3 py-2 font-medium">CTR</th>
                    <th className="px-3 py-2 font-medium">Installs</th>
                    <th className="px-3 py-2 font-medium">Likes</th>
                    <th className="py-2 pl-3 font-medium">Downloads</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-base">
                  {summary.topPets.map((pet) => (
                    <tr key={pet.slug}>
                      <td className="py-3 pr-3">
                        <Link
                          href={`/pets/${pet.slug}`}
                          className="font-medium text-foreground transition hover:text-brand"
                        >
                          {pet.displayName}
                        </Link>
                        <span className="block font-mono text-[11px] text-muted-3">
                          /pets/{pet.slug}
                        </span>
                      </td>
                      <MetricCell value={pet.pageViews} />
                      <MetricCell value={pet.badgeImpressions} />
                      <MetricCell value={pet.badgeClicks} />
                      <td className="px-3 py-3 font-mono text-muted-2">
                        {pet.badgeCtr.toFixed(1)}%
                      </td>
                      <MetricCell value={pet.installs} />
                      <MetricCell value={pet.likes} />
                      <td className="py-3 pl-3 font-mono text-muted-2">
                        {pet.downloads.toLocaleString("en-US")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">Referrer hosts</CardTitle>
          <CardDescription>
            Use this to spot README traffic, social launches, docs links, and
            partner sites sending discovery traffic into pet pages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {summary.referrers.length === 0 ? (
            <p className="text-sm text-muted-3">No referrer data yet.</p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {summary.referrers.map((referrer) => (
                <li
                  key={referrer.host}
                  className="flex items-center justify-between rounded-2xl border border-border-base bg-background/60 px-3 py-2"
                >
                  <span className="truncate text-sm text-foreground">
                    {referrer.host}
                  </span>
                  <span className="font-mono text-xs text-muted-3">
                    {referrer.views.toLocaleString("en-US")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <p className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.16em] text-muted-3 uppercase [&>svg]:size-3.5">
          {icon}
          {label}
        </p>
        <CardTitle className="font-mono text-2xl tracking-tight">
          {typeof value === "number" ? value.toLocaleString("en-US") : value}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}

function MetricCell({ value }: { value: number }) {
  return (
    <td className="px-3 py-3 font-mono text-muted-2">
      {value.toLocaleString("en-US")}
    </td>
  );
}

function clampDays(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "30", 10);
  if (!Number.isFinite(parsed)) return 30;
  return Math.max(1, Math.min(180, parsed));
}
