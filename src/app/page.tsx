"use client"

import { useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PublicNavigation } from "@/components/public-navigation"
import { Footer } from "@/components/footer"
import { PerforatedEdge } from "@/components/brand/perforated-edge"

const features = [
  {
    k: "01",
    h: "Send like a designer",
    b: "A type system that makes your invoice look like you cared. Not a TurboTax form.",
  },
  {
    k: "02",
    h: "Know when they look",
    b: "We tell you the moment a client opens the invoice. Polite passive-aggression, automated.",
  },
  {
    k: "03",
    h: "Track without spreadsheets",
    b: "Outstanding, paid, overdue. One screen. Tabular numbers, real totals.",
  },
  {
    k: "04",
    h: "Get paid online",
    b: "One link, your client pays from their inbox. Stripe, ACH, or “I’ll mail a check.”",
  },
]

const tiers = [
  {
    name: "Solo",
    price: "$0",
    per: "forever",
    desc: "For your first five invoices.",
    feats: ["Up to 5 invoices/month", "PDF export", "Public share links"],
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
    feats: ["Everything in Pro", "Up to 5 seats", "Custom invoice branding", "API access"],
    cta: "Start trial",
    highlight: false,
  },
]

export default function Home() {
  const { data: session, isPending } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!isPending && session) router.push("/dashboard")
  }, [session, isPending, router])

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-px w-24 bg-ink-300 dark:bg-ink-700 animate-pulse" />
      </div>
    )
  }

  if (session) return null

  return (
    <div className="min-h-screen bg-background">
      <PublicNavigation />

      {/* Hero */}
      <section className="relative px-12 pt-20 pb-12">
        <div className="mx-auto max-w-[1100px]">
          <div className="inline-flex items-center gap-2 text-[12px] text-(--fg-muted) px-3 py-1.5 border border-border rounded-full mb-7">
            <span
              aria-hidden
              className="w-1.5 h-1.5 rounded-full bg-citrus border border-ink-900 dark:border-transparent"
            />
            For freelancers who&rsquo;d rather be designing
          </div>
          <h1 className="font-display leading-[1.0] tracking-[-0.02em] m-0 mb-7 max-w-[1000px]" style={{ fontSize: "clamp(56px, 9vw, 124px)" }}>
            Get{" "}
            <em className="not-italic">
              <span className="italic">paid</span>
              <span
                aria-hidden
                className="inline-block bg-citrus border border-ink-900 dark:border-transparent rounded-full"
                style={{ width: "0.14em", height: "0.14em", verticalAlign: "0.18em", marginLeft: "0.04em" }}
              />
            </em>{" "}
            like
            <br />
            you mean it.
          </h1>
          <p className="text-[20px] leading-[1.55] text-(--fg-muted) max-w-[640px] mb-8">
            Invoicing that doesn&rsquo;t feel like homework. Send a clean invoice, see when your client opens it, and quit chasing payments through three different apps.
          </p>
          <div className="flex flex-wrap gap-3 items-center mb-7">
            <Button asChild size="lg">
              <Link href="/register">Start free — no card</Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link href="#features">See a sample invoice →</Link>
            </Button>
          </div>
          <div className="flex flex-wrap gap-4 text-[12px] text-(--fg-muted)">
            <span className="font-mono tabular-nums">Free for 5 invoices/mo</span>
            <span className="text-(--fg-subtle)">·</span>
            <span className="font-mono tabular-nums">$12/mo Pro</span>
            <span className="text-(--fg-subtle)">·</span>
            <span className="font-mono tabular-nums">No annual contracts</span>
          </div>
        </div>
        <PerforatedEdge className="absolute left-0 right-0 bottom-[-1px]" />
      </section>

      {/* Proof */}
      <section className="px-12 py-9 border-t border-b border-border">
        <div className="mx-auto max-w-[1100px] flex flex-wrap items-center justify-between gap-9">
          <div className="font-display italic text-[22px] text-(--fg-muted)">
            &ldquo;Stopped using three apps for one job. Final form.&rdquo;
          </div>
          <div className="flex gap-8">
            {[
              { num: "$2.4M", lab: "Sent through Voicer" },
              { num: "3.1d", lab: "Avg time to paid" },
              { num: "11k", lab: "Freelancers, no agencies" },
            ].map((s) => (
              <div key={s.lab}>
                <div className="font-display text-[32px] leading-none">{s.num}</div>
                <div className="t-overline mt-1">{s.lab}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-12 py-20 bg-(--bg-sunken)">
        <div className="mx-auto max-w-[1100px] mb-9">
          <div className="t-overline">What it does</div>
          <h2 className="font-display text-[56px] leading-[1.05] mt-2 max-w-[720px]">
            The boring parts, <em className="italic">handled</em>.
          </h2>
        </div>
        <div className="mx-auto max-w-[1100px] grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((it) => (
            <div
              key={it.k}
              className="bg-(--bg-elevated) border border-border rounded-[16px] p-7 hover:border-(--border-strong) transition-colors"
            >
              <div className="font-mono text-[12px] text-(--fg-subtle) mb-4">{it.k}</div>
              <div className="font-display text-[28px] leading-[1.1] mb-2.5">{it.h}</div>
              <div className="text-[14px] text-(--fg-muted) leading-[1.55] max-w-[420px]">{it.b}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-12 py-20">
        <div className="mx-auto max-w-[1100px] mb-10">
          <div className="t-overline">Pricing</div>
          <h2 className="font-display text-[52px] leading-[1.05] mt-2">
            Pay <em className="italic">monthly</em>. Cancel anytime.
          </h2>
        </div>
        <div className="mx-auto max-w-[1100px] grid grid-cols-1 md:grid-cols-3 gap-4">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={
                "rounded-[16px] p-7 flex flex-col gap-3.5 relative " +
                (t.highlight
                  ? "bg-citrus text-ink-900 border border-ink-900"
                  : "bg-(--bg-elevated) border border-border")
              }
            >
              {t.highlight && (
                <div className="absolute -top-3 left-6 bg-ink-900 text-citrus text-[11px] font-semibold tracking-[0.06em] uppercase px-2.5 py-1 rounded-full">
                  Most picked
                </div>
              )}
              <div className="font-display italic text-[22px] leading-none">{t.name}</div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-[56px] leading-none tracking-[-0.02em]">
                  {t.price}
                </span>
                <span className={"text-[13px] " + (t.highlight ? "text-ink-700" : "text-(--fg-muted)")}>
                  /{t.per}
                </span>
              </div>
              <div className={"text-[13px] " + (t.highlight ? "text-ink-700" : "text-(--fg-muted)")}>
                {t.desc}
              </div>
              <ul className="list-none p-0 m-0 flex flex-col gap-2 text-[13px]">
                {t.feats.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="inline-block w-4 text-ink-900">✓</span>
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
                      ? "bg-ink-900 text-citrus border-ink-900 hover:bg-[#1f1e1b]"
                      : "")
                  }
                >
                  <Link href="/register">{t.cta}</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}
