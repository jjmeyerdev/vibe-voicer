"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { AuthShell } from "@/components/auth-shell"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const error = searchParams.get("error")

  const initialMessage =
    error === "INVALID_TOKEN"
      ? "That reset link is expired or invalid."
      : !token
        ? "No reset token in the URL."
        : ""

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"form" | "success" | "error">(
    initialMessage ? "error" : "form",
  )
  const [message, setMessage] = useState(initialMessage)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error("The two passwords don’t match.")
      return
    }
    if (password.length < 8) {
      toast.error("Eight characters minimum.")
      return
    }
    setIsLoading(true)
    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      })
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error ?? "Couldn’t reset the password.")
      }
      setStatus("success")
      setMessage("Done. Sign in with your new password.")
    } catch (err) {
      const m = err instanceof Error ? err.message : "Couldn’t reset the password."
      toast.error(m)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "error") {
    return (
      <AuthShell
        overline="Expired"
        heading={
          <>
            That link is <em className="italic">stale</em>.
          </>
        }
        side={{ quote: "Reset links live for an hour. After that, ask for a new one." }}
      >
        <p className="text-[14px] text-[var(--fg-muted)] leading-[1.55] mb-6">{message}</p>
        <div className="flex flex-col gap-2">
          <Button asChild size="lg" className="w-full justify-center">
            <Link href="/forgot-password">Request a new link</Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="w-full justify-center">
            <Link href="/login">Back to sign in</Link>
          </Button>
        </div>
      </AuthShell>
    )
  }

  if (status === "success") {
    return (
      <AuthShell
        overline="Done"
        heading={
          <>
            New password, <em className="italic">set</em>.
          </>
        }
        side={{ quote: "Pick something memorable. Or get a password manager." }}
      >
        <p className="text-[14px] text-[var(--fg-muted)] leading-[1.55] mb-6">{message}</p>
        <Button onClick={() => router.push("/login")} size="lg" className="w-full justify-center">
          Sign in →
        </Button>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      overline="Reset"
      heading={
        <>
          New <em className="italic">password</em>, please.
        </>
      }
      side={{ quote: "Eight characters minimum. Beyond that, your call." }}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmPassword">Confirm</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Type it again"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        <Button type="submit" size="lg" disabled={isLoading} className="w-full justify-center mt-3">
          {isLoading ? "Resetting…" : "Set new password →"}
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="h-px w-24 bg-[var(--ink-300)] dark:bg-[var(--ink-700)] animate-pulse" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
