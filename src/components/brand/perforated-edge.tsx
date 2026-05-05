import { cn } from "@/lib/utils"

export function PerforatedEdge({ className }: { className?: string }) {
  return <div aria-hidden className={cn("perf-edge w-full", className)} />
}
