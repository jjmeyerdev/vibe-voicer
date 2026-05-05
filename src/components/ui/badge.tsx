import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center gap-[5px] rounded-[999px] px-[9px] py-[2px] text-[11px] font-medium font-sans w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 [&>svg]:pointer-events-none transition-[color,background-color] duration-[120ms]",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--bg-sunken)] text-foreground border border-transparent",
        secondary:
          "bg-[var(--bg-sunken)] text-[var(--fg-muted)] border border-transparent",
        outline:
          "bg-transparent text-foreground border border-[var(--border-strong)]",
        destructive:
          "bg-[var(--status-overdue-bg)] text-[var(--status-overdue-fg)] border border-transparent",
        // Invoice status variants — lowercase labels
        draft:
          "bg-[var(--status-draft-bg)] text-[var(--status-draft-fg)] border border-transparent lowercase",
        sent:
          "bg-[var(--status-sent-bg)] text-[var(--status-sent-fg)] border border-transparent lowercase",
        viewed:
          "bg-[var(--status-viewed-bg)] text-[var(--status-viewed-fg)] border border-transparent lowercase",
        paid:
          "bg-[var(--status-paid-bg)] text-[var(--status-paid-fg)] border border-transparent lowercase",
        overdue:
          "bg-[var(--status-overdue-bg)] text-[var(--status-overdue-fg)] border border-transparent lowercase",
        pending:
          "bg-[var(--status-pending-bg)] text-[var(--status-pending-fg)] border border-transparent lowercase",
        void:
          "bg-[var(--status-void-bg)] text-[var(--status-void-fg)] border border-transparent lowercase",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
