import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PackageCard } from "@/components/package-card";
import { fetchPackage, getLatestVersion, parsePackageName } from "@/lib/wally";
import { getPackagesSortedByDate } from "@/lib/registry";

const RECENT_COUNT = 12;

export default async function Home() {
  const recent = getPackagesSortedByDate().slice(0, RECENT_COUNT);

  const results = await Promise.allSettled(
    recent.map(({ name }) => {
      const { scope, name: pkg } = parsePackageName(name);
      return fetchPackage(scope, pkg);
    }),
  );

  const packages = results
    .map((r) => {
      if (r.status === "rejected" || !r.value) return null;
      const latest = getLatestVersion(r.value);
      return { pkg: latest.package, version: latest.package.version };
    })
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      <section className="py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">xWally</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          wally.run but modern or something
        </p>
      </section>

      <section className="pb-20">
        <h2 className="mb-6 text-2xl font-semibold">Recent Packages</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map(
            (item) =>
              item && (
                <PackageCard
                  key={item.pkg.name}
                  pkg={{ name: item.pkg.name, description: item.pkg.description ?? "" }}
                  version={item.version}
                  isDep={false}
                />
              ),
          )}
        </div>
      </section>
    </div>
  );
}
