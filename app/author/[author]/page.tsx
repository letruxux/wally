import { searchPackagesByAuthor } from "@/lib/wally";
import { getDeveloperInfo } from "@/lib/custom-data";
import { PackageCard } from "@/components/package-card";
import { Badge } from "@/components/ui/badge";
import { GithubIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import { formatDate } from "@/lib/utils";

interface Props {
  params: Promise<{ author: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { author } = await params;
  return {
    title: `${author}'s packages - Wally`,
  };
}

export default async function AuthorPage({ params }: Props) {
  const { author } = await params;

  const [packages, developerInfo] = await Promise.all([
    searchPackagesByAuthor(author),
    Promise.resolve(getDeveloperInfo(author)),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="mb-4">
        <h1 className="text-3xl font-bold">{author}</h1>
        <div className="flex items-center gap-2 mt-2 empty:hidden">
          {developerInfo?.badges &&
            developerInfo.badges
              .split(",")
              .map((badge) => badge.trim())
              .filter(Boolean)
              .map((badge) => (
                <Badge key={badge} variant="outline">
                  {badge.charAt(0).toUpperCase() + badge.slice(1)}
                </Badge>
              ))}
          {developerInfo?.github_link && (
            <a href={developerInfo.github_link} target="_blank" rel="noreferrer">
              <Badge variant="link" className="text-white">
                <HugeiconsIcon icon={GithubIcon} /> @
                {developerInfo.github_link.split("/").pop()}
              </Badge>
            </a>
          )}
        </div>
        <p className="mt-2 text-muted-foreground">
          {packages.length} package{packages.length !== 1 ? "s" : ""} on the{" "}
          <code className="mr-1">wally.run</code>
          registry
        </p>
      </div>

      {packages.length === 0 ? (
        <p className="text-muted-foreground">No packages found for this author.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packages
            .sort((a, b) => {
              if (!a.date) return 1;
              if (!b.date) return -1;
              return new Date(b.date).getTime() - new Date(a.date).getTime();
            })
            .map((pkg) => {
              const pkgDate = pkg.date;
              const dateString = pkgDate ? ` | last updated: ${formatDate(pkgDate)}` : "";
              return (
                <PackageCard
                  key={`${pkg.scope}/${pkg.name}`}
                  pkg={{
                    name: `${pkg.scope}/${pkg.name}`,
                    description: pkg.description ?? "",
                  }}
                  version={pkg.version + dateString}
                />
              );
            })}
        </div>
      )}
    </div>
  );
}
