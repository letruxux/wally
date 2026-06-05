"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { HugeiconsIcon } from "@hugeicons/react";
import { Sun02Icon, Moon02Icon, Bone01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <HugeiconsIcon
            icon={Sun02Icon}
            className="h-5 w-5 scale-100 rotate-0 transition-all justdark:scale-0 justdark:-rotate-90 wally:scale-0 wally:-rotate-90"
          />
          <HugeiconsIcon
            icon={Moon02Icon}
            className="absolute h-5 w-5 scale-0 rotate-90 transition-all justdark:scale-100 justdark:rotate-0 wally:scale-0 wally:-rotate-90"
          />
          <HugeiconsIcon
            icon={Bone01Icon}
            className="absolute h-5 w-5 scale-0 rotate-90 transition-all wally:scale-100 wally:rotate-0"
          />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuCheckboxItem
          checked={theme === "wally"}
          onSelect={(e) => e.preventDefault()}
          onCheckedChange={() => setTheme("wally")}
        >
          <HugeiconsIcon icon={Bone01Icon} className="h-4 w-4" />
          Wally
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={theme === "dark"}
          onSelect={(e) => e.preventDefault()}
          onCheckedChange={() => setTheme("dark")}
        >
          <HugeiconsIcon icon={Moon02Icon} className="h-4 w-4" />
          Dark
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={theme === "light"}
          onSelect={(e) => e.preventDefault()}
          onCheckedChange={() => setTheme("light")}
        >
          <HugeiconsIcon icon={Sun02Icon} className="h-4 w-4" />
          Light
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
