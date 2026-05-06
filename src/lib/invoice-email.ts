import { formatCurrency } from "@/lib/utils"
import { formatInvoiceDate } from "@/lib/date"

type DefaultEmailInput = {
  invoiceNumber: string
  clientName: string
  total: number
  dueDate: Date | string
  publicUrl: string
}

export function defaultInvoiceEmail(input: DefaultEmailInput): {
  subject: string
  body: string
} {
  const subject = `Invoice ${input.invoiceNumber}`
  const body =
    `Hi ${input.clientName},\n\n` +
    `Here's invoice ${input.invoiceNumber} for ${formatCurrency(input.total)}, ` +
    `due ${formatInvoiceDate(input.dueDate, { dateStyle: "medium" })}.\n\n` +
    `View and pay: ${input.publicUrl}\n\n` +
    `Thanks!`
  return { subject, body }
}
