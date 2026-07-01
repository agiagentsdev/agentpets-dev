import path from "node:path";

import type { NextConfig } from "next";

import createNextIntlPlugin from "next-intl/plugin";

const IS_MOCK = process.env.PETDEX_MOCK === "1";
const IS_MOCK_AUTH = IS_MOCK || process.env.PETDEX_MOCK_AUTH === "1";
const IS_AUTH_DISABLED =
  process.env.AGENTPETS_AUTH_DISABLED === "1" ||
  process.env.NEXT_PUBLIC_AGENTPETS_AUTH_DISABLED === "1";

const DEFAULT_R2_PUBLIC_HOST = "pub-94495283df974cfea5e98d6a9e3fa462.r2.dev";

function r2PublicHost(): string {
  if (!process.env.R2_PUBLIC_BASE) return DEFAULT_R2_PUBLIC_HOST;
  try {
    return new URL(process.env.R2_PUBLIC_BASE).hostname;
  } catch {
    return DEFAULT_R2_PUBLIC_HOST;
  }
}

// Content-Security-Policy. Blocks inline <script> sources we didn't ship,
// caps img / connect / frame ancestors. The `unsafe-inline` allowance for
// styles is required by Next/Tailwind during hydration; for scripts we
// keep 'unsafe-inline' as well because Next embeds RSC payloads inline,
// but with our same-origin CSRF guard + JSON-LD escape this is acceptable.
//
// Hosts allowed:
// - self for everything we render
// - clerk.agentpets.dev + *.clerk.com / *.clerk.accounts.dev for the
//   Clerk client SDK. Legacy petdex.crafter.run Clerk hosts stay allowed
//   until every production Clerk URL is migrated.
// - vercel-scripts / vitals for Vercel analytics
// - R2 public bucket + UploadThing host + Clerk image hosts + social
//   avatar hosts for sprites and avatars
const clerkFrameSources = IS_AUTH_DISABLED
  ? "https://challenges.cloudflare.com"
  : "https://challenges.cloudflare.com https://clerk.agentpets.dev https://accounts.agentpets.dev https://*.clerk.com https://*.clerk.accounts.dev https://accounts.petdex.crafter.run https://clerk.petdex.crafter.run";

const clerkScriptSources = IS_AUTH_DISABLED
  ? "https://challenges.cloudflare.com"
  : "https://clerk.agentpets.dev https://accounts.agentpets.dev https://clerk.petdex.crafter.run https://accounts.petdex.crafter.run https://*.clerk.com https://*.clerk.accounts.dev https://challenges.cloudflare.com";

const clerkConnectSources = IS_AUTH_DISABLED
  ? "https://challenges.cloudflare.com"
  : "https://clerk.agentpets.dev https://accounts.agentpets.dev https://clerk.petdex.crafter.run https://accounts.petdex.crafter.run https://*.clerk.com https://*.clerk.accounts.dev https://api.clerk.com https://challenges.cloudflare.com";

const cspDirectives = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  // Clerk renders the sign-up CAPTCHA inside an iframe served from
  // challenges.cloudflare.com (Turnstile). Without it on frame-src and
  // its bootstrap script on script-src, the CAPTCHA fails to load and
  // the user can't create an account.
  `frame-src 'self' ${clerkFrameSources}`,
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${clerkScriptSources} https://va.vercel-scripts.com https://vercel.live`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://pub-94495283df974cfea5e98d6a9e3fa462.r2.dev https://yu2vz9gndp.ufs.sh https://img.clerk.com https://images.clerk.dev https://avatars.githubusercontent.com https://pbs.twimg.com https://storage.googleapis.com",
  "media-src 'self' https://pub-94495283df974cfea5e98d6a9e3fa462.r2.dev",
  "font-src 'self' data:",
  // R2 reads via pub-*.r2.dev, R2 PUT uploads via the account-specific
  // S3 endpoint (*.r2.cloudflarestorage.com). Both must be on the
  // connect-src allowlist or browser fetch / XHR fail with a generic
  // network error (root cause of issues #22-#80+).
  `connect-src 'self' ${clerkConnectSources} https://api.github.com https://pub-94495283df974cfea5e98d6a9e3fa462.r2.dev https://*.r2.cloudflarestorage.com https://yu2vz9gndp.ufs.sh https://utfs.io https://va.vercel-scripts.com https://vitals.vercel-insights.com`,
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const embedCspDirectives = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'none'",
  "frame-ancestors *",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://pub-94495283df974cfea5e98d6a9e3fa462.r2.dev https://yu2vz9gndp.ufs.sh https://storage.googleapis.com",
  "font-src 'self' data:",
  "connect-src 'self'",
].join("; ");

