import { PublicNavigation } from "@/components/public-navigation"
import { Footer } from "@/components/footer"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavigation />
      <main className="mx-auto max-w-[760px] px-12 py-20">
        <div className="t-overline">Terms</div>
        <h1 className="font-display text-[64px] leading-[1.05] tracking-[-0.02em] mt-2 mb-8">
          The fine <em className="italic">print</em>.
        </h1>
        <div className="text-[12px] text-(--fg-muted) mb-10">
          Last updated {new Date().toLocaleDateString("en-US", { dateStyle: "long" })}
        </div>

        <div className="flex flex-col gap-8 text-[15px] leading-[1.7]">
          <section>
            <h2 className="font-display text-[28px] leading-[1.2] mb-3">Using Vibe Voicer</h2>
            <p className="text-(--fg-muted)">
              Use it for legitimate invoicing — yours or your clients&rsquo;. Don&rsquo;t use it to scam, spam, or impersonate anyone. We can suspend accounts that do.
            </p>
          </section>
          <section>
            <h2 className="font-display text-[28px] leading-[1.2] mb-3">Your account</h2>
            <p className="text-(--fg-muted)">
              You&rsquo;re responsible for keeping your credentials safe and for what happens under your account. Don&rsquo;t share your password.
            </p>
          </section>
          <section>
            <h2 className="font-display text-[28px] leading-[1.2] mb-3">Service availability</h2>
            <p className="text-(--fg-muted)">
              We aim for the best uptime we can. We don&rsquo;t promise zero downtime — nobody honestly can. We&rsquo;ll be straight with you when something breaks.
            </p>
          </section>
          <section>
            <h2 className="font-display text-[28px] leading-[1.2] mb-3">Contact</h2>
            <p className="text-(--fg-muted)">
              <a className="text-foreground underline underline-offset-4" href="mailto:legal@vibevoicer.com">legal@vibevoicer.com</a>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
