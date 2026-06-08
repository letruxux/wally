"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Input } from "@/components/ui/input";

interface PackageEntry {
  name: string;
  date: string;
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightMatch(text: string, query: string) {
  if (!query) return text;

  const escaped = escapeRegex(query);
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));

  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <span key={i} className="text-primary">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

function renderHighlightedName(
  scope: string,
  name: string,
  query: string,
) {
  const slashIdx = query.indexOf("/");
  const scopeQuery = slashIdx >= 0 ? query.slice(0, slashIdx) : query;
  const nameQuery = slashIdx >= 0 ? query.slice(slashIdx + 1) : query;

  return (
    <>
      <span className="text-foreground">
        {highlightMatch(scope, scopeQuery)}/
      </span>
      <span className="font-semibold text-foreground">
        {highlightMatch(name, nameQuery)}
      </span>
    </>
  );
}

export function SearchAutocomplete({
  packages,
  defaultValue = "",
  placeholder = "Search packages...",
}: {
  packages: PackageEntry[];
  defaultValue?: string;
  placeholder?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(
    () =>
      query.length < 1
        ? []
        : packages.filter((p) =>
            p.name.toLowerCase().includes(query.toLowerCase()),
          ),
    [query, packages],
  );

  const hasSuggestions = suggestions.length > 0;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const listRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: suggestions.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => 36,
    overscan: 5,
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => {
        const next = Math.min(i + 1, suggestions.length - 1);
        virtualizer.scrollToIndex(next, { align: "auto" });
        return next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => {
        const next = Math.max(i - 1, 0);
        virtualizer.scrollToIndex(next, { align: "auto" });
        return next;
      });
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        e.preventDefault();
        const selected = suggestions[selectedIndex];
        const [scope, name] = selected.name.split("/");
        router.push(`/package/${scope}/${name}`);
        setShowDropdown(false);
      } else if (query.trim()) {
        const parts = query.trim().split("/");
        if (parts.length === 2 && parts[0] && parts[1]) {
          router.push(
            `/package/${encodeURIComponent(parts[0])}/${encodeURIComponent(parts[1])}`,
          );
          setShowDropdown(false);
        }
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  return (
    <div className="relative flex-1">
      <Input
        ref={inputRef}
        name="q"
        placeholder={placeholder}
        className="h-9"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowDropdown(true);
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (hasSuggestions) {
            setShowDropdown(true);
          }
        }}
        autoComplete="off"
      />
      {showDropdown && hasSuggestions && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border bg-popover p-1 shadow-md"
        >
          <div
            ref={listRef}
            className="overflow-y-auto"
            style={{ maxHeight: "20rem" }}
          >
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const pkg = suggestions[virtualItem.index];
                const [scope, name] = pkg.name.split("/");
                const date = new Date(pkg.date);
                const dateStr = date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                return (
                  <button
                    key={pkg.name}
                    type="button"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                    className={`flex items-center justify-between rounded-md px-2 py-1.5 text-sm font-mono ${
                      virtualItem.index === selectedIndex
                        ? "bg-accent text-accent-foreground"
                        : ""
                    }`}
                    onClick={() => {
                      router.push(`/package/${scope}/${name}`);
                      setShowDropdown(false);
                    }}
                    onMouseEnter={() => setSelectedIndex(virtualItem.index)}
                  >
                    <span>
                      {renderHighlightedName(scope, name, query)}
                    </span>
                    <span className="ml-3 shrink-0 text-[11px] text-muted-foreground">
                      {dateStr}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
