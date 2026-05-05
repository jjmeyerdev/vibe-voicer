"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "@/lib/auth-client"
import { LayoutDashboard, Users, FileText, Settings, ChevronDown, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Mark } from "@/components/brand/mark"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

const items = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "·"

  return (
    <aside className="sticky top-0 h-screen w-62 flex flex-col p-3 border-r border-border bg-background">
      {/* Workspace switcher */}
      <div className="flex items-center gap-2.5 p-2.5 rounded-[10px] border border-border mb-4 cursor-pointer hover:bg-(--bg-sunken) transition-colors">
        <Mark size={32} />
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold truncate">{session?.user?.name ?? "Workspace"}</div>
          <div className="text-[11px] text-(--fg-muted)">Pro plan</div>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-(--fg-subtle)" />
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {items.map((it) => {
          const Icon = it.icon
          const active = pathname === it.href || pathname.startsWith(it.href + "/")
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-2 rounded-[6px] text-[13px] transition-colors duration-[120ms]",
                active
                  ? "bg-(--bg-sunken) text-foreground font-medium"
                  : "text-(--fg-muted) hover:bg-(--bg-sunken) hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{it.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer: profile */}
      <div className="flex flex-col gap-3.5 pt-3.5 border-t border-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 text-left">
              <div
                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-ink-900 dark:bg-ink-50 text-ink-50 dark:text-ink-900 text-[11px] font-semibold tracking-[0.04em]"
                aria-hidden
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-medium truncate">{session?.user?.name ?? "—"}</div>
                <div className="text-[11px] text-(--fg-muted) truncate">{session?.user?.email ?? ""}</div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-(--fg-subtle)" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-48">
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}

// Backwards-compat alias — some pages import { Navigation }
export const Navigation = AppSidebar
