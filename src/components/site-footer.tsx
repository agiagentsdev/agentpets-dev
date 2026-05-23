import Link from "next/link";

import { useTranslations } from "next-intl";

import { DiscordLink } from "@/components/discord-link";
import { SponsorButton } from "@/components/sponsor-button";
import { siteConfig } from "@/lib/site-config";

const agentSeoLinks = [
  { href: "/best/codex-pets", label: "Best Codex pets" },
  { href: "/codex-pets", label: "Codex" },
  { href: "/claude-code-pets", label: "Claude Code" },
  { href: "/cursor-pets", label: "Cursor" },
  { href: "/gemini-cli-pets", label: "Gemini CLI" },
  { href: "/github-copilot-pets", label: "Copilot" },
  { href: "/google-antigravity-pets", label: "Antigravity" },
];

export function SiteFooter() {
  const t = useTranslations("footer");

  return (
    <footer className="mx-auto w-full max-w-[1440px] px-5 py-10 md:px-8">
      <div className="flex flex-col items-start justify-between gap-3 border-t border-border-base pt-6 text-xs text-muted-3 md:flex-row md:items-center">
        <p>{t("rightsNotice")}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {agentSeoLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="underline underline-offset-4 transition hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/developers"
            className="underline underline-offset-4 transition hover:text-foreground"
          >
            {t("developers")}
          </Link>
          <Link
            href="/topics"
            className="underline underline-offset-4 transition hover:text-foreground"
          >
            {t("topics")}
          </Link>
          <Link
            href="/guides"
            className="underline underline-offset-4 transition hover:text-foreground"
          >
            {t("guides")}
          </Link>
          <Link
            href="/leaderboard"
            className="underline underline-offset-4 transition hover:text-foreground"
          >
            {t("topCreators")}
          </Link>
          <Link
            href="/legal/takedown"
            className="underline underline-offset-4 transition hover:text-foreground"
          >
            {t("takedown")}
          </Link>
          <Link
            href="/advertise"
            className="underline underline-offset-4 transition hover:text-foreground"
          >
            {t("advertise")}
          </Link>
          <Link
            href="/brand"
            className="underline underline-offset-4 transition hover:text-foreground"
          >
            {t("brand")}
          </Link>
          <a
            href={siteConfig.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4 transition hover:text-foreground"
          >
            {t("github")}
          </a>
          {process.env.NEXT_PUBLIC_DISCORD_INVITE_URL ? (
            <DiscordLink
              href={process.env.NEXT_PUBLIC_DISCORD_INVITE_URL}
              source="footer"
              className="underline underline-offset-4 transition hover:text-foreground"
            >
              {t("discord")}
            </DiscordLink>
          ) : null}
          <SponsorButton variant="inline" />
        </div>
      </div>
    </footer>
  );
}
