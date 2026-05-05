import { randomUUID } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { Prisma, type DiscountType, type InvoiceStatus } from "@prisma/client"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

type IncomingItem = {
  description?: unknown
  quantity?: unknown
  unitPrice?: unknown
}

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const parsed = parseFloat(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }
  return fallback
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const clientId = request.nextUrl.searchParams.get("clientId")

    const invoices = await db.invoice.findMany({
      where: {
        userId: session.user.id,
        ...(clientId ? { clientId } : {}),
      },
      include: {
        client: true,
        items: true,
        payments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const serializedInvoices = invoices.map(invoice => ({
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
    }))

    return NextResponse.json(serializedInvoices)
  } catch (error) {
    console.error("Error fetching invoices:", error)
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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
    }

    if (!clientId || typeof clientId !== "string") {
      return NextResponse.json({ error: "Client is required" }, { status: 400 })
    }
    if (!issueDate) {
      return NextResponse.json({ error: "Issue date is required" }, { status: 400 })
    }

    const clientOwned = await db.client.findFirst({
      where: { id: clientId, userId: session.user.id },
      select: { id: true },
    })
    if (!clientOwned) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    const itemRows = (items ?? []).map(item => {
      const quantity = toNumber(item.quantity, 1)
      const unitPrice = toNumber(item.unitPrice, 0)
      return {
        description: typeof item.description === "string" ? item.description : "",
        quantity,
        unitPrice,
        total: quantity * unitPrice,
      }
    })

    const subtotal = itemRows.reduce((sum, item) => sum + item.total, 0)
    const discountTypeFinal: DiscountType = discountType ?? "PERCENTAGE"
    const discountValueNum = toNumber(discountValue, 0)
    const discountAmount =
      discountValueNum > 0
        ? discountTypeFinal === "PERCENTAGE"
          ? (subtotal * discountValueNum) / 100
          : discountValueNum
        : 0
    const taxRateNum = toNumber(taxRate, 0)
    const taxAmount = ((subtotal - discountAmount) * taxRateNum) / 100
    const total = subtotal - discountAmount + taxAmount

    const invoice = await db.$transaction(async tx => {
      const settings = await tx.settings.upsert({
        where: { userId: session.user.id },
        update: { nextInvoiceNumber: { increment: 1 } },
        create: { userId: session.user.id, nextInvoiceNumber: 2 },
      })
      const number = settings.nextInvoiceNumber - 1
      const invoiceNumber = `${settings.invoicePrefix}-${number.toString().padStart(4, "0")}`

      return tx.invoice.create({
        data: {
          userId: session.user.id,
          clientId,
          invoiceNumber,
          publicSlug: randomUUID(),
          status: status ?? "DRAFT",
          issueDate: new Date(issueDate),
          dueDate: dueDate ? new Date(dueDate) : new Date(issueDate),
          subtotal,
          discountType: discountTypeFinal,
          discountValue: discountValueNum,
          discountAmount,
          taxRate: taxRateNum,
          taxAmount,
          total,
          notes,
          paymentTerms,
          items: { create: itemRows },
        },
        include: {
          client: true,
          items: true,
          payments: true,
        },
      })
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Invoice number collision — please retry" },
        { status: 409 }
      )
    }
    console.error("Error creating invoice:", error)
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    )
  }
}
