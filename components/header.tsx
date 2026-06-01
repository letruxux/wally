import Link from "next/link";
import { SearchAutocomplete } from "@/components/search-autocomplete";
import { getPackagesSortedByDate } from "@/lib/registry";

export function Header() {
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="mr-2 shrink-0 text-xl font-bold">
          Wally
        </Link>

        <SearchAutocomplete packages={getPackagesSortedByDate()} />

        <div className="flex items-center gap-2">
          <a
            href="https://wally.run"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Wally"
          >
            <img
              className="h-5 w-5 grayscale hover:grayscale-0 transition-all"
              src="https://wally.run/favicon.ico"
              alt="wally.run"
            />
          </a>
        </div>
      </div>
    </header>
  );
}
