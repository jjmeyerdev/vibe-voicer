"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signUp, signIn } from "@/lib/auth-client"
import { toast } from "sonner"
import { AuthShell } from "@/components/auth-shell"
import { getEnabledOAuthProviders } from "@/lib/oauth-config"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!name.trim()) {
        toast.error("Add your name so invoices know who they’re from.")
        return
      }
      const { error } = await signUp.email({ email, password, name })
      if (error) {
        const message =
          (error as { message?: string }).message ??
          "Couldn’t make the account. Try again, or check the address."
        throw new Error(message)
      }
      toast.success("Account ready. Check your email.")
      router.push(`/check-email?email=${encodeURIComponent(email)}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went sideways."
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocial = async (provider: "google" | "github") => {
    setIsLoading(true)
    try {
      const { error } = await signIn.social({ provider, callbackURL: "/dashboard" })
      if (error) throw error
    } catch (error) {
      const message = error instanceof Error ? error.message : `Couldn’t sign up with ${provider}.`
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const oauthProviders = isMounted ? getEnabledOAuthProviders() : []
  const hasOAuthProviders = isMounted && oauthProviders.length > 0

  return (
    <AuthShell
      overline="Sign up"
      heading={
        <>
          Three <em className="italic">lines</em>.
          <br />
          Then you&rsquo;re in.
        </>
      }
      side={{
        quote: "Five invoices a month, on us. Forever.",
        caption: "No card. No “free trial.” Just five invoices.",
      }}
    >
      {hasOAuthProviders && (
        <>
          <div className="flex flex-col gap-2 mb-6">
            {oauthProviders.map((provider) => (
              <Button
                key={provider.id}
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => handleSocial(provider.id as "google" | "github")}
                disabled={isLoading}
                className="w-full justify-center"
              >
                Continue with {provider.name}
              </Button>
            ))}
          </div>
          <div className="relative my-6 text-center">
            <span className="absolute inset-x-0 top-1/2 h-px bg-[var(--border)]" />
            <span className="relative inline-block bg-[var(--background)] px-3 text-[11px] uppercase tracking-[0.1em] text-[var(--fg-muted)]">
              or
            </span>
          </div>
        </>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Your name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Anya Kowalski"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />
        </div>
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
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="At least 10 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={10}
            autoComplete="new-password"
          />
          <div className="text-[11px] text-[var(--fg-muted)] mt-0.5">
            We&rsquo;ll never email you about a &ldquo;Q3 product newsletter.&rdquo;
          </div>
        </div>
        <Button type="submit" size="lg" disabled={isLoading} className="w-full justify-center mt-3">
          {isLoading ? "Making it…" : "Make my account →"}
        </Button>
      </form>

      <div className="mt-7 text-[12px] text-[var(--fg-muted)]">
        Already here?{" "}
        <Link href="/login" className="text-foreground hover:underline">
          Sign in instead.
        </Link>
      </div>
    </AuthShell>
  )
}
