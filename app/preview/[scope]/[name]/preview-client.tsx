"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import JSZip from "jszip";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft02Icon,
  FileCodeIcon,
  FolderCodeIcon,
} from "@hugeicons/core-free-icons";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface TreeNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children: TreeNode[];
}

function buildTree(files: JSZip.JSZipObject[]): TreeNode[] {
  const map = new Map<string, TreeNode>();

  for (const file of files) {
    const path = file.name.replace(/\/$/, "");
    if (!path) continue;
    const parts = path.split("/");

    for (let i = 1; i <= parts.length; i++) {
      const subPath = parts.slice(0, i).join("/");
      if (!map.has(subPath)) {
        map.set(subPath, {
          name: parts[i - 1],
          path: subPath,
          type: i < parts.length || file.dir ? "folder" : "file",
          children: [],
        });
      }
    }
  }

  const roots: TreeNode[] = [];
  for (const [path, node] of map) {
    const idx = path.lastIndexOf("/");
    const parentPath = idx >= 0 ? path.substring(0, idx) : "";
    if (parentPath && map.has(parentPath)) {
      map.get(parentPath)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortFn = (a: TreeNode, b: TreeNode) => {
    if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
    return a.name.localeCompare(b.name);
  };

  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort(sortFn);
    for (const n of nodes) sortNodes(n.children);
  };
  sortNodes(roots);

  return roots;
}

function getLanguage(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "lua":
    case "luau":
      return "lua";
    case "json":
      return "json";
    case "md":
      return "markdown";
    case "ts":
    case "tsx":
      return "typescript";
    case "js":
    case "jsx":
      return "javascript";
    case "css":
      return "css";
    case "html":
      return "html";
    case "yaml":
    case "yml":
      return "yaml";
    case "toml":
      return "ini";
    case "xml":
    case "rbxm":
    case "rbxmx":
      return "xml";
    default:
      return "plaintext";
  }
}

function FileTreeView({
  nodes,
  selectedFile,
  expandedFolders,
  onToggleFolder,
  onFileClick,
  depth = 0,
}: {
  nodes: TreeNode[];
  selectedFile: string | null;
  expandedFolders: Set<string>;
  onToggleFolder: (path: string) => void;
  onFileClick: (path: string) => void;
  depth?: number;
}) {
  return (
    <>
      {nodes.map((node) =>
        node.type === "folder" ? (
          <div key={node.path}>
            <button
              className="flex w-full items-center gap-1 px-3 py-1 text-xs text-left transition-colors hover:bg-muted/40"
              style={{ paddingLeft: `${8 + depth * 16}px` }}
              onClick={() => onToggleFolder(node.path)}
            >
              <span className="text-muted-foreground shrink-0 w-4 text-center">
                {expandedFolders.has(node.path) ? "▾" : "▸"}
              </span>
              <HugeiconsIcon
                icon={FolderCodeIcon}
                size={14}
                className="shrink-0 text-muted-foreground"
              />
              <span className="truncate">{node.name}</span>
            </button>
            {expandedFolders.has(node.path) && (
              <FileTreeView
                nodes={node.children}
                selectedFile={selectedFile}
                expandedFolders={expandedFolders}
                onToggleFolder={onToggleFolder}
                onFileClick={onFileClick}
                depth={depth + 1}
              />
            )}
          </div>
        ) : (
          <button
            key={node.path}
            className={`flex w-full items-center gap-1 px-3 py-1 text-xs text-left transition-colors ${
              selectedFile === node.path
                ? "bg-accent text-accent-foreground"
                : "hover:bg-muted/40"
            }`}
            style={{ paddingLeft: `${8 + depth * 16}px` }}
            onClick={() => onFileClick(node.path)}
          >
            <span className="w-4 shrink-0" />
            <HugeiconsIcon
              icon={FileCodeIcon}
              size={14}
              className="shrink-0 text-muted-foreground"
            />
            <span className="truncate">{node.name}</span>
          </button>
        ),
      )}
    </>
  );
}

