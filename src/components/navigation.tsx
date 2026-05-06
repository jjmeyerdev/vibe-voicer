"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useSession, signOut } from "@/lib/auth-client";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  ChevronDown,
  LogOut,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsClient } from "@/lib/use-is-client";
import { Mark } from "@/components/brand/mark";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

const items = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const mounted = useIsClient();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <aside className="sticky top-0 h-screen w-62 flex flex-col p-3 border-r border-border bg-background">
      {/* Workspace switcher + user menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2.5 p-2.5 rounded-[10px] border border-border mb-4 cursor-pointer hover:bg-(--bg-sunken) transition-colors text-left"
          >
            <Mark size={32} />
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold truncate">
                {session?.user?.name ?? "Workspace"}
              </div>
              <div className="text-[11px] text-(--fg-muted)">Pro plan</div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-(--fg-subtle)" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-56">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Sun className="h-4 w-4" />
              <span>Theme</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={mounted ? theme : undefined}
                onValueChange={setTheme}
              >
                <DropdownMenuRadioItem value="system">
                  <Monitor className="h-4 w-4" />
                  <span>System</span>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="light">
                  <Sun className="h-4 w-4" />
                  <span>Light</span>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark">
                  <Moon className="h-4 w-4" />
                  <span>Dark</span>
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {items.map((it) => {
          const Icon = it.icon;
          const active =
            pathname === it.href || pathname.startsWith(it.href + "/");
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-2 rounded-[6px] text-[13px] transition-colors duration-[120ms]",
                active
                  ? "bg-(--bg-sunken) text-foreground font-medium"
                  : "text-(--fg-muted) hover:bg-(--bg-sunken) hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{it.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

// Backwards-compat alias — some pages import { Navigation }
export const Navigation = AppSidebar;
