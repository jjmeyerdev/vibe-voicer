"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeSelector } from "@/components/theme-selector"
import { Wordmark } from "@/components/brand/wordmark"

const links = [
  { name: "Features", href: "/features" },
  { name: "Pricing", href: "/pricing" },
  { name: "About", href: "/about" },
]

export function PublicNavigation() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-[color-mix(in_srgb,var(--background)_80%,transparent)] backdrop-blur-[12px]">
      <div className="mx-auto max-w-[1280px] px-12 py-3.5 flex items-center justify-between gap-6">
        <Link href="/" aria-label="Vibe Voicer home" className="flex items-center">
          <Wordmark size="lg" />
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-[13px] text-(--fg-muted)">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-foreground transition-colors duration-[120ms]">
              {l.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeSelector />
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/register">Start free →</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
