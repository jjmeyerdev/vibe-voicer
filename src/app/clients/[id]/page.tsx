"use client"

import { ProtectedLayout } from "@/components/protected-layout"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { formatCurrency } from "@/lib/utils"
import { formatInvoiceDate } from "@/lib/date"
import { StatusBadge, type InvoiceStatus } from "@/components/status-badge"

type Client = {
  id: string
  name: string
  email: string | null
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  createdAt: string
  invoiceCount: number
  totalValue: number
  paidValue: number
  pendingValue: number
}

type ClientInvoice = {
  id: string
  invoiceNumber: string
  issueDate: string
  dueDate: string
  total: number
  status: InvoiceStatus
}

export default function ClientDetailPage() {
  const params = useParams()
  const clientId = params.id as string
  const [client, setClient] = useState<Client | null>(null)
  const [clientInvoices, setClientInvoices] = useState<ClientInvoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        setLoading(true)
        const [clientResponse, invoicesResponse] = await Promise.all([
          fetch(`/api/clients/${clientId}`, { credentials: "include" }),
          fetch(`/api/invoices?clientId=${clientId}`, { credentials: "include" }),
        ])
        if (clientResponse.ok) {
          const data = (await clientResponse.json()) as Client
          setClient(data)
        }
        if (invoicesResponse.ok) {
          const data = (await invoicesResponse.json()) as ClientInvoice[]
          setClientInvoices(data)
        }
      } catch (error) {
        console.error("Error fetching client data:", error)
      } finally {
        setLoading(false)
      }
    }
    if (clientId) fetchClientData()
  }, [clientId])

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center min-h-100">
          <div className="h-px w-24 bg-ink-300 dark:bg-ink-700 animate-pulse" />
        </div>
      </ProtectedLayout>
    )
  }

  if (!client) {
    return (
      <ProtectedLayout>
        <div className="flex flex-col items-center justify-center min-h-100 text-center gap-4">
          <div className="font-(--font-display) italic text-[40px]">Not here.</div>
          <p className="text-(--fg-muted)">That client doesn’t exist or was deleted.</p>
          <Button asChild>
            <Link href="/clients">← Back to clients</Link>
          </Button>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout title={client.name} subtitle={`${client.invoiceCount} invoice${client.invoiceCount === 1 ? "" : "s"} · ${formatCurrency(client.totalValue)} total`}>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <Button asChild variant="ghost" size="sm">
            <Link href="/clients">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to clients
            </Link>
          </Button>
          <Button asChild>
            <Link href="/invoices/new">
              <Plus className="h-4 w-4" />
              New invoice
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-3.5">
          <div className="bg-background border border-border rounded-[12px] p-5">
            <div className="t-overline">Contact</div>
            <dl className="mt-3 grid grid-cols-[100px_1fr] gap-y-2 text-[13px]">
              <dt className="text-(--fg-muted)">Email</dt>
              <dd>{client.email || <span className="text-(--fg-subtle)">—</span>}</dd>
              <dt className="text-(--fg-muted)">Phone</dt>
              <dd>{client.phone || <span className="text-(--fg-subtle)">—</span>}</dd>
              <dt className="text-(--fg-muted)">Address</dt>
              <dd className="leading-[1.5]">
                {client.address || <span className="text-(--fg-subtle)">—</span>}
                {(client.city || client.state) && (
                  <>
                    <br />
                    {[client.city, client.state, client.zipCode].filter(Boolean).join(" ")}
                  </>
                )}
                {client.country && (
                  <>
                    <br />
                    {client.country}
                  </>
                )}
              </dd>
            </dl>
          </div>

          <div className="bg-background border border-border rounded-[12px] p-5">
            <div className="t-overline">Money</div>
            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3 text-[13px]">
              <dt className="text-(--fg-muted)">Invoiced</dt>
              <dd className="text-right font-mono tabular-nums">{formatCurrency(client.totalValue)}</dd>
              <dt className="text-(--status-paid-fg)">Paid</dt>
              <dd className="text-right font-mono tabular-nums text-(--status-paid-fg)">{formatCurrency(client.paidValue)}</dd>
              <dt className="text-(--status-sent-fg)">Pending</dt>
              <dd className="text-right font-mono tabular-nums text-(--status-sent-fg)">{formatCurrency(client.pendingValue)}</dd>
            </dl>
          </div>
        </div>

        <div className="bg-background border border-border rounded-[12px] overflow-hidden">
          <div className="px-5 pt-5">
            <div className="t-overline">Invoice history</div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Issued</TableHead>
                <TableHead>Due</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientInvoices.length > 0 ? (
                clientInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono tabular-nums">
                      <Link href={`/invoices/${invoice.id}`} className="hover:underline">
                        {invoice.invoiceNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="text-(--fg-muted) text-[12px]">
                      {formatInvoiceDate(invoice.issueDate, { dateStyle: "medium" })}
                    </TableCell>
                    <TableCell className="text-(--fg-muted) text-[12px]">
                      {formatInvoiceDate(invoice.dueDate, { dateStyle: "medium" })}
                    </TableCell>
                    <TableCell data-num="true">{formatCurrency(Number(invoice.total))}</TableCell>
                    <TableCell>
                      <StatusBadge status={invoice.status} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="font-(--font-display) italic text-[20px] mb-2">No invoices yet.</div>
                    <Button asChild>
                      <Link href="/invoices/new">Create the first one</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </ProtectedLayout>
  )
}
