"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AuthShell } from "@/components/auth-shell"

function CheckEmailContent() {
  const [email, setEmail] = useState("")
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendError, setResendError] = useState("")
  const searchParams = useSearchParams()

  useEffect(() => {
    const emailParam = searchParams.get("email")
    if (emailParam) setEmail(emailParam)
  }, [searchParams])

  const handleResendEmail = async () => {
    if (!email) return
    setIsResending(true)
    setResendSuccess(false)
    setResendError("")
    try {
      const response = await fetch("/api/send-verification-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = (await response.json().catch(() => ({}))) as { error?: string }
      if (response.ok) {
        setResendSuccess(true)
        setTimeout(() => setResendSuccess(false), 5000)
      } else {
        setResendError(data.error ?? "Couldn’t resend the email.")
      }
    } catch {
      setResendError("Network error. Try again.")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <AuthShell
      overline="Almost there"
      heading={
        <>
          Check the <em className="italic">inbox</em>.
        </>
      }
      side={{
        quote: "We email you exactly twice. The first one is on its way.",
        caption: "The second one is much later, when an invoice gets paid.",
      }}
    >
      <p className="text-[14px] text-[var(--fg-muted)] leading-[1.55] mb-6">
        We sent a verification link to{" "}
        <span className="text-foreground">{email || "your email"}</span>. Click it to activate your account, then come back here to sign in.
      </p>

      <ul className="flex flex-col gap-2 text-[13px] text-[var(--fg-muted)] mb-7">
        <li className="flex items-start gap-2">
          <span className="font-mono text-[var(--fg-subtle)]">·</span> Check your inbox (and spam folder, just in case).
        </li>
        <li className="flex items-start gap-2">
          <span className="font-mono text-[var(--fg-subtle)]">·</span> Click the verification link.
        </li>
        <li className="flex items-start gap-2">
          <span className="font-mono text-[var(--fg-subtle)]">·</span> Come back to sign in.
        </li>
      </ul>

      <div className="flex flex-col gap-2">
        <Button
          type="button"
          size="lg"
          onClick={handleResendEmail}
          disabled={isResending || !email}
          className="w-full justify-center"
        >
          {isResending ? "Sending…" : "Resend the email"}
        </Button>
        <Button asChild variant="ghost" size="lg" className="w-full justify-center">
          <Link href="/login">← Back to sign in</Link>
        </Button>
      </div>

      {resendSuccess && (
        <div className="mt-4 px-3.5 py-3 rounded-[8px] bg-[var(--status-paid-tint)] border border-[var(--status-paid-fg)]/30 text-[13px] text-[var(--status-paid-fg)]">
          Verification email sent.
        </div>
      )}
      {resendError && (
        <div className="mt-4 px-3.5 py-3 rounded-[8px] bg-[var(--status-overdue-tint)] border border-[var(--status-overdue-fg)]/30 text-[13px] text-[var(--status-overdue-fg)]">
          {resendError}
        </div>
      )}
    </AuthShell>
  )
}

export default function CheckEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="h-px w-24 bg-[var(--ink-300)] dark:bg-[var(--ink-700)] animate-pulse" />
        </div>
      }
    >
      <CheckEmailContent />
    </Suspense>
  )
}
