import type { Prisma } from "@prisma/client"

export type InvoiceWithPdfRelations = Prisma.InvoiceGetPayload<{
  include: {
    client: true
    items: true
    payments: true
    user: { select: { name: true; email: true; settings: true } }
  }
}>

export function serializeInvoiceForPdf(invoice: InvoiceWithPdfRelations) {
  const items = invoice.items.map(item => {
    const quantity = Number(item.quantity)
    const unitPrice = Number(item.unitPrice)
    return {
      ...item,
      quantity,
      unitPrice,
      total: quantity * unitPrice,
    }
  })

  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const taxRate = Number(invoice.taxRate)
  const taxAmount = subtotal * (taxRate / 100)
  const total = subtotal + taxAmount

  return {
    ...invoice,
    subtotal,
    discountValue: Number(invoice.discountValue),
    discountAmount: Number(invoice.discountAmount),
    taxRate,
    taxAmount,
    total,
    items,
    logo: invoice.user?.settings?.logo || null,
    user: {
      name: invoice.user?.name || "Your Company",
      email: invoice.user?.email || "your@email.com",
      settings: invoice.user?.settings || null,
    },
  }
}
