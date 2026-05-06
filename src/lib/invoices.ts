import { randomUUID } from "node:crypto"
import { Prisma, type DiscountType, type InvoiceStatus } from "@prisma/client"
import { db } from "@/lib/db"

export type CreateInvoiceItemInput = {
  description: string
  quantity: number
  unitPrice: number
}

export type CreateInvoiceInput = {
  userId: string
  clientId: string
  status?: InvoiceStatus
  issueDate: Date
  dueDate: Date
  discountType?: DiscountType
  discountValue?: number
  taxRate?: number
  notes?: string | null
  paymentTerms?: string | null
  items: CreateInvoiceItemInput[]
}

export type InvoiceCreationErrorCode =
  | "CLIENT_NOT_FOUND"
  | "INVOICE_NUMBER_CONFLICT"

export class InvoiceCreationError extends Error {
  constructor(
    public readonly code: InvoiceCreationErrorCode,
    message: string
  ) {
    super(message)
    this.name = "InvoiceCreationError"
  }
}

export type CreatedInvoice = Prisma.InvoiceGetPayload<{
  include: { client: true; items: true; payments: true }
}>

export async function createInvoice(
  input: CreateInvoiceInput
): Promise<CreatedInvoice> {
  const {
    userId,
    clientId,
    status = "DRAFT",
    issueDate,
    dueDate,
    discountType = "PERCENTAGE",
    discountValue = 0,
    taxRate = 0,
    notes,
    paymentTerms,
    items,
  } = input

  const clientOwned = await db.client.findFirst({
    where: { id: clientId, userId },
    select: { id: true },
  })
  if (!clientOwned) {
    throw new InvoiceCreationError("CLIENT_NOT_FOUND", "Client not found")
  }

  const itemRows = items.map(item => ({
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    total: item.quantity * item.unitPrice,
  }))

  const subtotal = itemRows.reduce((sum, item) => sum + item.total, 0)
  const discountAmount =
    discountValue > 0
      ? discountType === "PERCENTAGE"
        ? (subtotal * discountValue) / 100
        : discountValue
      : 0
  const taxAmount = ((subtotal - discountAmount) * taxRate) / 100
  const total = subtotal - discountAmount + taxAmount

  try {
    return await db.$transaction(async tx => {
      const settings = await tx.settings.upsert({
        where: { userId },
        update: { nextInvoiceNumber: { increment: 1 } },
        create: { userId, nextInvoiceNumber: 2 },
      })
      const number = settings.nextInvoiceNumber - 1
      const invoiceNumber = `${settings.invoicePrefix}-${number.toString().padStart(4, "0")}`

      return tx.invoice.create({
        data: {
          userId,
          clientId,
          invoiceNumber,
          publicSlug: randomUUID(),
          status,
          issueDate,
          dueDate,
          subtotal,
          discountType,
          discountValue,
          discountAmount,
          taxRate,
          taxAmount,
          total,
          notes: notes ?? undefined,
          paymentTerms: paymentTerms ?? undefined,
          items: { create: itemRows },
        },
        include: {
          client: true,
          items: true,
          payments: true,
        },
      })
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new InvoiceCreationError(
        "INVOICE_NUMBER_CONFLICT",
        "Invoice number collision — please retry"
      )
    }
    throw error
  }
}
