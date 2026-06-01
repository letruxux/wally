<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## What this is

A Next.js 16 App Router website — the registry browser for **Wally**, a Rust-based package manager for Roblox (by Uplift Games). Data is fetched at build/request time from the raw GitHub-hosted `UpliftGames/wally-index` index (NDJSON format, 3600s revalidation).

## Commands

| Action           | Command             |
| ---------------- | ------------------- |
| dev server       | `bun dev`           |
| production build | `bun build`         |
| lint             | `bun lint`          |
| typecheck        | `bunx tsc --noEmit` |

Run **lint → typecheck → build** before committing.

## Stack quirks

- **Tailwind CSS v4** via `@tailwindcss/postcss` (not v3 config-based). CSS is in `app/globals.css` using `@import "tailwindcss"`, `@theme inline {}`, and `@custom-variant dark`. No `tailwind.config.*`.
- **shadcn/ui** with style `radix-maia` — components in `components/ui/` generated via `bunx shadcn`. Icon library is **hugeicons** (not lucide).
- **Base UI** (`@base-ui-ui/react`) is used alongside Radix — be careful not to mix their component APIs.
- **Font**: Outfit via `next/font/google`, exposed as `--font-sans` CSS var.
- **Path alias**: `@/*` maps to root (e.g. `@/lib/utils`, `@/components/ui/button`).
- **No env files or secrets** needed — data source is a public GitHub raw URL.

## Page routes

| Route                     | File                                  | Notes                                |
| ------------------------- | ------------------------------------- | ------------------------------------ |
| `/`                       | `app/page.tsx`                        | Home — fetches popular packages      |
| `/package/[scope]/[name]` | `app/package/[scope]/[name]/page.tsx` | Package detail, deps, versions       |
| `/install`                | `app/install/page.tsx`                | Installation instructions            |
| `/policies`               | `app/policies/page.tsx`               | Registry policies (static)           |

Params are `Promise`-based — use `const { scope, name } = await params`.
Search params are also `Promise`-based — use `const { q } = await searchParams`.

## Data layer

Core logic is in `lib/wally.ts`:

- `fetchPackage(scope, name)` → fetches NDJSON from `https://raw.githubusercontent.com/UpliftGames/wally-index/main/{scope}/{name}`, revalidates every 3600s
- `getLatestVersion(versions)` → semver-string comparison
- `POPULAR_PACKAGES` — hardcoded list for the home page
- `PACKAGE_DESCRIPTIONS` — hardcoded fallback descriptions

## No tests

No test framework is configured. Add one if needed.
