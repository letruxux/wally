import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { InstallCard } from "@/components/install-card";
import { fetchPackage, getLatestVersion, parseDepVersionRequirements } from "@/lib/wally";
import { getPackageDate } from "@/lib/registry";
import { PackageCard } from "@/components/package-card";
import { ComputerIcon, LicenseIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toTitleCase } from "@/lib/utils";

export default async function PackagePage({
  params,
}: {
  params: Promise<{ scope: string; name: string }>;
}) {
  const { scope, name } = await params;
  const versions = await fetchPackage(scope, name);

  if (!versions) {
    notFound();
  }

  const latest = getLatestVersion(versions);
  const { package: pkg } = latest;
  const packageName = `${scope}/${name}`;
  const lastUpdated = getPackageDate(packageName);

  const deps = Object.entries(latest.dependencies);
  const serverDeps = Object.entries(latest["server-dependencies"] ?? {});
  const devDeps = Object.entries(latest["dev-dependencies"] ?? {});

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

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
        <Badge variant="secondary">v{pkg.version}</Badge>
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
            Last updated: {formatDate(lastUpdated)}
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
                  >
                    {v.package.version}
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

        {latest.place &&
          (latest.place["server-packages"] || latest.place["shared-packages"]) && (
            <section>
              <h2 className="text-xl font-semibold">Place Configuration</h2>
              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                {latest.place["shared-packages"] && (
                  <p>
                    <span className="font-medium text-foreground">Shared packages:</span>{" "}
                    {latest.place["shared-packages"]}
                  </p>
                )}
                {latest.place["server-packages"] && (
                  <p>
                    <span className="font-medium text-foreground">Server packages:</span>{" "}
                    {latest.place["server-packages"]}
                  </p>
                )}
              </div>
            </section>
          )}
      </div>
    </div>
  );
}
