import nodemailer, { type Transporter } from "nodemailer"

let cachedTransport: Transporter | null = null

function getTransport(): Transporter {
  if (cachedTransport) return cachedTransport
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD
  if (!user || !pass) {
    throw new Error(
      "Gmail SMTP not configured: set GMAIL_USER and GMAIL_APP_PASSWORD"
    )
  }
  cachedTransport = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  })
  return cachedTransport
}

export type InvoiceEmailAttachment = {
  filename: string
  content: Buffer
  contentType: "application/pdf"
}

export async function sendInvoiceEmail(args: {
  to: string
  subject: string
  body: string
  attachment: InvoiceEmailAttachment
}): Promise<{ messageId: string; deliveredTo: string }> {
  const override = process.env.MAIL_TO_OVERRIDE
  const deliveredTo = override && override.length > 0 ? override : args.to
  const from = process.env.MAIL_FROM || process.env.GMAIL_USER
  if (!from) {
    throw new Error("MAIL_FROM (or GMAIL_USER) must be set")
  }

  const info = await getTransport().sendMail({
    from,
    to: deliveredTo,
    subject: args.subject,
    text: args.body,
    attachments: [
      {
        filename: args.attachment.filename,
        content: args.attachment.content,
        contentType: args.attachment.contentType,
      },
    ],
  })

  return { messageId: info.messageId, deliveredTo }
}
