"use client"

import { ProtectedLayout } from "@/components/protected-layout"
import { Button } from "@/components/ui/button"
import { useSession } from "@/lib/auth-client"
import Link from "next/link"
import { useState, useEffect } from "react"
import { formatCurrency } from "@/lib/utils"
import { type InvoiceStatus } from "@/components/status-badge"

type DashInvoice = {
  id: string
  number: string
  client: string
  total: number
  status: InvoiceStatus
  dueDate: Date
  createdAt: Date
}

type DashStats = {
  outstanding: number
  outstandingCount: number
  overdue: number
  overdueCount: number
  paid: number
  paidCount: number
  draft: number
  draftCount: number
}

const initialStats: DashStats = {
  outstanding: 0,
  outstandingCount: 0,
  overdue: 0,
  overdueCount: 0,
  paid: 0,
  paidCount: 0,
  draft: 0,
  draftCount: 0,
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashStats>(initialStats)
  const [recent, setRecent] = useState<DashInvoice[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/invoices", { credentials: "include" })
        if (!res.ok) return
        const raw = (await res.json()) as Array<{
          id: string
          invoiceNumber?: string
          number?: string
          status: InvoiceStatus
          total: number | string
          dueDate: string
          createdAt: string
          client: { name: string }
        }>
        const invoices: DashInvoice[] = raw.map((i) => ({
          id: i.id,
          number: i.invoiceNumber ?? i.number ?? i.id.slice(0, 8).toUpperCase(),
          client: i.client.name,
          total: Number(i.total),
          status: i.status,
          dueDate: new Date(i.dueDate),
          createdAt: new Date(i.createdAt),
        }))

        const sumByStatus = (s: InvoiceStatus[]) =>
          invoices.filter((i) => s.includes(i.status)).reduce((a, b) => a + b.total, 0)
        const countByStatus = (s: InvoiceStatus[]) =>
          invoices.filter((i) => s.includes(i.status)).length

        setStats({
          outstanding: sumByStatus(["SENT", "PENDING"]),
          outstandingCount: countByStatus(["SENT", "PENDING"]),
          overdue: sumByStatus(["OVERDUE"]),
          overdueCount: countByStatus(["OVERDUE"]),
          paid: sumByStatus(["PAID"]),
          paidCount: countByStatus(["PAID"]),
          draft: sumByStatus(["DRAFT"]),
          draftCount: countByStatus(["DRAFT"]),
        })

        setRecent(
          [...invoices]
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 5)
        )
      } catch (error) {
        console.error("Dashboard load failed:", error)
      }
    }
    load()
  }, [])

  const firstName = session?.user?.name?.split(" ")[0] ?? "there"

  return (
    <ProtectedLayout
      title={`Hi, ${firstName}.`}
      subtitle="Here’s where the money is — and isn’t."
    >
      {/* Stat row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <StatCard label="Outstanding" amount={stats.outstanding} sub={`${stats.outstandingCount} invoice${stats.outstandingCount === 1 ? "" : "s"}`} />
        <StatCard
          label="Overdue"
          amount={stats.overdue}
          sub={`${stats.overdueCount} invoice${stats.overdueCount === 1 ? "" : "s"}`}
          alert={stats.overdueCount > 0}
        />
        <StatCard label="Paid this month" amount={stats.paid} sub={`${stats.paidCount} invoice${stats.paidCount === 1 ? "" : "s"}`} />
        <StatCard label="Drafts" amount={stats.draft} sub={`${stats.draftCount} unfinished`} />
      </div>

      {/* Activity + side */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-3.5">
        <section className="bg-background border border-border rounded-[12px] p-5">
          <header className="flex justify-between items-end mb-4">
            <div>
              <div className="t-overline">Activity</div>
              <h3 className="font-(--font-display) text-[22px] leading-[1.1] mt-1">What just happened</h3>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/invoices">View all →</Link>
            </Button>
          </header>

          {recent.length > 0 ? (
            <ul className="list-none p-0 m-0">
              {recent.map((it) => (
                <li
                  key={it.id}
                  className="grid grid-cols-[80px_14px_1fr] gap-3 py-3 border-b border-border last:border-b-0 items-center"
                >
                  <div className="font-mono text-[11px] text-(--fg-muted) tabular-nums">
                    {it.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                  <div className={"w-2 h-2 rounded-full justify-self-center " + dotColor(it.status)} />
                  <div className="flex justify-between items-baseline gap-3 text-[13px]">
                    <div className="leading-[1.4]">
                      <span className="font-semibold">{it.client}</span>
                      <span className="text-(--fg-muted)"> · {labelFor(it.status)} </span>
                      <Link
                        href={`/invoices/${it.id}`}
                        className="text-foreground border-b border-dotted border-(--fg-subtle) cursor-pointer"
                      >
                        {it.number}
                      </Link>
                    </div>
                    <div className="text-(--fg-muted) text-[12px] font-mono tabular-nums">
                      {formatCurrency(it.total)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-12 text-center">
              <div className="font-(--font-display) italic text-[24px] mb-2">No invoices yet.</div>
              <Button asChild size="default">
                <Link href="/invoices/new">Create your first invoice</Link>
              </Button>
            </div>
          )}
        </section>

        <aside className="bg-background border border-border rounded-[12px] p-5">
          <div className="t-overline">Up next</div>
          <div className="flex flex-col gap-2 mt-3 mb-6">
            <ActionChip href="/invoices/new" label="New invoice" sub="Send your next one" citrus />
            <ActionChip href="/clients/new" label="Add a client" sub={null} />
            <ActionChip href="/settings" label="Set up your branding" sub="Settings → Company" />
          </div>

          <div className="bg-(--bg-sunken) rounded-[12px] p-5 mt-2">
            <div className="font-(--font-display) italic text-[40px] leading-none text-(--fg-subtle)">&ldquo;</div>
            <div className="font-(--font-display) italic text-[20px] leading-[1.3] mt-1.5 mb-3">
              Thursdays. People pay on Thursdays.
            </div>
            <div className="text-[11px] text-(--fg-muted)">— from your last 90 days</div>
          </div>
        </aside>
      </div>
    </ProtectedLayout>
  )
}

function StatCard({
  label,
  amount,
  sub,
  alert,
}: {
  label: string
  amount: number
  sub: string
  alert?: boolean
}) {
  return (
    <div
      className={
        "rounded-[12px] p-5 border " +
        (alert
          ? "bg-(--status-overdue-tint) border-(--status-overdue-fg)/30"
          : "bg-background border-border")
      }
    >
      <div className="t-overline">{label}</div>
      <div className="font-mono tabular-nums text-[30px] tracking-[-0.01em] mt-1.5 mb-2">
        {formatCurrency(amount)}
      </div>
      <div className="flex justify-between text-[11px] text-(--fg-muted)">
        <span>{sub}</span>
      </div>
    </div>
  )
}

function ActionChip({
  href,
  label,
  sub,
  citrus,
}: {
  href: string
  label: string
  sub: string | null
  citrus?: boolean
}) {
  return (
    <Link
      href={href}
      className={
        "grid grid-cols-[1fr_auto] items-center px-3.5 py-3 rounded-[10px] border transition-colors duration-[120ms] " +
        (citrus
          ? "bg-citrus text-ink-900 border-ink-900 hover:bg-(--citrus-hover)"
          : "bg-background border-border hover:bg-(--bg-sunken)")
      }
    >
      <div>
        <div className="text-[13px] font-medium">{label}</div>
        {sub && (
          <div className={"text-[11px] " + (citrus ? "text-ink-700" : "text-(--fg-muted)")}>
            {sub}
          </div>
        )}
      </div>
      <div className={"text-[14px] " + (citrus ? "text-ink-900" : "text-(--fg-subtle)")}>→</div>
    </Link>
  )
}

function dotColor(status: InvoiceStatus): string {
  switch (status) {
    case "PAID":
      return "bg-(--status-paid-fg)"
    case "VIEWED":
      return "bg-(--status-viewed-fg)"
    case "SENT":
    case "PENDING":
      return "bg-(--status-sent-fg)"
    case "OVERDUE":
      return "bg-(--status-overdue-fg)"
    case "VOID":
    case "CANCELLED":
      return "bg-(--status-void-fg)"
    case "DRAFT":
    default:
      return "bg-(--fg-subtle)"
  }
}

function labelFor(status: InvoiceStatus): string {
  switch (status) {
    case "PAID":
      return "paid"
    case "VIEWED":
      return "viewed"
    case "SENT":
      return "sent invoice"
    case "PENDING":
      return "pending"
    case "OVERDUE":
      return "is overdue"
    case "VOID":
    case "CANCELLED":
      return "voided"
    case "DRAFT":
      return "drafted"
  }
}

