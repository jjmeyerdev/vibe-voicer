"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PublicNavigation } from "@/components/public-navigation"
import { Footer } from "@/components/footer"

const tiers = [
  {
    name: "Solo",
    price: "$0",
    per: "forever",
    desc: "For your first five invoices.",
    feats: ["Up to 5 invoices/month", "PDF export", "Public share links", "Email support"],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$12",
    per: "per month",
    desc: "For working freelancers.",
    feats: [
      "Unlimited invoices",
      "Open tracking",
      "Stripe + ACH payments",
      "Recurring invoices",
      "Custom branding",
      "Priority support",
    ],
    cta: "Start 14-day trial",
    highlight: true,
  },
  {
    name: "Studio",
    price: "$32",
    per: "per month",
    desc: "For small teams sharing books.",
    feats: ["Everything in Pro", "Up to 5 seats", "API access", "Per-seat audit log", "Phone support"],
    cta: "Start trial",
    highlight: false,
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavigation />

      <section className="px-12 py-20">
        <div className="mx-auto max-w-[1100px] mb-10">
          <div className="t-overline">Pricing</div>
          <h1 className="font-[var(--font-display)] text-[64px] leading-[1.05] tracking-[-0.02em] mt-2">
            Pay <em className="italic">monthly</em>. Cancel anytime.
          </h1>
          <p className="mt-4 text-[18px] text-[var(--fg-muted)] max-w-[560px]">
            One price, billed monthly. No annual contracts, no per-invoice fees, no upsells we hide in the footer.
          </p>
        </div>

        <div className="mx-auto max-w-[1100px] grid grid-cols-1 md:grid-cols-3 gap-4">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={
                "rounded-[16px] p-7 flex flex-col gap-3.5 relative " +
                (t.highlight
                  ? "bg-[var(--citrus)] text-[var(--ink-900)] border border-[var(--ink-900)]"
                  : "bg-[var(--bg-elevated)] border border-[var(--border)]")
              }
            >
              {t.highlight && (
                <div className="absolute -top-3 left-6 bg-[var(--ink-900)] text-[var(--citrus)] text-[11px] font-semibold tracking-[0.06em] uppercase px-2.5 py-1 rounded-full">
                  Most picked
                </div>
              )}
              <div className="font-[var(--font-display)] italic text-[22px] leading-none">{t.name}</div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-[var(--font-display)] text-[56px] leading-none tracking-[-0.02em]">
                  {t.price}
                </span>
                <span className={"text-[13px] " + (t.highlight ? "text-[var(--ink-700)]" : "text-[var(--fg-muted)]")}>
                  /{t.per}
                </span>
              </div>
              <div className={"text-[13px] " + (t.highlight ? "text-[var(--ink-700)]" : "text-[var(--fg-muted)]")}>
                {t.desc}
              </div>
              <ul className="list-none p-0 m-0 flex flex-col gap-2 text-[13px]">
                {t.feats.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="inline-block w-4 text-[var(--ink-900)]">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-2">
                <Button
                  asChild
                  size="lg"
                  variant={t.highlight ? "default" : "secondary"}
                  className={
                    "w-full justify-center " +
                    (t.highlight
                      ? "bg-[var(--ink-900)] text-[var(--citrus)] border-[var(--ink-900)] hover:bg-[#1f1e1b]"
                      : "")
                  }
                >
                  <Link href="/register">{t.cta}</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto max-w-[1100px] mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 text-[13px] text-[var(--fg-muted)]">
          <div className="border-t border-[var(--border)] pt-4">
            <div className="t-overline mb-2">Refunds</div>
            <p>14-day money back. No forms, no questions, just email us.</p>
          </div>
          <div className="border-t border-[var(--border)] pt-4">
            <div className="t-overline mb-2">Taxes</div>
            <p>Prices listed are pre-tax. We collect VAT/GST where required by your country.</p>
          </div>
          <div className="border-t border-[var(--border)] pt-4">
            <div className="t-overline mb-2">Switch plans</div>
            <p>Upgrade or downgrade anytime. We pro-rate the rest of your month.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
