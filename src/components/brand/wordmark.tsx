import { cn } from "@/lib/utils"

type WordmarkProps = {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  showDot?: boolean
}

const SIZE_PX: Record<NonNullable<WordmarkProps["size"]>, number> = {
  sm: 18,
  md: 22,
  lg: 28,
  xl: 36,
}

export function Wordmark({ size = "md", className, showDot = true }: WordmarkProps) {
  const fontPx = SIZE_PX[size]
  return (
    <span
      className={cn("inline-flex items-baseline leading-none font-[var(--font-display)]", className)}
      style={{ fontSize: fontPx }}
    >
      <span>Vibe</span>
      <span className="italic">&nbsp;Voicer</span>
      {showDot && (
        <span
          aria-hidden
          className="inline-block bg-[var(--citrus)] border border-[var(--ink-900)] dark:border-transparent rounded-full"
          style={{
            width: `${fontPx * 0.18}px`,
            height: `${fontPx * 0.18}px`,
            marginLeft: `${fontPx * 0.04}px`,
            verticalAlign: "0.5em",
          }}
        />
      )}
    </span>
  )
}
