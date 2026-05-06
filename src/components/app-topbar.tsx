"use client"

import Link from "next/link"
import { Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

type AppTopbarProps = {
  title: string
  subtitle?: string
}

export function AppTopbar({ title, subtitle }: AppTopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-6 px-7 py-4 border-b border-border bg-background">
      <div className="flex flex-col gap-0.5 min-w-0">
        <h1 className="font-(--font-display) text-[28px] leading-[1.1] truncate">{title}</h1>
        {subtitle && <div className="text-[12px] text-(--fg-muted)">{subtitle}</div>}
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1.5 w-80 rounded-[8px] border border-border bg-(--bg-sunken) text-(--fg-muted)">
          <Search className="h-3.5 w-3.5" />
          <input
            type="search"
            placeholder="Search invoices, clients…"
            className="flex-1 bg-transparent border-0 outline-none text-[13px] text-foreground placeholder:text-(--fg-muted)"
          />
          <kbd className="font-mono text-[10px] text-(--fg-muted) border border-border px-1.5 py-0.5 rounded-[4px] bg-background">⌘K</kbd>
        </div>
        <Button asChild size="default">
          <Link href="/invoices/new">
            <Plus className="h-4 w-4" />
            <span>New invoice</span>
          </Link>
        </Button>
      </div>
    </header>
  )
}
