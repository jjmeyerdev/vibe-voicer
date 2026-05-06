import { timingSafeEqual } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { db } from "@/lib/db"
import { createInvoice } from "@/lib/invoices"
import { serializeInvoiceForPdf } from "@/lib/invoice-serialize"
import { SimpleInvoicePDF } from "@/components/simple-invoice-pdf"
import { sendInvoiceEmail } from "@/lib/mail"
import { formatInvoiceDate } from "@/lib/date"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const RECURRING_CLIENT_NAME = "Rachel"
const DEFAULT_RECURRING_USER_EMAIL = "jay.designs716@gmail.com"
const EMAIL_SUBJECT = "Invoice for Apple & Chill"
const PAYMENT_TERMS = "Net 30"

const PDF_INCLUDE = {
  client: true,
  items: true,
  payments: true,
  user: { select: { name: true, email: true, settings: true } },
} as const

function renderInvoicePdf(
  serialized: ReturnType<typeof serializeInvoiceForPdf>
): Promise<Buffer> {
  return renderToBuffer(<SimpleInvoicePDF invoice={serialized} />)
}

function authorize(request: NextRequest): boolean {
  const expected = process.env.CRON_SECRET
  if (!expected) return false
  const header = request.headers.get("authorization") ?? ""
  const provided = header.startsWith("Bearer ") ? header.slice(7) : ""
  const a = Buffer.from(expected)
  const b = Buffer.from(provided)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

function getNyYearMonth(now: Date): { y: number; m: number } {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
  })
  const parts = Object.fromEntries(
    fmt.formatToParts(now).map(p => [p.type, p.value])
  )
  return { y: Number(parts.year), m: Number(parts.month) }
}

function formatUsd(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n)
}

function buildEmailBody(args: {
  clientName: string
  invoiceNumber: string
  issueDate: Date
  dueDate: Date
  total: number
}): string {
  const issue = formatInvoiceDate(args.issueDate)
  const due = formatInvoiceDate(args.dueDate)
  const amount = formatUsd(args.total)
  return [
    `Hi ${args.clientName},`,
    "",
    "I hope you're doing well.",
    "",
    `Please find attached invoice #${args.invoiceNumber} for Apple & Chill, in the amount of ${amount}.`,
    "",
    "Invoice details:",
    "",
    `- Invoice Number: ${args.invoiceNumber}`,
    `- Invoice Date: ${issue}`,
    `- Amount Due: ${amount}`,
    `- Payment Due Date: ${due}`,
    `- Payment Terms: ${PAYMENT_TERMS}`,
    "",
    "Please let us know if you have any questions or need any additional information.",
    "",
    "Thank you for your business.",
    "",
    "Best regards,",
    "Josh",
    "Loan 🦈",
  ].join("\n")
}

