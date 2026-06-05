import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { InstallCard } from "@/components/install-card";
import {
  fetchPackage,
  getLatestVersion,
  getVersionDate,
  parseDepVersionRequirements,
} from "@/lib/wally";
import { getPackageDate } from "@/lib/registry";
import { PackageCard } from "@/components/package-card";
import {
  ArrowRight,
  ComputerIcon,
  GithubIcon,
  LicenseIcon,
  PackageIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { formatDate, toTitleCase } from "@/lib/utils";
import type { Metadata } from "next";
import { getProjectInfo } from "@/lib/custom-data";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ReadmeViewer } from "@/components/readme-viewer";
import { getLicenseUrl } from "@/lib/licenses";

interface PageMetadata {
  params: Promise<{ scope: string; name: string }>;
  searchParams: Promise<{ v?: string }>;
}

export async function generateMetadata({ params }: PageMetadata): Promise<Metadata> {
  const p = await params;
  const name = `${p.scope}/${p.name}`;

  return {
    title: `${name} - Wally`,
  };
}

export default async function PackagePage({ params, searchParams }: PageMetadata) {
  const { scope, name } = await params;
  const { v: version } = await searchParams;
  const versions = await fetchPackage(scope, name);

  if (!versions) {
    notFound();
  }

  const latest = getLatestVersion(versions);
  const currentVersion = version
    ? (versions.find((ver) => ver.package.version === version) ?? latest)
    : latest;
  const { package: pkg } = currentVersion;
  const packageName = `${scope}/${name}`;
  const lastUpdated = version
    ? await getVersionDate(scope, name, version)
    : getPackageDate(packageName);
  const projectInfo = getProjectInfo(packageName);

  const deps = Object.entries(currentVersion.dependencies);
  const serverDeps = Object.entries(currentVersion["server-dependencies"] ?? {});
  const devDeps = Object.entries(currentVersion["dev-dependencies"] ?? {});

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-mono">{pkg.name}</h1>
          {pkg.description && (
            <p className="mt-2 text-lg text-muted-foreground">{pkg.description}</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 mb-4">
        <Badge variant="secondary" asChild>
          <Link href={`/package/${scope}/${name}`}>v{pkg.version}</Link>
        </Badge>
        {pkg.license && (
          <a href={getLicenseUrl(pkg.license)} target="_blank" rel="noreferrer">
            <Badge variant="outline">
              <HugeiconsIcon icon={LicenseIcon} /> {pkg.license}
            </Badge>
          </a>
        )}
        <Badge variant="outline">
          <HugeiconsIcon icon={ComputerIcon} /> {toTitleCase(pkg.realm)}
        </Badge>
        {projectInfo?.deprecated && (
          <Badge variant="destructive">
            <HugeiconsIcon icon={PackageIcon} /> Deprecated
          </Badge>
        )}
        {projectInfo?.github_link && (
          <a href={projectInfo.github_link} target="_blank" rel="noreferrer">
            <Badge variant="link" className="text-white">
              <HugeiconsIcon icon={GithubIcon} /> View on GitHub
            </Badge>
          </a>
        )}
        {lastUpdated && (
          <span className="ml-auto text-xs text-muted-foreground">
            Released: {formatDate(lastUpdated)}
          </span>
        )}
      </div>

      {projectInfo?.deprecation_message && (
        <Card className="bg-red-600/15 mb-4 gap-y-2">
          <CardContent>
            <HugeiconsIcon icon={PackageIcon} className="mr-2 inline-block" />
            {projectInfo.deprecation_message}
          </CardContent>
          <CardFooter className="text-xs flex items-center">
            <HugeiconsIcon icon={ArrowRight} className="mr-2 inline-block" size={16} />
            Recommended alternative:
            <a
              href={`/package/${projectInfo.recommended_alternative}`}
              className="hover:underline text-blue-400"
            >
              <code className="ml-1 px-2 py-1 rounded-lg border bg-muted/30">
                {projectInfo.recommended_alternative}
              </code>
            </a>
          </CardFooter>
        </Card>
      )}

      <section>
        <h2 className="text-xl font-semibold mb-4">Install</h2>
        <InstallCard scope={scope} name={name} version={pkg.version} />
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">Versions</h2>
        <div className="mt-3 space-y-1">
          {versions
            .slice()
            .reverse()
            .map((v) => (
              <div key={v.package.version} className="gap-3 text-sm inline">
                <Badge
                  variant={v.package.version === pkg.version ? "default" : "secondary"}
                  className="font-mono mr-1"
                  asChild
                >
                  <Link href={`?v=${v.package.version}`}>{v.package.version}</Link>
                </Badge>
              </div>
            ))}
        </div>
      </section>

      <section className="mt-6">
        <ReadmeViewer scope={scope} name={name} version={pkg.version} readmeOverrideUrl={projectInfo?.readmeOverrideUrl ?? undefined} />
      </section>

      <div className="mt-6 space-y-4">
        {[
          {
            title: "Dependencies",
            deps: deps,
          },
          {
            title: "Server Dependencies",
            deps: serverDeps,
          },
          {
            title: "Dev Dependencies",
            deps: devDeps,
          },
        ]
          .filter((e) => e.deps.length > 0)
          .map(({ title, deps }) => (
            <section key={title}>
              <h2 className="text-xl font-semibold">{title}</h2>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {deps.map(([depName, depVersion]) => {
                  const { ver, name } = parseDepVersionRequirements(depVersion);
                  return (
                    <PackageCard
                      key={depName}
                      pkg={{ name }}
                      isDep={true}
                      version={ver ?? "version not specified"}
                    />
                  );
                })}
              </div>
            </section>
          ))}
      </div>
    </div>
  );
}
