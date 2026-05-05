"use client"

import { ProtectedLayout } from "@/components/protected-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Download, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { formatCurrency, cn } from "@/lib/utils"
import { StatusBadge, type InvoiceStatus } from "@/components/status-badge"

type Invoice = {
  id: string
  invoiceNumber: string
  client: { name: string }
  issueDate: string
  dueDate: string
  total: number | string
  status: InvoiceStatus
  publicSlug: string
}

type FilterKey = "all" | "draft" | "sent" | "paid" | "overdue"

const filters: { k: FilterKey; label: string }[] = [
  { k: "all", label: "All" },
  { k: "sent", label: "Outstanding" },
  { k: "paid", label: "Paid" },
  { k: "overdue", label: "Overdue" },
  { k: "draft", label: "Drafts" },
]

const statusMatches = (status: InvoiceStatus, filter: FilterKey): boolean => {
  if (filter === "all") return true
  if (filter === "sent") return status === "SENT" || status === "PENDING"
  if (filter === "paid") return status === "PAID"
  if (filter === "overdue") return status === "OVERDUE"
  if (filter === "draft") return status === "DRAFT"
  return true
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<FilterKey>("all")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/invoices", { credentials: "include" })
        if (!response.ok) throw new Error("fetch failed")
        const data = (await response.json()) as Invoice[]
        setInvoices(data)
      } catch (error) {
        console.error("Error fetching invoices:", error)
        toast.error("Couldn’t load invoices.")
      } finally {
        setLoading(false)
      }
    }
    fetchInvoices()
  }, [])

  const counts: Record<FilterKey, number> = {
    all: invoices.length,
    sent: invoices.filter((i) => statusMatches(i.status, "sent")).length,
    paid: invoices.filter((i) => statusMatches(i.status, "paid")).length,
    overdue: invoices.filter((i) => statusMatches(i.status, "overdue")).length,
    draft: invoices.filter((i) => statusMatches(i.status, "draft")).length,
  }

  const filtered = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch && statusMatches(invoice.status, filter)
  })

  const handleDelete = async (invoiceId: string) => {
    if (!confirm("Delete this invoice? Can’t undo.")) return
    try {
      setDeletingId(invoiceId)
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!response.ok) throw new Error("delete failed")
      setInvoices(invoices.filter((i) => i.id !== invoiceId))
      toast.success("Invoice deleted.")
    } catch (error) {
      console.error("Error deleting invoice:", error)
      toast.error("Couldn’t delete it.")
    } finally {
      setDeletingId(null)
    }
  }

  const downloadPdf = async (invoice: Invoice) => {
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/pdf`, { credentials: "include" })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const blob = await response.blob()
      if (blob.size === 0) throw new Error("Empty PDF")
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `invoice-${invoice.invoiceNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success("Downloaded.")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Couldn’t download."
      toast.error(message)
    }
  }

  return (
    <ProtectedLayout>
      <div className="flex flex-col gap-4">
        {/* Filter row */}
        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            {filters.map((f) => (
              <button
                key={f.k}
                type="button"
                onClick={() => setFilter(f.k)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-colors duration-[120ms] border border-transparent",
                  filter === f.k
                    ? "bg-[var(--ink-900)] text-[var(--ink-50)] dark:bg-[var(--citrus)] dark:text-[var(--ink-900)]"
                    : "text-[var(--fg-muted)] hover:bg-[var(--background)] hover:text-foreground"
                )}
              >
                {f.label}
                <span className="text-[10px] font-mono opacity-70">{counts[f.k]}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-[8px] border border-[var(--border)] bg-[var(--background)] text-[var(--fg-muted)] w-[280px]">
              <Search className="h-3.5 w-3.5" />
              <input
                type="search"
                placeholder="Search by client or number"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent border-0 outline-none text-[13px] text-foreground placeholder:text-[var(--fg-muted)]"
              />
            </div>
            <Button asChild>
              <Link href="/invoices/new">
                <Plus className="h-4 w-4" />
                New invoice
              </Link>
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[var(--background)] border border-[var(--border)] rounded-[12px] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Issued</TableHead>
                <TableHead>Due</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-[var(--fg-muted)]">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="font-[var(--font-display)] italic text-[24px] mb-2">No invoices yet.</div>
                    <Button asChild>
                      <Link href="/invoices/new">Create your first invoice</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono tabular-nums">
                      <Link href={`/invoices/${invoice.id}`} className="hover:underline">
                        {invoice.invoiceNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium">{invoice.client.name}</TableCell>
                    <TableCell className="text-[var(--fg-muted)] text-[12px]">
                      {new Date(invoice.issueDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </TableCell>
                    <TableCell className="text-[var(--fg-muted)] text-[12px]">
                      {new Date(invoice.dueDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </TableCell>
                    <TableCell data-num="true">{formatCurrency(Number(invoice.total))}</TableCell>
                    <TableCell>
                      <StatusBadge status={invoice.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => downloadPdf(invoice)} title="Download PDF">
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(invoice.id)}
                          disabled={deletingId === invoice.id}
                          title="Delete"
                          className="text-[var(--fg-muted)] hover:text-[var(--destructive)]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </ProtectedLayout>
  )
}
