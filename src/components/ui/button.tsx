import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[background-color,color,border-color,transform] duration-[120ms] ease-[cubic-bezier(0.25,1,0.5,1)] active:scale-[0.98] active:duration-[80ms] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--citrus)] text-[var(--ink-900)] border border-[var(--ink-900)] font-semibold hover:bg-[var(--citrus-hover)] dark:hover:bg-[#F2FF6E]",
        secondary:
          "bg-[var(--bg-elevated)] text-foreground border border-[var(--border-strong)] hover:bg-[var(--bg-sunken)]",
        ghost:
          "bg-transparent text-foreground border border-transparent hover:bg-[var(--bg-sunken)]",
        outline:
          "bg-transparent text-foreground border border-[var(--ink-900)] hover:bg-[var(--bg-sunken)] dark:border-[var(--foreground)]",
        destructive:
          "bg-transparent text-[#94203A] border border-[#C8325040] hover:bg-[var(--status-overdue-tint)] dark:text-[#F09BA9] dark:border-[#F09BA940]",
        link: "text-foreground underline-offset-4 hover:underline border-0 px-0 h-auto",
      },
      size: {
        default: "h-9 px-4 text-[13px] rounded-[8px] gap-2",
        sm: "h-7 px-2.5 text-[12px] rounded-[6px] gap-1.5",
        lg: "h-11 px-5 text-[15px] rounded-[10px] gap-2",
        icon: "size-8 rounded-[8px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
