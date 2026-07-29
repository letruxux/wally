const REGISTRYJSON_URL =
  "https://raw.githubusercontent.com/letruxux/wally-registry-dates/refs/heads/master/data/registry.json";

interface PackageEntry {
  name: string;
  date: string;
}

const registryPromise: Promise<Record<string, string>> = fetch(REGISTRYJSON_URL).then(
  (res) => res.json(),
);

export async function getPackageNames(): Promise<string[]> {
  return Object.keys(await registryPromise);
}

export async function getPackageDate(name: string): Promise<string | null> {
  return (await registryPromise)[name] ?? null;
}

export async function getPackagesSortedByDate(): Promise<PackageEntry[]> {
  return Object.entries(await registryPromise)
    .map(([name, date]) => ({ name, date }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
