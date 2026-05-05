import { PublicNavigation } from "@/components/public-navigation"
import { Footer } from "@/components/footer"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavigation />
      <main className="mx-auto max-w-[760px] px-12 py-20">
        <div className="t-overline">Privacy</div>
        <h1 className="font-[var(--font-display)] text-[64px] leading-[1.05] tracking-[-0.02em] mt-2 mb-8">
          The <em className="italic">policy</em>.
        </h1>
        <div className="text-[12px] text-[var(--fg-muted)] mb-10">
          Last updated {new Date().toLocaleDateString("en-US", { dateStyle: "long" })}
        </div>

        <div className="flex flex-col gap-8 text-[15px] leading-[1.7]">
          <section>
            <h2 className="font-[var(--font-display)] text-[28px] leading-[1.2] mb-3">What we collect</h2>
            <p className="text-[var(--fg-muted)]">
              The bare minimum to make invoicing work — your name, email, and the invoice data you create. We don&rsquo;t buy data, sell data, or run third-party trackers.
            </p>
          </section>
          <section>
            <h2 className="font-[var(--font-display)] text-[28px] leading-[1.2] mb-3">How we use it</h2>
            <p className="text-[var(--fg-muted)]">
              To provide the service, send the invoices you tell us to send, and reply when you write to us. That&rsquo;s the whole list.
            </p>
          </section>
          <section>
            <h2 className="font-[var(--font-display)] text-[28px] leading-[1.2] mb-3">Security</h2>
            <p className="text-[var(--fg-muted)]">
              Encrypted in transit and at rest. Sessions are short. Passwords are hashed. The basics, done right.
            </p>
          </section>
          <section>
            <h2 className="font-[var(--font-display)] text-[28px] leading-[1.2] mb-3">Contact</h2>
            <p className="text-[var(--fg-muted)]">
              Questions? <a className="text-foreground underline underline-offset-4" href="mailto:privacy@vibevoicer.com">privacy@vibevoicer.com</a>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
