"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useIsClient } from "@/lib/use-is-client"

export function ThemeSelector() {
  const { setTheme, resolvedTheme } = useTheme()
  const mounted = useIsClient()

  const isDark = mounted && resolvedTheme === "dark"

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-border bg-(--bg-elevated) text-(--fg-muted) hover:text-foreground transition-colors duration-[120ms]"
    >
      {isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
    </button>
  )
}
