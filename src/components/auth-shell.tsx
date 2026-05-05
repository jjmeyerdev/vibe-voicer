"use client"

import { Wordmark } from "@/components/brand/wordmark"
import { ThemeSelector } from "@/components/theme-selector"

type AuthShellProps = {
  side: { quote: string; caption?: string }
  overline: string
  heading: React.ReactNode
  children: React.ReactNode
}

export function AuthShell({ side, overline, heading, children }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-background grid grid-cols-1 lg:grid-cols-[1fr_1.1fr]">
      <aside className="hidden lg:flex flex-col justify-between p-12 border-r border-border bg-(--bg-sunken)">
        <Wordmark size="lg" />
        <div>
          <div className="font-(--font-display) italic text-[36px] leading-[1.2] text-foreground">
            &ldquo;{side.quote}&rdquo;
          </div>
          {side.caption && (
            <div className="mt-4 text-[12px] text-(--fg-muted)">{side.caption}</div>
          )}
        </div>
        <div className="text-[12px] text-(--fg-muted)">© {new Date().getFullYear()} · Vibe Voicer</div>
      </aside>

      <main className="flex flex-col">
        <div className="flex items-center justify-between px-6 lg:px-12 py-4">
          <div className="lg:hidden">
            <Wordmark size="md" />
          </div>
          <div className="ml-auto">
            <ThemeSelector />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center px-6 lg:px-12 py-10">
          <div className="w-full max-w-105">
            <div className="t-overline mb-3">{overline}</div>
            <h1 className="font-(--font-display) text-[64px] leading-none tracking-[-0.02em] mb-8 max-w-100">
              {heading}
            </h1>
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
