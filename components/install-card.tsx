"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function InstallCard({
  scope,
  name,
  version,
}: {
  scope: string;
  name: string;
  version: string;
}) {
  const shortName = name.split("/").pop()!;
  const tomlLine = `${shortName} = "${scope}/${name}@${version}"`;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(tomlLine);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section>
      <h2 className="text-xl font-semibold">Install</h2>
      <Card className="mt-4 p-2">
        <CardContent className="p-2 gap-y-2 flex flex-col w-full">
          <div
            className="flex items-center justify-between gap-4 rounded-lg border bg-muted/30 px-3 py-2.5 cursor-pointer transition-colors hover:bg-muted/60"
            onClick={handleCopy}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleCopy();
            }}
          >
            <code className="text-sm font-mono break-all">{tomlLine}</code>
            <span className="text-xs text-muted-foreground shrink-0">
              {copied ? "Copied!" : "Click to copy"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              ...or download it as a .zip file
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const url = `https://api.wally.run/v1/package-contents/${scope}/${name}/${version}`;
                const res = await fetch(url, {
                  headers: { "Wally-Version": "0.3.2" },
                });
                const blob = await res.blob();
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = `${scope}-${name}-${version}.zip`;
                a.click();
                URL.revokeObjectURL(a.href);
              }}
            >
              Download
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