export async function GET(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const dryRun = request.nextUrl.searchParams.get("dryRun") === "1"

  try {
    const userEmail =
      process.env.RECURRING_USER_EMAIL ?? DEFAULT_RECURRING_USER_EMAIL
    const user = await db.user.findUnique({ where: { email: userEmail } })
    if (!user) {
      return NextResponse.json(
        { error: "Recurring user not found", email: userEmail },
        { status: 500 }
      )
    }

    const { y, m } = getNyYearMonth(new Date())
    const issueDate = new Date(Date.UTC(y, m - 1, 1))
    const dueDate = new Date(Date.UTC(y, m - 1, 1 + 30))
    const monthStart = issueDate
    const nextMonthStart = new Date(Date.UTC(y, m, 1))

    const client = await db.client.findFirst({
      where: { userId: user.id, name: RECURRING_CLIENT_NAME },
    })
    if (!client) {
      return NextResponse.json(
        { error: `Client '${RECURRING_CLIENT_NAME}' not found` },
        { status: 404 }
      )
    }

    const override = process.env.MAIL_TO_OVERRIDE
    const recipient =
      override && override.length > 0 ? override : client.email ?? null
    if (!recipient) {
      return NextResponse.json(
        { error: "Client has no email and no MAIL_TO_OVERRIDE set" },
        { status: 422 }
      )
    }

    // Idempotency guard A — already-sent invoice for this month
    const alreadySent = await db.invoice.findFirst({
      where: {
        userId: user.id,
        clientId: client.id,
        status: { not: "DRAFT" },
        issueDate: { gte: monthStart, lt: nextMonthStart },
      },
      select: { id: true, invoiceNumber: true },
    })
    if (alreadySent && !dryRun) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: "already_created",
        invoiceId: alreadySent.id,
        invoiceNumber: alreadySent.invoiceNumber,
      })
    }

    // Idempotency guard B — recover from a previous run that created the
    // DRAFT but failed before sending the email.
    const draftInProgress = await db.invoice.findFirst({
      where: {
        userId: user.id,
        clientId: client.id,
        status: "DRAFT",
        issueDate: { gte: monthStart, lt: nextMonthStart },
      },
      include: PDF_INCLUDE,
    })

    // Template = latest non-DRAFT invoice on this client
    const template = await db.invoice.findFirst({
      where: {
        userId: user.id,
        clientId: client.id,
        status: { not: "DRAFT" },
      },
      orderBy: [{ issueDate: "desc" }, { createdAt: "desc" }],
      include: { items: true },
    })
    if (!template) {
      return NextResponse.json(
        { error: "No previous invoice to clone from" },
        { status: 422 }
      )
    }

    // DRY RUN — render off the template with new dates spliced; no DB writes,
    // no email send.
    if (dryRun) {
      const previewItems = template.items.map(i => ({
        ...i,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
        total: Number(i.quantity) * Number(i.unitPrice),
      }))
      const previewSubtotal = previewItems.reduce((s, i) => s + i.total, 0)
      const previewTaxRate = Number(template.taxRate)
      const previewDiscountValue = Number(template.discountValue)
      const previewDiscountAmount =
        previewDiscountValue > 0
          ? template.discountType === "PERCENTAGE"
            ? (previewSubtotal * previewDiscountValue) / 100
            : previewDiscountValue
          : 0
      const previewTaxAmount =
        ((previewSubtotal - previewDiscountAmount) * previewTaxRate) / 100
      const previewTotal =
        previewSubtotal - previewDiscountAmount + previewTaxAmount

      const previewBody = buildEmailBody({
        clientName: client.name,
        invoiceNumber: alreadySent?.invoiceNumber ?? "INV-NEXT",
        issueDate,
        dueDate,
        total: previewTotal,
      })

      // Render a representative PDF off the template (with new dates).
      const reloaded = await db.invoice.findUniqueOrThrow({
        where: { id: template.id },
        include: PDF_INCLUDE,
      })
      const previewSerialized = {
        ...serializeInvoiceForPdf(reloaded),
        issueDate,
        dueDate,
        paymentTerms: PAYMENT_TERMS,
      }
      const previewPdf = await renderInvoicePdf(previewSerialized)

      return NextResponse.json({
        dryRun: true,
        wouldSendTo: recipient,
        clientEmail: client.email,
        override: override || null,
        subject: EMAIL_SUBJECT,
        bodyPreview: previewBody,
        templateInvoiceId: template.id,
        templateInvoiceNumber: template.invoiceNumber,
        existingForMonth: alreadySent ?? null,
        existingDraftForMonth: draftInProgress?.id ?? null,
        pdfBytes: previewPdf.length,
        issueDate: issueDate.toISOString(),
        dueDate: dueDate.toISOString(),
      })
    }

    // Either reuse the in-progress DRAFT or create a fresh one.
    let invoiceId: string
    if (draftInProgress) {
      invoiceId = draftInProgress.id
    } else {
      const created = await createInvoice({
        userId: user.id,
        clientId: client.id,
        status: "DRAFT",
        issueDate,
        dueDate,
        discountType: template.discountType,
        discountValue: Number(template.discountValue),
        taxRate: Number(template.taxRate),
        notes: template.notes,
        paymentTerms: PAYMENT_TERMS,
        items: template.items.map(i => ({
          description: i.description,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
        })),
      })
      invoiceId = created.id
    }

    const invoice = await db.invoice.findUniqueOrThrow({
      where: { id: invoiceId },
      include: PDF_INCLUDE,
    })

    const serialized = serializeInvoiceForPdf(invoice)
    const pdfBuffer = await renderInvoicePdf(serialized)

    const body = buildEmailBody({
      clientName: client.name,
      invoiceNumber: invoice.invoiceNumber,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      total: serialized.total,
    })

    const { messageId, deliveredTo } = await sendInvoiceEmail({
      to: recipient,
      subject: EMAIL_SUBJECT,
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
    console.error("Recurring invoice cron failed:", error)
    return NextResponse.json(
      {
        error: "Recurring invoice cron failed",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
