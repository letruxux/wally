"use client";

import { useEffect, useState, type ComponentProps } from "react";
import JSZip from "jszip";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown, ArrowUp } from "@hugeicons/core-free-icons";
import remarkGithubAlerts from "remark-github-alerts";

import "remark-github-alerts/styles/github-colors-light.css";
import "remark-github-alerts/styles/github-colors-dark-class.css";
import "remark-github-alerts/styles/github-base.css";

function findReadme(files: JSZip.JSZipObject[]): JSZip.JSZipObject | undefined {
  return files.find((f) => !f.dir && f.name.toLowerCase().endsWith("readme.md"));
}

export function ReadmeViewer({
  scope,
  name,
  version,
  readmeOverrideUrl,
}: {
  scope: string;
  name: string;
  version: string;
  readmeOverrideUrl?: string;
}) {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setContent(null);

      try {
        let text: string;

        if (readmeOverrideUrl) {
          const res = await fetch(readmeOverrideUrl);
          if (!res.ok) {
            throw new Error(`Failed to fetch readme: (${res.status})`);
          }
          text = await res.text();
        } else {
          const url = `https://api.wally.run/v1/package-contents/${scope}/${name}/${version}`;
          const res = await fetch(url, {
            headers: { "Wally-Version": "0.3.2" },
          });

          if (!res.ok) {
            throw new Error(`Failed to download package (${res.status})`);
          }

          const blob = await res.blob();
          const zip = await JSZip.loadAsync(blob);
          const files = Object.values(zip.files);
          const readme = findReadme(files);

          if (!readme) {
            setContent(null);
            setError("No description found.");
            return;
          }

          text = await readme.async("string");
        }

        if (cancelled) return;
        setContent(text);
      } catch (e) {
        if (!cancelled) {
          setContent(null);
          setError(
            e instanceof Error ? `Failed to load: ${e.message}` : "Failed to load.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [scope, name, version]);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6 mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <div className={expanded ? "" : "max-h-64 overflow-hidden relative"}>
          <div className="prose prose-sm dark:prose-invert max-w-none wrap-break-word">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkGithubAlerts]}
              rehypePlugins={[rehypeSanitize]}
              components={{
                a: ({ href, ...props }: ComponentProps<"a">) => {
                  if (
                    href?.startsWith("/") ||
                    href?.startsWith("#") ||
                    href?.startsWith(".")
                  ) {
                    return <span {...props} />;
                  }
                  return (
                    <a href={href} target="_blank" rel="noopener noreferrer" {...props} />
                  );
                },
                code: ({ children }: ComponentProps<"code">) => {
                  return (
                    <code className="rounded-md bg-muted/30 px-1 py-0.5 text-sm border before:hidden after:hidden">
                      {children}
                    </code>
                  );
                },
              }}
            >
              {content!}
            </ReactMarkdown>
          </div>
          {!expanded && (
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-card to-transparent pointer-events-none" />
          )}
        </div>
        <div className="w-full">
          <Button
            variant="secondary"
            size="sm"
            className="mx-auto block"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "View less" : "View more"}{" "}
            {expanded ? (
              <HugeiconsIcon icon={ArrowUp} className="inline" />
            ) : (
              <HugeiconsIcon icon={ArrowDown} className="inline" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
