import { cn } from "@/lib/utils"

type MarkProps = {
  size?: number
  className?: string
}

export function Mark({ size = 32, className }: MarkProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center bg-ink-900 dark:bg-citrus rounded-[8px] relative",
        className
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <span
        className="font-display italic text-citrus dark:text-ink-900 leading-none"
        style={{ fontSize: size * 0.7 }}
      >
        V
      </span>
      <span
        className="absolute bg-citrus dark:bg-ink-900 rounded-full"
        style={{
          width: size * 0.11,
          height: size * 0.11,
          right: size * 0.18,
          top: size * 0.16,
        }}
      />
    </span>
  )
}
