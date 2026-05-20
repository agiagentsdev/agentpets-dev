import type { Metadata } from "next";

import "./globals.css";

const SITE_URL = "https://agentpets.dev";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "AgentPets",
  authors: [{ name: "AgentPets", url: "https://agentpets.dev" }],
  creator: "AgentPets",
  publisher: "AgentPets",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The locale layout owns html/body so Next 16 can set lang from [locale];
  // providers and widgets live there to stay inside the document and receive locale context.
  return children;
}
