"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PublicNavigation } from "@/components/public-navigation"
import { Footer } from "@/components/footer"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavigation />

      <section className="px-12 py-20">
        <div className="mx-auto max-w-[820px]">
          <div className="t-overline">About</div>
          <h1 className="font-[var(--font-display)] text-[64px] leading-[1.05] tracking-[-0.02em] mt-2 mb-8">
            We just wanted to <em className="italic">get paid</em>.
          </h1>

          <div className="flex flex-col gap-7 text-[17px] leading-[1.7] text-[var(--fg-muted)]">
            <p>
              Vibe Voicer started because the people who build it kept getting stiffed by clients. Not maliciously — they just forgot. Or the invoice got buried. Or it lived in three apps that didn&rsquo;t talk to each other.
            </p>
            <p>
              We made the tool we wanted to use. One that looks like a real invoice, not a tax form. One that tells you when the client actually opens it. One that takes a payment without making your client install something.
            </p>
            <p>
              We&rsquo;re a tiny team. We don&rsquo;t take ads. We don&rsquo;t sell your data. We don&rsquo;t have a Q3 product newsletter. We charge a fair monthly price for software that does its job, and we keep the prices on the website where you can see them.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-t border-[var(--border)] pt-4">
              <div className="t-overline mb-2">Built in</div>
              <div className="font-[var(--font-display)] italic text-[24px]">Brooklyn</div>
            </div>
            <div className="border-t border-[var(--border)] pt-4">
              <div className="t-overline mb-2">Year started</div>
              <div className="font-[var(--font-display)] italic text-[24px]">2024</div>
            </div>
            <div className="border-t border-[var(--border)] pt-4">
              <div className="t-overline mb-2">Team size</div>
              <div className="font-[var(--font-display)] italic text-[24px]">Three</div>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/register">Start free — no card</Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link href="/features">See what it does →</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
