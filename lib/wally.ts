export interface WallyPackage {
  name: string;
  version: string;
  registry: string;
  realm: string;
  description: string | null;
  license: string | null;
  authors: string[];
  include?: string[];
  exclude?: string[];
  private?: boolean;
}

export interface WallyVersion {
  package: WallyPackage;
  place?: {
    "shared-packages": string | null;
    "server-packages": string | null;
  };
  dependencies: Record<string, string>;
  "server-dependencies": Record<string, string>;
  "dev-dependencies": Record<string, string>;
}

const RAW_BASE = "https://raw.githubusercontent.com/UpliftGames/wally-index/main";

function parseNdjson(text: string): WallyVersion[] {
  return text
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

export async function fetchPackage(
  scope: string,
  name: string,
): Promise<WallyVersion[] | null> {
  try {
    const res = await fetch(`${RAW_BASE}/${scope}/${name}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return parseNdjson(await res.text());
  } catch {
    return null;
  }
}

export function getLatestVersion(versions: WallyVersion[]): WallyVersion {
  return versions.reduce((latest, v) => {
    if (v.package.version > latest.package.version) return v;
    return latest;
  }, versions[0]);
}

export function parsePackageName(fullName: string): {
  scope: string;
  name: string;
} {
  const parts = fullName.split("/");
  return { scope: parts[0], name: parts.slice(1).join("/") };
}

export const POPULAR_PACKAGES = [
  { scope: "evaera", name: "cmdr" },
  { scope: "roblox", name: "roact" },
  { scope: "evaera", name: "promise" },
  { scope: "roblox", name: "testez" },
  { scope: "sleitnick", name: "knit" },
  { scope: "howmanysmall", name: "janitor" },
];

export const PACKAGE_DESCRIPTIONS: Record<string, string> = {
  "evaera/cmdr": "Extensible command console for Roblox developers",
  "roblox/roact": "A view management library for Roblox Lua similar to React",
  "evaera/promise": "Promise implementation for Roblox",
  "roblox/testez": "BDD-style test and assertion library for Roblox Lua",
  "sleitnick/knit": "Knit is a lightweight game framework",
  "howmanysmall/janitor": "Garbage collector object implementation for Roblox",
};

export function parseDepVersionRequirements(version: string) {
  const parts = version.split("@");
  const ver = parts.at(-1);
  const name = parts.slice(0, -1).join("@");
  return { ver, name };
}
