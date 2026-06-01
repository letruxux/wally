import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t py-6">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6">
        <p className="text-sm text-muted-foreground">
          Wally by{" "}
          <a
            href="https://uplift.games"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            Uplift Games
          </a>
          , website by{" "}
          <a
            href="https://ltrx.lol"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            letruxux
          </a>
        </p>
        <div className="flex items-center gap-4 text-sm">
          <Link
            href="https://wally.run"
            className="text-muted-foreground hover:text-foreground transition-colors hover:underline"
          >
            wally.run
          </Link>
        </div>
      </div>
    </footer>
  );
}
