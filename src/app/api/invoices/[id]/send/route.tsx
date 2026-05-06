import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { serializeInvoiceForPdf } from "@/lib/invoice-serialize"
import { SimpleInvoicePDF } from "@/components/simple-invoice-pdf"
import { sendInvoiceEmail } from "@/lib/mail"
import { defaultInvoiceEmail } from "@/lib/invoice-email"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const PDF_INCLUDE = {
  client: true,
  items: true,
  payments: true,
  user: { select: { name: true, email: true, settings: true } },
} as const

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const invoice = await db.invoice.findFirst({
    where: { id, userId: session.user.id },
    include: PDF_INCLUDE,
  })
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
  }

  const override = process.env.MAIL_TO_OVERRIDE
  const recipient =
    override && override.length > 0 ? override : invoice.client.email ?? null
  if (!recipient) {
    return NextResponse.json(
      { error: "Client has no email on file." },
      { status: 422 }
    )
  }

  let parsed: { subject?: unknown; body?: unknown }
  try {
    parsed = (await request.json()) as { subject?: unknown; body?: unknown }
  } catch {
    parsed = {}
  }

  const origin = request.nextUrl.origin
  const publicUrl = `${origin}/i/${invoice.publicSlug}`
  const defaults = defaultInvoiceEmail({
    invoiceNumber: invoice.invoiceNumber,
    clientName: invoice.client.name,
    total: Number(invoice.total),
    dueDate: invoice.dueDate,
    publicUrl,
  })

  const subject =
    typeof parsed.subject === "string" && parsed.subject.trim().length > 0
      ? parsed.subject
      : defaults.subject
  const body =
    typeof parsed.body === "string" && parsed.body.trim().length > 0
      ? parsed.body
      : defaults.body

  try {
    const serialized = serializeInvoiceForPdf(invoice)
    const pdfBuffer = await renderToBuffer(
      <SimpleInvoicePDF invoice={serialized} />
    )

    const { messageId, deliveredTo } = await sendInvoiceEmail({
      to: recipient,
      subject,
      body,
      attachment: {
        filename: `invoice-${invoice.invoiceNumber}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    })

    await db.invoice.update({
      where: { id: invoice.id },
      data: { status: "SENT" },
    })

    return NextResponse.json({
      ok: true,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      deliveredTo,
      messageId,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Send failed"
    const isConfig = message.startsWith("Gmail SMTP not configured") ||
      message.startsWith("MAIL_FROM")
    console.error("Manual invoice send failed:", error)
    return NextResponse.json(
      { error: message, code: isConfig ? "SMTP_NOT_CONFIGURED" : "SEND_FAILED" },
      { status: isConfig ? 503 : 500 }
    )
  }
}
