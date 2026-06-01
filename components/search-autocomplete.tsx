"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";

interface PackageEntry {
  name: string;
  date: string;
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
        : packages
            .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 10),
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
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
          router.push(`/package/${encodeURIComponent(parts[0])}/${encodeURIComponent(parts[1])}`);
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
          {suggestions.map((pkg, i) => {
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
                className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm font-mono ${
                  i === selectedIndex ? "bg-accent text-accent-foreground" : ""
                }`}
                onClick={() => {
                  router.push(`/package/${scope}/${name}`);
                  setShowDropdown(false);
                }}
                onMouseEnter={() => setSelectedIndex(i)}
              >
                <span>
                  <span className="text-foreground">{scope}/</span>
                  <span className="font-semibold text-foreground">{name}</span>
                </span>
                <span className="ml-3 shrink-0 text-[11px] text-muted-foreground">
                  {dateStr}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
