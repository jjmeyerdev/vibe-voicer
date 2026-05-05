import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-(--fg-subtle) selection:bg-(--selection-bg) selection:text-(--selection-fg)",
        "h-9 w-full min-w-0 px-3 py-2 text-[13px] rounded-[4px] border border-(--border-strong) bg-(--bg-elevated) text-foreground",
        "transition-[border-color] duration-[120ms] outline-none",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-1 focus-visible:border-ink-900 dark:focus-visible:border-foreground",
        "aria-invalid:border-destructive aria-invalid:outline-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
