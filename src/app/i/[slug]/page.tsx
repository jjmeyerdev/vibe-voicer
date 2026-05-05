"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { formatCurrency, formatQuantity } from "@/lib/utils"
import { Wordmark } from "@/components/brand/wordmark"
import { ThemeSelector } from "@/components/theme-selector"
import { StatusBadge, type InvoiceStatus } from "@/components/status-badge"

type Address = {
  name?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
}

type Invoice = {
  id: string
  invoiceNumber: string
  publicSlug: string
  status: InvoiceStatus
  issueDate: string
  dueDate: string
  company: Address
  client: Address
  items: Array<{
    id: string
    description: string
    quantity: number
    unitPrice: number
    total: number
  }>
  subtotal: number
  discountType: string
  discountValue: number
  discountAmount: number
  taxRate: number
  taxAmount: number
  total: number
  notes?: string
}

function formatDate(input: string): string {
  return new Date(input).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

function formatAddressLines(addr: Address): string[] {
  const lines: string[] = []
  if (addr.email) lines.push(addr.email)
  if (addr.phone) lines.push(addr.phone)
  const cityState =
    addr.city && addr.state
      ? `${addr.city}, ${addr.state}${addr.zipCode ? " " + addr.zipCode : ""}`
      : addr.city || addr.state || addr.zipCode || ""
  if (addr.address) lines.push(addr.address)
  if (cityState) lines.push(cityState)
  if (addr.country) lines.push(addr.country)
  return lines
}

export default function PublicInvoicePage() {
  const params = useParams()
  const slug = params.slug as string
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/invoices/public/${slug}`)
        if (!response.ok) throw new Error("Invoice not found")
        const data = (await response.json()) as Invoice
        setInvoice(data)
      } catch (e) {
        console.error("Error fetching invoice:", e)
        setError("Invoice not found")
      } finally {
        setIsLoading(false)
      }
    }
    if (slug) fetchInvoice()
  }, [slug])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-px w-24 bg-ink-300 dark:bg-ink-700 animate-pulse" />
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center gap-4">
        <div className="font-display italic text-[40px]">No invoice here.</div>
        <p className="text-(--fg-muted) text-[14px] max-w-md">
          That share link is wrong, expired, or the invoice was deleted.
        </p>
        <Button asChild variant="secondary">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-(--bg-sunken)">
      <header className="flex items-center justify-between px-7 py-5 max-w-[920px] mx-auto">
        <Wordmark size="md" />
        <div className="flex items-center gap-2">
          <ThemeSelector />
          <Button asChild variant="ghost" size="sm">
            <Link href={`/api/invoices/public/${invoice.publicSlug}/pdf?style=color`}>
              <Download className="h-3.5 w-3.5" />
              Download PDF
            </Link>
          </Button>
        </div>
      </header>

      <main className="bg-background max-w-[920px] mx-auto px-12 py-12 border border-border rounded-none mb-16 shadow-(--shadow-raised)">
        {/* Top meta */}
        <div className="flex justify-between items-start gap-6 mb-9">
          <div>
            <div className="t-overline">Invoice</div>
            <h1 className="font-display text-[64px] leading-[1.0] tracking-[-0.02em] mt-1">
              <span className="font-mono text-[40px] tracking-[0]">{invoice.invoiceNumber}</span>
            </h1>
            <div className="text-[12px] text-(--fg-muted) mt-1.5">
              Issued {formatDate(invoice.issueDate)} · Due {formatDate(invoice.dueDate)}
            </div>
          </div>
          <StatusBadge status={invoice.status} />
        </div>

        {/* Parties */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-9">
          <div>
            <div className="t-overline">From</div>
            <div className="text-[16px] font-semibold mt-1.5">{invoice.company?.name}</div>
            <div className="text-[12px] text-(--fg-muted) mt-0.5 leading-[1.6]">
              {formatAddressLines(invoice.company).map((line, i) => (
                <span key={i}>
                  {line}
                  <br />
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="t-overline">Bill to</div>
            <div className="text-[16px] font-semibold mt-1.5">{invoice.client?.name}</div>
            <div className="text-[12px] text-(--fg-muted) mt-0.5 leading-[1.6]">
              {formatAddressLines(invoice.client).map((line, i) => (
                <span key={i}>
                  {line}
                  <br />
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Line items */}
        {invoice.items?.length > 0 && (
          <table className="w-full border-collapse mb-7">
            <thead>
              <tr>
                <th className="text-left t-overline pb-2 border-b border-border">Description</th>
                <th className="text-right t-overline pb-2 border-b border-border w-[70px]">Qty</th>
                <th className="text-right t-overline pb-2 border-b border-border w-[120px]">Rate</th>
                <th className="text-right t-overline pb-2 border-b border-border w-[140px]">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.id} className="border-b border-border">
                  <td className="py-3 text-[14px]">{item.description}</td>
                  <td className="py-3 text-right font-mono tabular-nums text-[13px]">
                    {formatQuantity(item.quantity)}
                  </td>
                  <td className="py-3 text-right font-mono tabular-nums text-[13px]">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="py-3 text-right font-mono tabular-nums text-[13px]">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Totals */}
        <div className="flex justify-end mb-3">
          <div className="w-[300px] flex flex-col gap-1.5 text-[13px]">
            {invoice.subtotal !== undefined && (
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums">{formatCurrency(invoice.subtotal)}</span>
              </div>
            )}
            {invoice.discountAmount > 0 && (
              <div className="flex justify-between text-(--fg-muted)">
                <span>
                  Discount{" "}
                  {invoice.discountType === "PERCENTAGE"
                    ? `(${invoice.discountValue}%)`
                    : `(${formatCurrency(invoice.discountValue)})`}
                </span>
                <span className="font-mono tabular-nums">-{formatCurrency(invoice.discountAmount)}</span>
              </div>
            )}
            {invoice.taxAmount > 0 && (
              <div className="flex justify-between text-(--fg-muted)">
                <span>Tax ({invoice.taxRate}%)</span>
                <span className="font-mono tabular-nums">{formatCurrency(invoice.taxAmount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-ink-900 dark:border-foreground mt-1.5 pt-2.5 text-[18px]">
              <span className="font-display italic text-[22px]">Total due</span>
              <span className="font-mono tabular-nums">{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* Pay CTA */}
        {invoice.status !== "PAID" && (
          <div className="mt-8 mb-2 flex flex-col items-center gap-2">
            <Button size="lg">Pay {formatCurrency(invoice.total)} →</Button>
            <div className="text-[12px] text-(--fg-muted)">Pay with card, ACH, or notify of payment by check.</div>
          </div>
        )}

        {invoice.notes && (
          <div className="mt-9 pt-5 border-t border-dashed border-(--border-strong) text-[12px] text-(--fg-muted)">
            {invoice.notes}
          </div>
        )}

        <div className="mt-7 pt-5 border-t border-dashed border-(--border-strong) flex justify-between text-[12px] text-(--fg-muted)">
          <span>Net 14.</span>
          <span className="font-mono">Powered by Vibe Voicer</span>
        </div>
      </main>
    </div>
  )
}
