"use client";

import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DownloadIcon,
  EyeIcon,
  Loading02FreeIcons,
  SlidersHorizontalIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CasingType, convertCasing } from "@/lib/wally";
import { useLocalStorage } from "usehooks-ts";
import Link from "next/link";

export function InstallCard({
  scope,
  name,
  version,
}: {
  scope: string;
  name: string;
  version: string;
}) {
  const [copied, setCopied] = useState(false);

  const [pinVersion, setPinVersion] = useLocalStorage("pin-version", true);
  const [packageNameCasing, setPackageNameCasing] = useLocalStorage<CasingType>(
    "package-name-casing",
    "original",
  );
  const [usePesde, setUsePesde] = useLocalStorage("use-pesde", false);

  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const shortName = useMemo(() => {
    return name.split("/").pop()!;
  }, [name]);

  const tomlLine = useMemo(() => {
    const withCasing = convertCasing(shortName, packageNameCasing);
    if (!usePesde) {
      if (pinVersion) return `${withCasing} = "${scope}/${name}@${version}"`;
      return `${withCasing} = "${scope}/${name}"`;
    } else {
      if (pinVersion)
        return `${withCasing} = { wally = "${scope}/${name}", version = "${version}" }`;
      return `${withCasing} = { wally = "${scope}/${name}" }`;
    }
  }, [pinVersion, shortName, scope, name, version, packageNameCasing, usePesde]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(tomlLine);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [tomlLine]);

  const handleDownload = useCallback(async () => {
    setIsDownloading(true);
    try {
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
    } finally {
      setIsDownloading(false);
    }
  }, [scope, name, version]);

  return (
    <Card className="p-2">
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
          <div className="flex items-center gap-1">
            <Link href={`/preview/${scope}/${name}?v=${version}`}>
              <Button
                variant="outline"
                size="sm"
                disabled={isLoadingPreview}
                className="group overflow-hidden gap-0"
                onClick={() => setIsLoadingPreview(true)}
              >
                <HugeiconsIcon icon={EyeIcon} />
                <span className="ml-0 group-hover:ml-1 max-w-0 overflow-hidden opacity-0 transition-all duration-200 group-hover:max-w-20 group-hover:opacity-100">
                  Preview
                </span>
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={isDownloading}
              className="group overflow-hidden gap-0"
            >
              {isDownloading ? (
                <HugeiconsIcon icon={Loading02FreeIcons} className="animate-spin" />
              ) : (
                <HugeiconsIcon icon={DownloadIcon} />
              )}
              <span className="ml-0 group-hover:ml-1 max-w-0 overflow-hidden opacity-0 transition-all duration-200 group-hover:max-w-20 group-hover:opacity-100">
                Download
              </span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                  <HugeiconsIcon icon={SlidersHorizontalIcon} />
                </Button>
              </DropdownMenuTrigger>
              <InstallCardSettings
                pinVersion={pinVersion}
                setPinVersion={setPinVersion}
                packageNameCasing={packageNameCasing}
                setPackageNameCasing={setPackageNameCasing}
                shortName={shortName}
                usePesde={usePesde}
                setUsePesde={setUsePesde}
              />
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InstallCardSettings({
  pinVersion,
  setPinVersion,
  packageNameCasing,
  setPackageNameCasing,
  shortName,
  usePesde,
  setUsePesde,
}: {
  pinVersion: boolean;
  setPinVersion: (v: boolean) => void;
  packageNameCasing: CasingType;
  setPackageNameCasing: (v: CasingType) => void;
  shortName: string;
  usePesde: boolean;
  setUsePesde: (v: boolean) => void;
}) {
  return (
    <DropdownMenuContent className="w-40" align="start">
      <DropdownMenuGroup>
        <DropdownMenuLabel>
          <code>{usePesde ? "pesde" : "wally"}.toml</code>
        </DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          onSelect={(e) => e.preventDefault()}
          checked={pinVersion}
          onCheckedChange={setPinVersion}
        >
          Pin specific version
        </DropdownMenuCheckboxItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Package manager</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuCheckboxItem
                onSelect={(e) => e.preventDefault()}
                checked={!usePesde}
                onCheckedChange={() => setUsePesde(false)}
              >
                Wally
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                onSelect={(e) => e.preventDefault()}
                checked={usePesde}
                onCheckedChange={() => setUsePesde(true)}
              >
                pesde
              </DropdownMenuCheckboxItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Package name casing</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuCheckboxItem
                onSelect={(e) => e.preventDefault()}
                checked={packageNameCasing === "original"}
                onCheckedChange={() => setPackageNameCasing("original")}
              >
                Original:{" "}
                <span className="font-mono">{convertCasing(shortName, "original")}</span>
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                onSelect={(e) => e.preventDefault()}
                checked={packageNameCasing === "caps"}
                onCheckedChange={() => setPackageNameCasing("caps")}
              >
                Caps:{" "}
                <span className="font-mono">{convertCasing(shortName, "caps")}</span>
              </DropdownMenuCheckboxItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  );
}
