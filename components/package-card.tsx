import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import type { WallyPackage } from "@/lib/wally";
import { PACKAGE_DESCRIPTIONS } from "@/lib/wally";
import { cn } from "@/lib/utils";

export function PackageCard({
  pkg,
  version,
  isDep = false,
}: {
  pkg: { name: string; description?: string };
  version: string;
  isDep?: boolean;
}) {
  const [scope, name] = pkg.name.split("/");
  const description = pkg.description ?? PACKAGE_DESCRIPTIONS[pkg.name] ?? null;

  return (
    <Link href={`/package/${scope}/${name}`}>
      <Card className="h-full transition-colors hover:bg-accent/50 gap-1 group">
        <CardHeader>
          <CardTitle className="font-mono text-base">
            <span className="group-hover:hidden">
              <span className="font-bold">{name}</span>{" "}
              <span className="text-sm text-muted-foreground">({scope})</span>
            </span>
            <span className="hidden group-hover:inline">
              <span className="">{pkg.name}</span>
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className={cn("line-clamp-2", !description && "italic")}>
            {description ? description : isDep ? null : "No description"}
          </CardDescription>
          <p className="mt-1 text-xs text-muted-foreground">
            {!isDep && "v"}
            {version}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
