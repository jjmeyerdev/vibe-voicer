"use client"

import { ProtectedLayout } from "@/components/protected-layout"
import { Button } from "@/components/ui/button"
import { Edit, Download, Send, Eye, Copy, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { formatCurrency, formatQuantity } from "@/lib/utils"
import { formatInvoiceDate } from "@/lib/date"
import { StatusBadge, type InvoiceStatus } from "@/components/status-badge"

type Invoice = {
  id: string
  invoiceNumber: string
  publicSlug: string
  status: InvoiceStatus
  issueDate: string
  dueDate: string
  client: {
    name: string
    email: string | null
    phone: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  items: Array<{
    id: string
    description: string
    quantity: number
    unitPrice: number
    total: number
  }>
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  notes: string
  createdAt: string
}

type TimelineStep = {
  label: string
  time: string
  state: "created" | "sent" | "viewed" | "paid"
  pending?: boolean
}

function buildTimeline(invoice: Invoice): TimelineStep[] {
  const created: TimelineStep = {
    label: "Invoice created",
    time: new Date(invoice.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }),
    state: "created",
  }
  const sent: TimelineStep = {
    label: "Sent to client",
    time: invoice.status === "DRAFT" ? "—" : formatInvoiceDate(invoice.issueDate, { dateStyle: "medium" }),
    state: "sent",
    pending: invoice.status === "DRAFT",
  }
  const viewed: TimelineStep = {
    label: "Client opened it",
    time: invoice.status === "PAID" || invoice.status === "VIEWED" || invoice.status === "OVERDUE" ? "Sometime after that." : "Not yet.",
    state: "viewed",
    pending: invoice.status === "DRAFT" || invoice.status === "SENT" || invoice.status === "PENDING",
  }
  const paid: TimelineStep = {
    label: "Marked as paid",
    time: invoice.status === "PAID" ? "Done." : "Pending.",
    state: "paid",
    pending: invoice.status !== "PAID",
  }
  return [created, sent, viewed, paid]
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const invoiceId = params.id as string
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/invoices/${invoiceId}`, { credentials: "include" })
        if (!response.ok) throw new Error("fetch failed")
        const data = (await response.json()) as Invoice
        setInvoice(data)
      } catch (error) {
        console.error("Error fetching invoice:", error)
        toast.error("Couldn’t load the invoice.")
      } finally {
        setLoading(false)
      }
    }
    if (invoiceId) fetchInvoice()
  }, [invoiceId])

  const copyPublicLink = () => {
    if (!invoice) return
    const url = `${window.location.origin}/i/${invoice.publicSlug}`
    navigator.clipboard.writeText(url)
    toast.success("Public link copied.")
  }

  const [sending, setSending] = useState(false)
  const sendToClient = async () => {
    if (!invoice || sending) return
    setSending(true)
    try {
      const publicUrl = `${window.location.origin}/i/${invoice.publicSlug}`
      // Flip status to SENT (no-op server-side if already SENT/VIEWED/PAID).
      if (invoice.status === "DRAFT") {
        const response = await fetch(`/api/invoices/${invoiceId}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "SENT" }),
        })
        if (!response.ok) throw new Error("Couldn’t mark it sent.")
        setInvoice({ ...invoice, status: "SENT" })
      }
      if (invoice.client.email) {
        const subject = `Invoice ${invoice.invoiceNumber}`
        const body =
          `Hi ${invoice.client.name},\n\n` +
          `Here's invoice ${invoice.invoiceNumber} for ${formatCurrency(invoice.total)}, ` +
          `due ${formatInvoiceDate(invoice.dueDate, { dateStyle: "medium" })}.\n\n` +
          `View and pay: ${publicUrl}\n\nThanks!`
        window.location.href =
          `mailto:${invoice.client.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
        toast.success("Marked as sent. Email draft opened.")
      } else {
        await navigator.clipboard.writeText(publicUrl).catch(() => {})
        toast.success("Marked as sent. Public link copied — paste it to your client.")
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Couldn’t send."
      toast.error(message)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center min-h-100">
          <div className="h-px w-24 bg-ink-300 dark:bg-ink-700 animate-pulse" />
        </div>
      </ProtectedLayout>
    )
  }

  if (!invoice) {
    return (
      <ProtectedLayout>
        <div className="flex flex-col items-center justify-center min-h-100 text-center gap-4">
          <div className="font-(--font-display) italic text-[40px]">Not here.</div>
          <p className="text-(--fg-muted)">That invoice doesn’t exist or was deleted.</p>
          <Button asChild>
            <Link href="/invoices">← Back to invoices</Link>
          </Button>
        </div>
      </ProtectedLayout>
    )
  }

  const timeline = buildTimeline(invoice)

  return (
    <ProtectedLayout
      title={invoice.invoiceNumber}
      subtitle={`${invoice.client.name} · ${formatCurrency(invoice.total)}`}
    >
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <Button asChild variant="ghost" size="sm">
            <Link href="/invoices">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to invoices
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <StatusBadge status={invoice.status} />
            <Button variant="secondary" size="default" asChild>
              <Link href={`/invoices/${invoiceId}/edit`}>
                <Edit className="h-3.5 w-3.5" />
                Edit
              </Link>
            </Button>
            <Button variant="secondary" size="default" onClick={copyPublicLink}>
              <Copy className="h-3.5 w-3.5" />
              Copy link
            </Button>
            <Button variant="secondary" size="default" asChild>
              <Link href={`/i/${invoice.publicSlug}`} target="_blank">
                <Eye className="h-3.5 w-3.5" />
                Preview
              </Link>
            </Button>
            <Button size="default" asChild>
              <a href={`/api/invoices/${invoiceId}/pdf`} download>
                <Download className="h-3.5 w-3.5" />
                Download PDF
              </a>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-3.5 items-start">
          {/* Timeline */}
          <aside className="bg-background border border-border rounded-[12px] p-5">
            <div className="t-overline">Timeline</div>
            <ul className="mt-3 list-none p-0 m-0">
              {timeline.map((step, idx) => (
                <li key={idx} className="grid grid-cols-[24px_1fr] gap-2.5 pb-4 relative">
                  <div className="relative">
                    {idx !== timeline.length - 1 && (
                      <span className="absolute left-[11px] top-2 -bottom-2.5 w-px bg-(--border-strong)" />
                    )}
                    <span
                      className={
                        "block w-2.5 h-2.5 rounded-full mx-auto mt-1.5 " +
                        (step.pending
                          ? "bg-transparent border border-dashed border-(--fg-subtle)"
                          : step.state === "paid"
                          ? "bg-(--status-paid-fg)"
                          : step.state === "viewed"
                          ? "bg-(--status-viewed-fg)"
                          : step.state === "sent"
                          ? "bg-(--status-sent-fg)"
                          : "bg-(--status-draft-fg)")
                      }
                    />
                  </div>
                  <div className={step.pending ? "opacity-55" : ""}>
                    <div className="text-[13px] leading-[1.4]">{step.label}</div>
                    <div className="text-[11px] text-(--fg-muted) mt-0.5">{step.time}</div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="t-overline mt-7">Quick actions</div>
            <div className="flex flex-col gap-2 mt-3">
              <Button
                variant="secondary"
                size="sm"
                className="justify-start"
                onClick={sendToClient}
                disabled={sending}
              >
                <Send className="h-3.5 w-3.5" />
                {sending ? "Sending…" : invoice.status === "DRAFT" ? "Send to client" : "Email client"}
              </Button>
              <Button variant="ghost" size="sm" className="justify-start" onClick={copyPublicLink}>
                <Copy className="h-3.5 w-3.5" />
                Copy public link
              </Button>
            </div>
          </aside>

          {/* Paper invoice */}
          <section className="bg-background border border-border p-9">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-border mb-5">
              <div>
                <div className="t-overline">Invoice</div>
                <div className="font-mono tabular-nums text-[24px] mt-1.5">{invoice.invoiceNumber}</div>
                <div className="text-[12px] text-(--fg-muted) mt-0.5 leading-[1.5]">
                  Issued {formatInvoiceDate(invoice.issueDate, { dateStyle: "medium" })}
                  <br />
                  Due {formatInvoiceDate(invoice.dueDate, { dateStyle: "medium" })}
                </div>
              </div>
              <div>
                <div className="t-overline">Bill to</div>
                <div className="font-(--font-display) text-[22px] leading-[1.1] mt-1.5">{invoice.client.name}</div>
                <div className="text-[12px] text-(--fg-muted) mt-1 leading-[1.5]">
                  {invoice.client.email && (
                    <>
                      {invoice.client.email}
                      <br />
                    </>
                  )}
                  {invoice.client.phone && (
                    <>
                      <br />
                      {invoice.client.phone}
                    </>
                  )}
                  <br />
                  {invoice.client.address}
                  {(invoice.client.city || invoice.client.state) && (
                    <>
                      <br />
                      {[invoice.client.city, invoice.client.state, invoice.client.zipCode].filter(Boolean).join(" ")}
                    </>
                  )}
                </div>
              </div>
            </div>

            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left t-overline pb-2 border-b border-border">Description</th>
                  <th className="text-right t-overline pb-2 border-b border-border w-15">Qty</th>
                  <th className="text-right t-overline pb-2 border-b border-border w-30">Rate</th>
                  <th className="text-right t-overline pb-2 border-b border-border w-35">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id} className="border-b border-border">
                    <td className="py-3 text-[14px]">{item.description}</td>
                    <td className="py-3 text-right font-mono tabular-nums text-[13px]">{formatQuantity(item.quantity)}</td>
                    <td className="py-3 text-right font-mono tabular-nums text-[13px]">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-3 text-right font-mono tabular-nums text-[13px]">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end mt-5">
              <div className="w-70 flex flex-col gap-1.5 text-[13px]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums">{formatCurrency(invoice.subtotal)}</span>
                </div>
                {invoice.taxAmount > 0 && (
                  <div className="flex justify-between text-(--fg-muted)">
                    <span>Tax ({invoice.taxRate}%)</span>
                    <span className="font-mono tabular-nums">{formatCurrency(invoice.taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-ink-900 dark:border-foreground mt-1.5 pt-2.5 text-[18px]">
                  <span className="font-(--font-display) italic text-[22px]">Total</span>
                  <span className="font-mono tabular-nums">{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </div>

            {invoice.notes && (
              <div className="mt-7 pt-5 border-t border-dashed border-(--border-strong) text-[12px] text-(--fg-muted) leading-[1.6]">
                {invoice.notes}
              </div>
            )}
          </section>
        </div>
      </div>
    </ProtectedLayout>
  )
}
