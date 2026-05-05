import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { renderToBuffer } from "@react-pdf/renderer"
import { SimpleInvoicePDF } from "@/components/simple-invoice-pdf"

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
        user: {
          select: {
            name: true,
            email: true,
            settings: true,
          },
        },
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

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

    const serializedInvoice = {
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

    const buffer = await renderToBuffer(
      <SimpleInvoicePDF invoice={serializedInvoice} />
    )

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    )
  }
}
