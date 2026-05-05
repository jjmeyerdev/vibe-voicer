import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-[var(--fg-subtle)]",
        "field-sizing-content min-h-16 w-full rounded-[4px] border border-[var(--border-strong)] bg-[var(--bg-elevated)] text-foreground px-3 py-2 text-[13px]",
        "transition-[border-color] duration-[120ms] outline-none",
        "focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-1 focus-visible:border-[var(--ink-900)] dark:focus-visible:border-[var(--foreground)]",
        "aria-invalid:border-[var(--destructive)] aria-invalid:outline-[var(--destructive)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
