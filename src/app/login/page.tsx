"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from "@/lib/auth-client"
import { toast } from "sonner"
import { AuthShell } from "@/components/auth-shell"
import { getEnabledOAuthProviders } from "@/lib/oauth-config"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
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
      const { error } = await signIn.email({ email, password })
      if (error) throw error
      toast.success("Welcome back.")
      router.push("/dashboard")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Couldn’t sign in. Check the address and try again."
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: "google" | "github") => {
    setIsLoading(true)
    try {
      const { error } = await signIn.social({ provider, callbackURL: "/dashboard" })
      if (error) throw error
    } catch (error) {
      const message = error instanceof Error ? error.message : `Couldn’t sign in with ${provider}.`
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const oauthProviders = isMounted ? getEnabledOAuthProviders() : []
  const hasOAuthProviders = isMounted && oauthProviders.length > 0

  return (
    <AuthShell
      overline="Welcome back"
      heading={
        <>
          Sign <em className="italic">in</em>.
        </>
      }
      side={{
        quote: "Stopped using three apps for one job. Final form.",
        caption: "— Mira Q., brand designer · Brooklyn",
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
                onClick={() => handleSocialLogin(provider.id as "google" | "github")}
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
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <div className="text-[11px] text-[var(--fg-muted)] mt-0.5">
            <Link href="/forgot-password" className="hover:text-foreground transition-colors">
              Forgot it?
            </Link>
          </div>
        </div>
        <Button type="submit" size="lg" disabled={isLoading} className="w-full justify-center mt-3">
          {isLoading ? "Signing in…" : "Sign in →"}
        </Button>
      </form>

      <div className="mt-7 text-[12px] text-[var(--fg-muted)]">
        No account?{" "}
        <Link href="/register" className="text-foreground hover:underline">
          Make one — free.
        </Link>
      </div>
    </AuthShell>
  )
}
