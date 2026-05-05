"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PublicNavigation } from "@/components/public-navigation"
import { Footer } from "@/components/footer"

const features = [
  {
    k: "01",
    h: "Send like a designer",
    b: "A type system that makes your invoice look like you cared. Tabular numerics, a real total, hairline rules — not a TurboTax form.",
  },
  {
    k: "02",
    h: "Know when they look",
    b: "We tell you the moment a client opens the invoice — pixel pings, geo-rough timestamps. Polite passive-aggression, automated.",
  },
  {
    k: "03",
    h: "Track without spreadsheets",
    b: "Outstanding, paid, overdue, drafts. One screen. Real totals, real dates, real status, no Google Sheet duct-tape.",
  },
  {
    k: "04",
    h: "Get paid online",
    b: "One link, your client pays from their inbox. Stripe, ACH, or “I’ll mail a check” — all reconciled into the same record.",
  },
  {
    k: "05",
    h: "Recurring invoices",
    b: "For retainers and the work that just keeps showing up. Set the cadence once, we send the rest.",
  },
  {
    k: "06",
    h: "Brand it like you mean it",
    b: "Your logo, your accent color, your wordmark on the PDF. Nobody&rsquo;s invoice should say “Powered by Some Other App.”",
  },
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavigation />

      <section className="px-12 py-20">
        <div className="mx-auto max-w-[1100px] mb-10">
          <div className="t-overline">Features</div>
          <h1 className="font-[var(--font-display)] text-[64px] leading-[1.05] tracking-[-0.02em] mt-2 max-w-[820px]">
            The boring parts, <em className="italic">handled</em>.
          </h1>
          <p className="mt-4 text-[18px] text-[var(--fg-muted)] max-w-[640px]">
            Everything Vibe Voicer does, in one read. Nothing here is optional bloat — it&rsquo;s all the stuff you would&rsquo;ve duct-taped together yourself.
          </p>
        </div>

        <div className="mx-auto max-w-[1100px] grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {features.map((it) => (
            <div
              key={it.k}
              className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[16px] p-7 hover:border-[var(--border-strong)] transition-colors"
            >
              <div className="font-mono text-[12px] text-[var(--fg-subtle)] mb-4">{it.k}</div>
              <div className="font-[var(--font-display)] text-[28px] leading-[1.1] mb-2.5">{it.h}</div>
              <div className="text-[14px] text-[var(--fg-muted)] leading-[1.55] max-w-[460px]">{it.b}</div>
            </div>
          ))}
        </div>

        <div className="mx-auto max-w-[1100px] flex flex-wrap items-center gap-3">
          <Button asChild size="lg">
            <Link href="/register">Start free — no card</Link>
          </Button>
          <Button asChild size="lg" variant="ghost">
            <Link href="/pricing">See pricing →</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
