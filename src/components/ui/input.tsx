import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-[var(--fg-subtle)] selection:bg-[var(--selection-bg)] selection:text-[var(--selection-fg)]",
        "h-9 w-full min-w-0 px-3 py-2 text-[13px] rounded-[4px] border border-[var(--border-strong)] bg-[var(--bg-elevated)] text-foreground",
        "transition-[border-color] duration-[120ms] outline-none",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-1 focus-visible:border-[var(--ink-900)] dark:focus-visible:border-[var(--foreground)]",
        "aria-invalid:border-[var(--destructive)] aria-invalid:outline-[var(--destructive)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
