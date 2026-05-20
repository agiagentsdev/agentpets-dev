import {
  generateSeoAgentMetadata,
  SeoAgentPage,
} from "@/components/seo-agent-page";

const slug = "codex-pets" as const;

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