export function PreviewClient({
  scope,
  name,
  version,
}: {
  scope: string;
  name: string;
  version: string;
}) {
  const [zip, setZip] = useState<JSZip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [showMobileTree, setShowMobileTree] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const url = `https://api.wally.run/v1/package-contents/${scope}/${name}/${version}`;
        const res = await fetch(url, {
          headers: { "Wally-Version": "0.3.2" },
        });

        if (!res.ok) {
          throw new Error(`Failed to download package (${res.status})`);
        }

        const blob = await res.blob();
        const loaded = await JSZip.loadAsync(blob);

        if (cancelled) return;

        setZip(loaded);

        const allFiles = Object.values(loaded.files).filter((f) => !f.dir);

        const rootDirs = new Set<string>();
        const tree = buildTree(Object.values(loaded.files));
        for (const node of tree) {
          if (node.type === "folder") rootDirs.add(node.path);
        }
        setExpandedFolders(rootDirs);

        const readme = allFiles.find((f) => f.name.toLowerCase().endsWith("readme.md"));
        if (readme) {
          const content = await readme.async("string");
          setSelectedFile(readme.name);
          setFileContent(content);
        } else if (allFiles.length > 0) {
          const first = allFiles[0];
          const content = await first.async("string");
          setSelectedFile(first.name);
          setFileContent(content);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load package");
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

  const handleFileClick = useCallback(
    async (path: string) => {
      if (!zip) return;
      const file = zip.files[path];
      if (!file || file.dir) return;

      try {
        const content = await file.async("string");
        setSelectedFile(path);
        setFileContent(content);
      } catch {
        setSelectedFile(path);
        setFileContent("// Binary file or unable to read");
      }
    },
    [zip],
  );

  const tree = useMemo(() => buildTree(zip ? Object.values(zip.files) : []), [zip]);

  const monacoLanguage = selectedFile ? getLanguage(selectedFile) : "plaintext";
  const monacoTheme = "vs-dark";

  if (loading) {
    return (
      <div className="py-8 px-4">
        <Skeleton className="h-6 mb-2 w-64 bg-foreground/20" />
        <Skeleton className="h-[60vh] bg-foreground/20" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 px-4">
        <Link
          href={`/package/${scope}/${name}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          <HugeiconsIcon size={16} icon={ArrowLeft02Icon} className="inline" /> Back to{" "}
          package info
        </Link>
        <p className="mt-6 text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  const fileTree = (
    <FileTreeView
      nodes={tree}
      selectedFile={selectedFile}
      expandedFolders={expandedFolders}
      onToggleFolder={(path) => {
        setExpandedFolders((prev) => {
          const next = new Set(prev);
          if (next.has(path)) next.delete(path);
          else next.add(path);
          return next;
        });
      }}
      onFileClick={(path) => {
        handleFileClick(path);
        setShowMobileTree(false);
      }}
    />
  );

  const editorPanel =
    selectedFile && zip ? (
      <div className="h-full flex flex-col">
        <div className="px-4 py-2 text-xs text-muted-foreground border-b shrink-0 font-mono truncate">
          {selectedFile}
        </div>
        <div className="flex-1">
          <MonacoEditor
            language={monacoLanguage}
            value={fileContent}
            theme={monacoTheme}
            options={{
              readOnly: true,
              minimap: { enabled: true },
              fontSize: 13,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              wordWrap: "on",
              automaticLayout: true,
            }}
          />
        </div>
      </div>
    ) : (
      <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
        Select a file to preview
      </div>
    );

  return (
    <div>
      <div className="md:hidden mb-2 flex items-center justify-between px-4 pt-8">
        <div>
          <Link
            href={`/package/${scope}/${name}`}
            className="text-sm text-muted-foreground hover:underline"
          >
            <HugeiconsIcon size={16} icon={ArrowLeft02Icon} className="inline" /> Back to{" "}
            package info
          </Link>
        </div>
      </div>

      <div className="md:hidden h-[calc(100vh-3rem)] flex flex-col border-t">
        <Collapsible open={showMobileTree} onOpenChange={setShowMobileTree}>
          <CollapsibleTrigger className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold border-b bg-muted/10 shrink-0">
            <span className="shrink-0 w-4 text-center">{showMobileTree ? "▾" : "▸"}</span>
            <HugeiconsIcon icon={FolderCodeIcon} size={14} className="shrink-0" />
            <span className="truncate">
              {scope}/{name} v{version}
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="max-h-[50vh] overflow-auto border-b">
              <ScrollArea className="h-full">{fileTree}</ScrollArea>
            </div>
          </CollapsibleContent>
        </Collapsible>
        <div className="flex-1 min-h-0">{editorPanel}</div>
      </div>

      <div className="hidden md:block w-full max-w-5xl mx-auto">
        <div className="mb-2 flex items-center justify-between pt-8">
          <div>
            <Link
              href={`/package/${scope}/${name}`}
              className="text-sm text-muted-foreground hover:underline"
            >
              <HugeiconsIcon size={16} icon={ArrowLeft02Icon} className="inline" /> Back
              to package info
            </Link>
          </div>
        </div>
        <div className="h-[calc(100vh-3rem)] border rounded-lg overflow-hidden">
          <ResizablePanelGroup orientation="horizontal">
            <ResizablePanel defaultSize={35} minSize={20}>
              <div className="h-full bg-muted/10 flex flex-col">
                <div className="px-3 py-2 text-xs font-semibold text-foreground border-b shrink-0">
                  {scope}/{name} v{version}
                </div>
                <ScrollArea className="flex-1">{fileTree}</ScrollArea>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={75}>{editorPanel}</ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </div>
  );
}
