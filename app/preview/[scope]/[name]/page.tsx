import { notFound } from "next/navigation";
import { fetchPackage, getLatestVersion } from "@/lib/wally";
import { PreviewClient } from "./preview-client";
import type { Metadata } from "next";

interface PageMetadata {
  params: Promise<{ scope: string; name: string }>;
  searchParams: Promise<{ v?: string }>;
}

export async function generateMetadata({ params }: PageMetadata): Promise<Metadata> {
  const p = await params;
  return {
    title: `Preview: ${p.scope}/${p.name} - Wally`,
  };
}

export default async function PreviewPage({ params, searchParams }: PageMetadata) {
  const { scope, name } = await params;
  const { v } = await searchParams;

  const versions = await fetchPackage(scope, name);
  if (!versions) notFound();

  const latest = getLatestVersion(versions);
  const version = v ?? latest.package.version;

  return <PreviewClient scope={scope} name={name} version={version} />;
}
