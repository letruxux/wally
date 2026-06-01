import registry from "@/data/registry.json"

interface PackageEntry {
  name: string
  date: string
}

const r = registry as Record<string, string>

export function getPackageNames(): string[] {
  return Object.keys(r)
}

export function getPackageDate(name: string): string | null {
  return r[name] ?? null
}

export function getPackagesSortedByDate(): PackageEntry[] {
  return Object.entries(r)
    .map(([name, date]) => ({ name, date }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
