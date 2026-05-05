import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type InvoiceStatus =
  | "DRAFT"
  | "SENT"
  | "VIEWED"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED"
  | "PENDING"
  | "VOID"

type StatusVariant =
  | "draft"
  | "sent"
  | "viewed"
  | "paid"
  | "overdue"
  | "pending"
  | "void"

const STATUS_TO_VARIANT: Record<InvoiceStatus, StatusVariant> = {
  DRAFT: "draft",
  SENT: "sent",
  VIEWED: "viewed",
  PAID: "paid",
  OVERDUE: "overdue",
  PENDING: "pending",
  CANCELLED: "void",
  VOID: "void",
}

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  DRAFT: "draft",
  SENT: "sent",
  VIEWED: "viewed",
  PAID: "paid",
  OVERDUE: "overdue",
  PENDING: "pending",
  CANCELLED: "void",
  VOID: "void",
}

export function StatusBadge({
  status,
  className,
  showDot = true,
}: {
  status: InvoiceStatus
  className?: string
  showDot?: boolean
}) {
  const variant = STATUS_TO_VARIANT[status]
  return (
    <Badge variant={variant} className={cn(className)}>
      {showDot && (
        <span
          aria-hidden
          className="inline-block w-[5px] h-[5px] rounded-full bg-current"
        />
      )}
      {STATUS_LABEL[status]}
    </Badge>
  )
}

export type { InvoiceStatus }
