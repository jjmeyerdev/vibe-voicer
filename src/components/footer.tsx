"use client"

import Link from "next/link"
import { Wordmark } from "@/components/brand/wordmark"

const links = [
  { name: "Privacy", href: "/privacy" },
  { name: "Terms", href: "/terms" },
  { name: "Status", href: "#" },
  { name: "Twitter", href: "#" },
]

export function Footer() {
  return (
    <footer className="border-t border-border px-12 py-8">
      <div className="mx-auto max-w-320 flex flex-col gap-4 md:flex-row md:items-center md:justify-between text-[12px]">
        <div className="flex items-center gap-4">
          <Wordmark size="sm" />
          <span className="text-(--fg-muted)">© {new Date().getFullYear()} · Made for people who&rsquo;d rather be doing the work.</span>
        </div>
        <nav className="flex items-center gap-5 text-(--fg-muted)">
          {links.map((l) => (
            <Link key={l.name} href={l.href} className="hover:text-foreground transition-colors duration-[120ms]">
              {l.name}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