const securityHeaders = [
  // 2 years HSTS + subdomains. preload-ready when we want to submit to
  // hstspreload.org.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
  // Block clickjacking. Modern frame-ancestors lives in CSP but we keep
  // the legacy header for older browsers.
  { key: "X-Frame-Options", value: "DENY" },
  // Stop MIME sniffing — a pet.json that's secretly HTML won't be
  // executed as HTML by the browser.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Conservative referrer to avoid leaking pet detail URLs to ad nets.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Lock down powerful APIs. We don't use any of these.
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
  },
  // CSP — see directives above.
  { key: "Content-Security-Policy", value: cspDirectives },
  // Cross-origin protections.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const embedSecurityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Content-Security-Policy", value: embedCspDirectives },
];

const mockRoot = path.resolve(__dirname, "src/lib/mock");
const disabledAuthRoot = path.resolve(__dirname, "src/lib/auth-disabled");

const nextConfig: NextConfig = {
  // Hide the framework banner on every response.
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: DEFAULT_R2_PUBLIC_HOST },
      { protocol: "https", hostname: r2PublicHost() },
      { protocol: "https", hostname: "yu2vz9gndp.ufs.sh" },
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "images.clerk.dev" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "pbs.twimg.com" },
      { protocol: "https", hostname: "storage.googleapis.com" },
    ],
  },
  // Server-only modules that don't survive Turbopack/webpack bundling:
  // - @electric-sql/pglite (mock mode) — native wasm + workers
  // - ali-oss — uses urllib's dynamic require('proxy-agent') for an
  //   optional dependency that the bundler can't resolve and treats
  //   as fatal. Marking ali-oss external lets the server runtime do
  //   the require() lazily, where the missing optional is harmless.
  serverExternalPackages: [
    "ali-oss",
    ...(IS_MOCK ? ["@electric-sql/pglite"] : []),
  ],
  async headers() {
    return [
      {
        source: "/embed/:path*",
        headers: embedSecurityHeaders,
      },
      {
        source: "/((?!embed(?:/|$)).*)",
        headers: securityHeaders,
      },
    ];
  },
  // In mock/disabled auth modes, redirect every Clerk import to in-process
  // shims so builds and public pages never contact Clerk. Disabled auth wins
  // over mock auth because production outage mitigation should be explicit.
  ...(IS_AUTH_DISABLED || IS_MOCK_AUTH
    ? {
        turbopack: {
          // Turbopack expects relative paths (with leading "./") rooted at
          // the project. Absolute paths get re-resolved as file paths
          // under cwd and 404. See nextjs/issues/turbopack-aliases.
          resolveAlias: {
            "@clerk/nextjs/server": IS_AUTH_DISABLED
              ? "./src/lib/auth-disabled/clerk-server.ts"
              : "./src/lib/mock/clerk-server.ts",
            "@clerk/nextjs": IS_AUTH_DISABLED
              ? "./src/lib/auth-disabled/clerk-client.tsx"
              : "./src/lib/mock/clerk-client.tsx",
          },
        },
        webpack: (config: { resolve?: { alias?: Record<string, string> } }) => {
          config.resolve = config.resolve ?? {};
          const aliasRoot = IS_AUTH_DISABLED ? disabledAuthRoot : mockRoot;
          config.resolve.alias = {
            ...(config.resolve.alias ?? {}),
            "@clerk/nextjs/server$": path.join(aliasRoot, "clerk-server.ts"),
            "@clerk/nextjs$": path.join(aliasRoot, "clerk-client.tsx"),
          };
          return config;
        },
      }
    : {}),
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
