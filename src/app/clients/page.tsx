"use client"

import { ProtectedLayout } from "@/components/protected-layout"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"

type Client = {
  id: string
  name: string
  email: string | null
  phone: string
  city: string
  state: string
  invoiceCount: number
  totalValue: number
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/clients", { credentials: "include" })
        if (!response.ok) throw new Error("fetch failed")
        const data = (await response.json()) as Client[]
        setClients(data)
      } catch (error) {
        console.error("Error fetching clients:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchClients()
  }, [])

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async (clientId: string) => {
    if (!confirm("Delete this client? Only works if they have no invoices.")) return
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error ?? "Couldn’t delete it.")
      }
      setClients(clients.filter((c) => c.id !== clientId))
      toast.success("Client deleted.")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Couldn’t delete it."
      toast.error(message)
    }
  }

  return (
    <ProtectedLayout>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-[8px] border border-border bg-background text-(--fg-muted) w-70">
            <Search className="h-3.5 w-3.5" />
            <input
              type="search"
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent border-0 outline-none text-[13px] text-foreground placeholder:text-(--fg-muted)"
            />
          </div>
          <Button asChild>
            <Link href="/clients/new">
              <Plus className="h-4 w-4" />
              New client
            </Link>
          </Button>
        </div>

        <div className="bg-background border border-border rounded-[12px] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Invoices</TableHead>
                <TableHead className="text-right">Total billed</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-(--fg-muted)">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="font-(--font-display) italic text-[24px] mb-2">No clients yet.</div>
                    <Button asChild>
                      <Link href="/clients/new">Add your first client</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">
                      <Link href={`/clients/${client.id}`} className="hover:underline">
                        {client.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-(--fg-muted) text-[12px]">{client.email ?? "—"}</TableCell>
                    <TableCell className="text-(--fg-muted) text-[12px]">{client.phone}</TableCell>
                    <TableCell className="text-(--fg-muted) text-[12px]">
                      {[client.city, client.state].filter(Boolean).join(", ")}
                    </TableCell>
                    <TableCell data-num="true">{client.invoiceCount}</TableCell>
                    <TableCell data-num="true">{formatCurrency(client.totalValue)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild variant="ghost" size="icon" title="Edit">
                          <Link href={`/clients/${client.id}/edit`}>
                            <Edit className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(client.id)}
                          title="Delete"
                          className="text-(--fg-muted) hover:text-destructive"
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
