import {
  generateSeoAgentMetadata,
  SeoAgentPage,
} from "@/components/seo-agent-page";

const slug = "terminal-pets" as const;

export const dynamic = "force-dynamic";
export const revalidate = 86400;

export function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return generateSeoAgentMetadata(slug, params);
}

export default function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return <SeoAgentPage slug={slug} params={params} />;
}
