import { NextRequest, NextResponse } from "next/server"
import type { DiscountType, InvoiceStatus } from "@prisma/client"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { parseInvoiceDate } from "@/lib/date"
import { createInvoice, InvoiceCreationError } from "@/lib/invoices"

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

    const itemInputs = (items ?? []).map(item => ({
      description: typeof item.description === "string" ? item.description : "",
      quantity: toNumber(item.quantity, 1),
      unitPrice: toNumber(item.unitPrice, 0),
    }))

    const invoice = await createInvoice({
      userId: session.user.id,
      clientId,
      status,
      issueDate: parseInvoiceDate(issueDate),
      dueDate: dueDate ? parseInvoiceDate(dueDate) : parseInvoiceDate(issueDate),
      discountType,
      discountValue: toNumber(discountValue, 0),
      taxRate: toNumber(taxRate, 0),
      notes,
      paymentTerms,
      items: itemInputs,
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    if (error instanceof InvoiceCreationError) {
      if (error.code === "CLIENT_NOT_FOUND") {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
      if (error.code === "INVOICE_NUMBER_CONFLICT") {
        return NextResponse.json({ error: error.message }, { status: 409 })
      }
    }
    console.error("Error creating invoice:", error)
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    )
  }
}
