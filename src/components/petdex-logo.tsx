import Link from "next/link";

import { siteConfig } from "@/lib/site-config";

type PetdexLogoProps = {
  href?: string;
  showWordmark?: boolean;
  className?: string;
  markClassName?: string;
  ariaLabel?: string;
};

export function PetdexLogo({
  href,
  showWordmark = true,
  className = "",
  markClassName = "size-10",
  ariaLabel = `${siteConfig.name} home`,
}: PetdexLogoProps) {
  const content = (
    <>
      <PetdexMark className={markClassName} />
      {showWordmark ? (
        <span className="text-xl font-semibold tracking-normal">
          {siteConfig.name}
        </span>
      ) : null}
    </>
  );

  const classes = `inline-flex items-center gap-3 text-foreground ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} aria-label={ariaLabel}>
        {content}
      </Link>
    );
  }

  return <div className={classes}>{content}</div>;
}

function PetdexMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="agentpets-body"
          x1="8"
          y1="8"
          x2="56"
          y2="56"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#0ea5e9" />
          <stop offset="1" stopColor="#111827" />
        </linearGradient>
      </defs>

      <rect
        x="4"
        y="4"
        width="56"
        height="56"
        rx="14"
        fill="url(#agentpets-body)"
      />

      <g fill="#ffffff">
        <rect x="18" y="18" width="28" height="22" rx="4" />
        <rect x="14" y="24" width="5" height="10" />
        <rect x="45" y="24" width="5" height="10" />
        <rect x="23" y="25" width="5" height="5" fill="#111827" />
        <rect x="36" y="25" width="5" height="5" fill="#111827" />
        <rect x="27" y="34" width="10" height="3" fill="#111827" />
        <rect x="25" y="43" width="4" height="7" />
        <rect x="35" y="43" width="4" height="7" />
      </g>
    </svg>
  );
}
