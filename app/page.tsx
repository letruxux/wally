import { PackageCard } from "@/components/package-card";
import { fetchPackage, getLatestVersion, parsePackageName } from "@/lib/wally";
import { getPackageDate, getPackagesSortedByDate } from "@/lib/registry";
import { formatDate } from "@/lib/utils";

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
      const pkgDate = getPackageDate(latest.package.name);
      const dateString = pkgDate ? ` | last updated: ${formatDate(pkgDate)}` : "";
      return {
        pkg: latest.package,
        version: latest.package.version + dateString,
      };
    })
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      <section className="pb-20">
        <h2 className="my-6 text-2xl font-semibold">Recent Packages</h2>
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
