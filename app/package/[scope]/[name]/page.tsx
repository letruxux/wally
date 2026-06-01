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
import { ComputerIcon, LicenseIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { formatDate, toTitleCase } from "@/lib/utils";

export default async function PackagePage({
  params,
  searchParams,
}: {
  params: Promise<{ scope: string; name: string }>;
  searchParams: Promise<{ v?: string }>;
}) {
  const { scope, name } = await params;
  const { v } = await searchParams;
  const versions = await fetchPackage(scope, name);

  if (!versions) {
    notFound();
  }

  const latest = getLatestVersion(versions);
  const currentVersion = v
    ? (versions.find((ver) => ver.package.version === v) ?? latest)
    : latest;
  console.log(v);
  const { package: pkg } = currentVersion;
  const packageName = `${scope}/${name}`;
  const lastUpdated = v
    ? await getVersionDate(scope, name, v)
    : getPackageDate(packageName);

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
          <Badge variant="outline">
            <HugeiconsIcon icon={LicenseIcon} /> {pkg.license}
          </Badge>
        )}
        <Badge variant="outline">
          <HugeiconsIcon icon={ComputerIcon} /> {toTitleCase(pkg.realm)}
        </Badge>
        {lastUpdated && (
          <span className="ml-auto text-xs text-muted-foreground">
            Released: {formatDate(lastUpdated)}
          </span>
        )}
      </div>

      <InstallCard scope={scope} name={name} version={pkg.version} />

      <div className="mt-4 space-y-8">
        <section>
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
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
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

        {currentVersion.place &&
          (currentVersion.place["server-packages"] ||
            currentVersion.place["shared-packages"]) && (
            <section>
              <h2 className="text-xl font-semibold">Place Configuration</h2>
              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                {currentVersion.place["shared-packages"] && (
                  <p>
                    <span className="font-medium text-foreground">Shared packages:</span>{" "}
                    {currentVersion.place["shared-packages"]}
                  </p>
                )}
                {currentVersion.place["server-packages"] && (
                  <p>
                    <span className="font-medium text-foreground">Server packages:</span>{" "}
                    {currentVersion.place["server-packages"]}
                  </p>
                )}
              </div>
            </section>
          )}
      </div>
    </div>
  );
}
