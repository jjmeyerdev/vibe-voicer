import { NextRequest, NextResponse } from "next/server"
import type { DiscountType, InvoiceStatus } from "@prisma/client"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

type IncomingItem = {
  description?: unknown
  quantity?: unknown
  unitPrice?: unknown
}

type IncomingOriginalItem = IncomingItem & { id?: unknown }

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const parsed = parseFloat(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }
  return fallback
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const invoice = await db.invoice.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        client: true,
        items: true,
        payments: true,
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    const serializedInvoice = {
      ...invoice,
      subtotal: Number(invoice.subtotal),
      discountValue: Number(invoice.discountValue),
      discountAmount: Number(invoice.discountAmount),
      taxRate: Number(invoice.taxRate),
      taxAmount: Number(invoice.taxAmount),
      total: Number(invoice.total),
      items: invoice.items.map(item => ({
        ...item,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        total: Number(item.total),
      })),
      payments: invoice.payments.map(payment => ({
        ...payment,
        amount: Number(payment.amount),
      })),
    }

    return NextResponse.json(serializedInvoice)
  } catch (error) {
    console.error("Error fetching invoice:", error)
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const {
      clientId,
      status,
      issueDate,
      dueDate,
      discountType,
      discountValue,
      taxRate,
      notes,
      paymentTerms,
      items,
      originalItems,
    } = body as {
      clientId?: string
      status?: InvoiceStatus
      issueDate?: string
      dueDate?: string
      discountType?: DiscountType
      discountValue?: unknown
      taxRate?: unknown
      notes?: string
      paymentTerms?: string
      items?: IncomingItem[]
      originalItems?: IncomingOriginalItem[]
    }

    const existingInvoice = await db.invoice.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      select: { id: true, clientId: true },
    })

    if (!existingInvoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    if (clientId && clientId !== existingInvoice.clientId) {
      const clientOwned = await db.client.findFirst({
        where: { id: clientId, userId: session.user.id },
        select: { id: true },
      })
      if (!clientOwned) {
        return NextResponse.json({ error: "Client not found" }, { status: 404 })
      }
    }

    const updated = await db.$transaction(async tx => {
      if (originalItems && originalItems.length > 0) {
        for (const item of originalItems) {
          if (typeof item.id !== "string" || !item.id) {
            throw new ItemNotFoundError()
          }
          const quantity = toNumber(item.quantity, 0)
          const unitPrice = toNumber(item.unitPrice, 0)
          const result = await tx.invoiceItem.updateMany({
            where: { id: item.id, invoiceId: id },
            data: {
              description:
                typeof item.description === "string" ? item.description : "",
              quantity,
              unitPrice,
              total: quantity * unitPrice,
            },
          })
          if (result.count === 0) {
            throw new ItemNotFoundError()
          }
        }
      }

      if (items && items.length > 0) {
        await tx.invoiceItem.createMany({
          data: items.map(item => {
            const quantity = toNumber(item.quantity, 1)
            const unitPrice = toNumber(item.unitPrice, 0)
            return {
              invoiceId: id,
              description:
                typeof item.description === "string" ? item.description : "",
              quantity,
              unitPrice,
              total: quantity * unitPrice,
            }
          }),
        })
      }

      const liveItems = await tx.invoiceItem.findMany({
        where: { invoiceId: id },
        select: { quantity: true, unitPrice: true },
      })
      const subtotal = liveItems.reduce(
        (sum, item) => sum + Number(item.quantity) * Number(item.unitPrice),
        0
      )
      const discountTypeFinal: DiscountType | undefined = discountType
      const discountValueNum =
        discountValue !== undefined ? toNumber(discountValue, 0) : undefined
      const taxRateNum = taxRate !== undefined ? toNumber(taxRate, 0) : undefined

      const effectiveDiscountType = discountTypeFinal ?? "PERCENTAGE"
      const effectiveDiscountValue = discountValueNum ?? 0
      const discountAmount =
        effectiveDiscountValue > 0
          ? effectiveDiscountType === "PERCENTAGE"
            ? (subtotal * effectiveDiscountValue) / 100
            : effectiveDiscountValue
          : 0
      const effectiveTaxRate = taxRateNum ?? 0
      const taxAmount = ((subtotal - discountAmount) * effectiveTaxRate) / 100
      const total = subtotal - discountAmount + taxAmount

      return tx.invoice.update({
        where: { id },
        data: {
          ...(clientId ? { clientId } : {}),
          ...(status ? { status } : {}),
          ...(issueDate ? { issueDate: new Date(issueDate) } : {}),
          ...(dueDate ? { dueDate: new Date(dueDate) } : {}),
          ...(discountTypeFinal ? { discountType: discountTypeFinal } : {}),
          ...(discountValueNum !== undefined
            ? { discountValue: discountValueNum }
            : {}),
          ...(taxRateNum !== undefined ? { taxRate: taxRateNum } : {}),
          ...(notes !== undefined ? { notes } : {}),
          ...(paymentTerms !== undefined ? { paymentTerms } : {}),
          subtotal,
          discountAmount,
          taxAmount,
          total,
        },
        include: {
          client: true,
          items: true,
          payments: true,
        },
      })
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof ItemNotFoundError) {
      return NextResponse.json(
        { error: "Invoice item not found" },
        { status: 404 }
      )
    }
    console.error("Error updating invoice:", error)
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const existingInvoice = await db.invoice.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingInvoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    await db.invoice.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Invoice deleted successfully" })
  } catch (error) {
    console.error("Error deleting invoice:", error)
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 }
    )
  }
}

class ItemNotFoundError extends Error {
  constructor() {
    super("Invoice item not found")
    this.name = "ItemNotFoundError"
  }
}
