"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { AuthShell } from "@/components/auth-shell"

function VerifyEmailForm() {
  const [status, setStatus] = useState<"loading" | "success" | "error" | "invalid">("loading")
  const [message, setMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const error = searchParams.get("error")

  useEffect(() => {
    if (error === "invalid_token") {
      setStatus("invalid")
      setMessage("That verification link is invalid or expired.")
      return
    }
    if (!token) {
      setStatus("error")
      setMessage("No verification token in the URL.")
      return
    }
    const verifyEmail = async () => {
      try {
        const response = await fetch("/api/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })
        if (!response.ok) {
          const data = (await response.json().catch(() => ({}))) as { error?: string }
          throw new Error(data.error ?? "Couldn’t verify the email.")
        }
        setStatus("success")
        setMessage("Email verified.")
      } catch (err) {
        setStatus("error")
        setMessage(err instanceof Error ? err.message : "Couldn’t verify the email.")
      }
    }
    verifyEmail()
  }, [token, error])

  const handleResendVerification = async () => {
    try {
      const response = await fetch("/api/send-verification-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: searchParams.get("email") || "",
          callbackURL: `${window.location.origin}/verify-email`,
        }),
      })
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error ?? "Couldn’t resend the email.")
      }
      toast.success("Verification email sent.")
    } catch (err) {
      const m = err instanceof Error ? err.message : "Couldn’t resend the email."
      toast.error(m)
    }
  }

  if (status === "loading") {
    return (
      <AuthShell
        overline="Verifying"
        heading={
          <>
            One <em className="italic">moment</em>.
          </>
        }
        side={{ quote: "Confirming the magic words." }}
      >
        <div className="flex items-center gap-3 text-[14px] text-[var(--fg-muted)]">
          <div className="h-px w-16 bg-[var(--ink-300)] dark:bg-[var(--ink-700)] animate-pulse" />
          <span>Verifying your email…</span>
        </div>
      </AuthShell>
    )
  }

  if (status === "success") {
    return (
      <AuthShell
        overline="Verified"
        heading={
          <>
            You&rsquo;re <em className="italic">in</em>.
          </>
        }
        side={{ quote: "Email confirmed. Now go send something.", caption: "Welcome to Vibe Voicer." }}
      >
        <p className="text-[14px] text-[var(--fg-muted)] leading-[1.55] mb-6">{message}</p>
        <Button onClick={() => router.push("/dashboard")} size="lg" className="w-full justify-center">
          Open the dashboard →
        </Button>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      overline="Hmm"
      heading={
        <>
          That didn&rsquo;t <em className="italic">work</em>.
        </>
      }
      side={{ quote: "Verification links live for a while. Then they don’t." }}
    >
      <p className="text-[14px] text-[var(--fg-muted)] leading-[1.55] mb-6">{message}</p>
      <div className="flex flex-col gap-2">
        <Button type="button" size="lg" onClick={handleResendVerification} className="w-full justify-center">
          Resend the email
        </Button>
        <Button asChild variant="ghost" size="lg" className="w-full justify-center">
          <Link href="/login">← Back to sign in</Link>
        </Button>
      </div>
    </AuthShell>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="h-px w-24 bg-[var(--ink-300)] dark:bg-[var(--ink-700)] animate-pulse" />
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  )
}
