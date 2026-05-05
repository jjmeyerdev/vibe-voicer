"use client"

import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { useSession } from "@/lib/auth-client"
import { AppSidebar } from "./navigation"
import { AppTopbar } from "./app-topbar"

interface ProtectedLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

const ROUTE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Where the money is — and isn’t." },
  "/invoices": { title: "Invoices", subtitle: "Send. Track. Cash the check." },
  "/invoices/new": { title: "New invoice", subtitle: "Three lines and a button." },
  "/clients": { title: "Clients", subtitle: "Everyone you’ve worked with." },
  "/settings": { title: "Settings", subtitle: "Make it look like you." },
}

function defaultTitle(pathname: string): { title: string; subtitle?: string } {
  for (const key of Object.keys(ROUTE_TITLES).sort((a, b) => b.length - a.length)) {
    if (pathname === key || pathname.startsWith(key + "/")) {
      return ROUTE_TITLES[key]
    }
  }
  return { title: "Vibe Voicer" }
}

export function ProtectedLayout({ children, title, subtitle }: ProtectedLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, isPending } = useSession()

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login")
    }
  }, [session, isPending, router])

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-px w-24 bg-[var(--ink-300)] dark:bg-[var(--ink-700)] animate-pulse" />
      </div>
    )
  }

  if (!session) return null

  const meta = title ? { title, subtitle } : defaultTitle(pathname)

  return (
    <div className="min-h-screen bg-[var(--bg-sunken)] grid grid-cols-[248px_1fr]">
      <AppSidebar />
      <div className="flex flex-col min-w-0">
        <AppTopbar title={meta.title} subtitle={meta.subtitle} />
        <main className="px-7 pt-7 pb-20 flex-1">{children}</main>
      </div>
    </div>
  )
}
