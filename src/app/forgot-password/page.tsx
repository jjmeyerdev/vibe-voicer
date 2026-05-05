"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { AuthShell } from "@/components/auth-shell"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch("/api/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          redirectTo: `${window.location.origin}/reset-password`,
        }),
      })
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error ?? "Couldn’t send the reset email.")
      }
      setIsSuccess(true)
      toast.success("Reset link sent. Check your inbox.")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Couldn’t send the reset email."
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <AuthShell
        overline="Sent"
        heading={
          <>
            Check your <em className="italic">inbox</em>.
          </>
        }
        side={{
          quote: "Inbox-zero is a lifestyle. We just sent one to it.",
          caption: "The link expires in an hour.",
        }}
      >
        <p className="text-[14px] text-[var(--fg-muted)] leading-[1.55] mb-6">
          We sent a reset link to <span className="text-foreground">{email}</span>. Click the link to set a new password.
        </p>
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="w-full justify-center"
            onClick={() => {
              setIsSuccess(false)
              setEmail("")
            }}
          >
            Send another
          </Button>
          <Button asChild variant="ghost" size="lg" className="w-full justify-center">
            <Link href="/login">Back to sign in</Link>
          </Button>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      overline="Reset"
      heading={
        <>
          Forgot the <em className="italic">password</em>?
        </>
      }
      side={{
        quote: "Happens to everyone. Even people who run password managers.",
      }}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@studio.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <Button type="submit" size="lg" disabled={isLoading} className="w-full justify-center mt-3">
          {isLoading ? "Sending…" : "Send reset link →"}
        </Button>
      </form>

      <div className="mt-7 text-[12px] text-[var(--fg-muted)]">
        <Link href="/login" className="hover:text-foreground transition-colors">
          ← Back to sign in
        </Link>
      </div>
    </AuthShell>
  )
}
