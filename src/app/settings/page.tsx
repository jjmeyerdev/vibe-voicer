"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { ProtectedLayout } from "@/components/protected-layout"

type PersonalSettings = { fullName: string; email: string }
type InvoiceSettings = {
  taxRate: number
  currency: string
  invoicePrefix: string
  nextInvoiceNumber: number
  paymentTerms: string
}
export default function SettingsPage() {
  const [personal, setPersonal] = useState<PersonalSettings>({ fullName: "", email: "" })
  const [invoice, setInvoice] = useState<InvoiceSettings>({
    taxRate: 0,
    currency: "USD",
    invoicePrefix: "INV",
    nextInvoiceNumber: 1,
    paymentTerms: "",
  })
  const [isSavingPersonal, setIsSavingPersonal] = useState(false)
  const [isSavingInvoice, setIsSavingInvoice] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [personalRes, invoiceRes] = await Promise.all([
          fetch("/api/settings/personal", { credentials: "include" }),
          fetch("/api/settings/invoice", { credentials: "include" }),
        ])
        if (personalRes.ok) {
          const data = (await personalRes.json()) as Partial<PersonalSettings>
          setPersonal({ fullName: data.fullName ?? "", email: data.email ?? "" })
        }
        if (invoiceRes.ok) {
          const data = (await invoiceRes.json()) as Partial<InvoiceSettings>
          setInvoice({
            taxRate: data.taxRate ?? 0,
            currency: data.currency ?? "USD",
            invoicePrefix: data.invoicePrefix ?? "INV",
            nextInvoiceNumber: data.nextInvoiceNumber ?? 1,
            paymentTerms: data.paymentTerms ?? "",
          })
        }
      } catch (error) {
        console.error("Settings load failed:", error)
      }
    }
    load()
  }, [])

  const handleSavePersonal = async () => {
    try {
      setIsSavingPersonal(true)
      const response = await fetch("/api/settings/personal", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(personal),
      })
      if (!response.ok) throw new Error("save failed")
      toast.success("Personal info saved.")
    } catch (error) {
      console.error("Personal save error:", error)
      toast.error("Couldn’t save it.")
    } finally {
      setIsSavingPersonal(false)
    }
  }

  const handleSaveInvoice = async () => {
    try {
      setIsSavingInvoice(true)
      const response = await fetch("/api/settings/invoice", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(invoice),
      })
      if (!response.ok) throw new Error("save failed")
      toast.success("Invoice defaults saved.")
    } catch (error) {
      console.error("Invoice save error:", error)
      toast.error("Couldn’t save it.")
    } finally {
      setIsSavingInvoice(false)
    }
  }

  return (
    <ProtectedLayout>
      <div className="max-w-230">
        <Tabs defaultValue="personal">
          <TabsList>
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="invoice">Invoice defaults</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="mt-2">
            <div className="bg-background border border-border rounded-[12px] p-7">
              <div className="t-overline">Personal info</div>
              <p className="text-[12px] text-(--fg-muted) mt-0.5 mb-6">
                Whose name should appear at the top of invoices?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    placeholder="Anya Kowalski"
                    value={personal.fullName}
                    onChange={(e) => setPersonal((s) => ({ ...s, fullName: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@studio.com"
                    value={personal.email}
                    onChange={(e) => setPersonal((s) => ({ ...s, email: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end pt-6 mt-4 border-t border-border">
                <Button onClick={handleSavePersonal} disabled={isSavingPersonal}>
                  {isSavingPersonal ? "Saving…" : "Save"}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="invoice" className="mt-2">
            <div className="bg-background border border-border rounded-[12px] p-7">
              <div className="t-overline">Invoice defaults</div>
              <p className="text-[12px] text-(--fg-muted) mt-0.5 mb-6">
                What every new invoice starts with.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="taxRate">Tax rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.001"
                    min="0"
                    max="100"
                    value={invoice.taxRate}
                    onChange={(e) =>
                      setInvoice((s) => ({ ...s, taxRate: parseFloat(e.target.value) || 0 }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    placeholder="USD"
                    value={invoice.currency}
                    onChange={(e) => setInvoice((s) => ({ ...s, currency: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="invoicePrefix">Invoice prefix</Label>
                  <Input
                    id="invoicePrefix"
                    placeholder="INV"
                    value={invoice.invoicePrefix}
                    onChange={(e) => setInvoice((s) => ({ ...s, invoicePrefix: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="nextNumber">Next invoice number</Label>
                  <Input
                    id="nextNumber"
                    type="number"
                    min="1"
                    value={invoice.nextInvoiceNumber}
                    onChange={(e) =>
                      setInvoice((s) => ({
                        ...s,
                        nextInvoiceNumber: parseInt(e.target.value) || 1,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 mt-4">
                <Label htmlFor="paymentTerms">Default payment terms</Label>
                <Textarea
                  id="paymentTerms"
                  placeholder="Net 30."
                  rows={3}
                  value={invoice.paymentTerms}
                  onChange={(e) => setInvoice((s) => ({ ...s, paymentTerms: e.target.value }))}
                />
              </div>
              <div className="flex justify-end pt-6 mt-4 border-t border-border">
                <Button onClick={handleSaveInvoice} disabled={isSavingInvoice}>
                  {isSavingInvoice ? "Saving…" : "Save"}
                </Button>
              </div>
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </ProtectedLayout>
  )
}
