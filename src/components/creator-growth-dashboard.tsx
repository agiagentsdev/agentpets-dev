import Link from "next/link";

import { BadgeCheck, Download, Heart, Share2, TerminalSquare } from "lucide-react";

import { siteConfig } from "@/lib/site-config";

type DashboardPet = {
  slug: string;
  displayName: string;
  installs: number;
  likes: number;
  downloads: number;
};

type Props = {
  handle: string;
  pets: DashboardPet[];
};

export function CreatorGrowthDashboard({ handle, pets }: Props) {
  const totals = pets.reduce(
    (acc, pet) => ({
      installs: acc.installs + pet.installs,
      likes: acc.likes + pet.likes,
      downloads: acc.downloads + pet.downloads,
    }),
    { installs: 0, likes: 0, downloads: 0 },
  );
  const topPets = [...pets]
    .sort(
      (a, b) =>
        b.installs + b.likes * 2 + b.downloads - (a.installs + a.likes * 2 + a.downloads),
    )
    .slice(0, 5);
  const featured = topPets[0] ?? pets[0] ?? null;

  return (
    <section className="rounded-3xl border border-border-base bg-surface p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-mono text-xs tracking-[0.22em] text-brand uppercase">
            Creator dashboard
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
            Analytics and share assets for @{handle}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-2">
            Track portfolio-level installs, likes, downloads, and the pets most
            worth promoting in READMEs, docs, launch posts, and community bios.
          </p>
        </div>
        <Link
          href="/developers"
          className="inline-flex h-10 items-center justify-center rounded-full border border-border-base px-4 text-sm font-medium transition hover:border-border-strong"
        >
          API docs
        </Link>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <Metric icon={<TerminalSquare />} label="Installs" value={totals.installs} />
        <Metric icon={<Heart />} label="Likes" value={totals.likes} />
        <Metric icon={<Download />} label="Downloads" value={totals.downloads} />
        <Metric icon={<BadgeCheck />} label="Approved pets" value={pets.length} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-border-base bg-background/70 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-3">
            Top pets to promote
          </h3>
          {topPets.length === 0 ? (
            <p className="mt-3 text-sm text-muted-2">
              Approved pets will appear here once metrics start coming in.
            </p>
          ) : (
            <div className="mt-3 divide-y divide-border-base">
              {topPets.map((pet) => (
                <Link
                  key={pet.slug}
                  href={`/pets/${pet.slug}`}
                  className="grid gap-2 py-3 text-sm transition hover:text-brand md:grid-cols-[1fr_auto]"
                >
                  <span>
                    <span className="block font-medium">{pet.displayName}</span>
                    <span className="font-mono text-[11px] text-muted-3">
                      /pets/{pet.slug}
                    </span>
                  </span>
                  <span className="font-mono text-[11px] text-muted-3">
                    {pet.installs} installs / {pet.likes} likes / {pet.downloads} downloads
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border-base bg-background/70 p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-muted-3">
            <Share2 className="size-4" />
            Share playbook
          </h3>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-2">
            <li>Pin your strongest pet to the top of your profile.</li>
            <li>Add its badge to GitHub READMEs and docs sidebars.</li>
            <li>Embed the pet card on launch pages and portfolio pages.</li>
            <li>Link your creator profile from social bios.</li>
          </ul>
          {featured ? (
            <pre className="mt-4 overflow-x-auto rounded-xl border border-border-base bg-surface p-3 text-xs leading-5 text-muted-2">
              <code>{`[![AgentPets: ${featured.displayName}](${siteConfig.url}/api/v1/badge/${featured.slug})](${siteConfig.url}/u/${handle})`}</code>
            </pre>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-border-base bg-background/70 p-4">
      <div className="flex items-center gap-2 text-muted-3 [&>svg]:size-4">
        {icon}
        <span className="font-mono text-[10px] tracking-[0.16em] uppercase">
          {label}
        </span>
      </div>
      <p className="mt-2 text-2xl font-semibold">{value.toLocaleString("en-US")}</p>
    </div>
  );
}
