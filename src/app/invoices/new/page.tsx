"use client"

import { ProtectedLayout } from "@/components/protected-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { formatCurrency } from "@/lib/utils"

const invoiceItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0, "Quantity must be positive"),
  unitPrice: z.number().min(0, "Unit price must be positive"),
})

const invoiceSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]).optional(),
  discountValue: z.number().min(0).optional(),
  taxRate: z.number().min(0).max(100),
  notes: z.string().optional(),
  paymentTerms: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
})

type InvoiceFormData = z.infer<typeof invoiceSchema>

type Client = { id: string; name: string }

type Settings = {
  invoice?: {
    taxRate?: number
    paymentTerms?: string
  }
}

export default function NewInvoicePage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [subtotal, setSubtotal] = useState(0)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [taxAmount, setTaxAmount] = useState(0)
  const [total, setTotal] = useState(0)
  const [settings, setSettings] = useState<Settings | null>(null)

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      clientId: "",
      issueDate: new Date().toLocaleDateString("en-CA"),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-CA"),
      discountType: "PERCENTAGE",
      discountValue: 0,
      taxRate: 0,
      notes: "",
      paymentTerms: "",
      items: [{ description: "", quantity: 1, unitPrice: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" })

  const watchedItems = form.watch("items")
  const watchedTaxRate = form.watch("taxRate")
  const watchedDiscountType = form.watch("discountType")
  const watchedDiscountValue = form.watch("discountValue")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [clientsResponse, settingsResponse] = await Promise.all([
          fetch("/api/clients", { credentials: "include" }),
          fetch("/api/settings", { credentials: "include" }),
        ])
        if (!clientsResponse.ok) throw new Error("Couldn’t load clients.")
        const clientsData = (await clientsResponse.json()) as Client[]
        setClients(clientsData)
        if (settingsResponse.ok) {
          const settingsData = (await settingsResponse.json()) as Settings
          setSettings(settingsData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Couldn’t load clients.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (settings) {
      form.reset({
        ...form.getValues(),
        taxRate: Number(settings.invoice?.taxRate) || 0,
        paymentTerms: settings.invoice?.paymentTerms || "",
      })
    }
  }, [settings, form])

  useEffect(() => {
    const items = watchedItems ?? []
    const newSubtotal = items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0)
    let newDiscount = 0
    if (watchedDiscountValue && watchedDiscountValue > 0) {
      newDiscount =
        watchedDiscountType === "PERCENTAGE"
          ? (newSubtotal * watchedDiscountValue) / 100
          : watchedDiscountValue
    }
    const afterDiscount = newSubtotal - newDiscount
    const newTax = (afterDiscount * (watchedTaxRate || 0)) / 100
    setSubtotal(newSubtotal)
    setDiscountAmount(newDiscount)
    setTaxAmount(newTax)
    setTotal(afterDiscount + newTax)
  }, [watchedItems, watchedTaxRate, watchedDiscountType, watchedDiscountValue])

  const onSubmit = async (data: InvoiceFormData) => {
    try {
      const invoiceData = {
        ...data,
        subtotal,
        discountAmount,
        taxAmount,
        total,
        status: "DRAFT" as const,
      }
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(invoiceData),
      })
      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { error?: string; details?: string }
        throw new Error(errorData.details ?? errorData.error ?? "Couldn’t create the invoice.")
      }
      toast.success("Invoice created.")
      router.push("/invoices")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Couldn’t create the invoice."
      toast.error(message)
    }
  }

  return (
    <ProtectedLayout>
      <div className="flex flex-col gap-4 max-w-[920px]">
        <div className="flex items-center justify-between">
          <Button asChild variant="ghost" size="sm">
            <Link href="/invoices">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to invoices
            </Link>
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {/* Meta */}
            <section className="bg-[var(--background)] border border-[var(--border)] rounded-[12px] p-6">
              <div className="t-overline">Invoice details</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={loading ? "Loading…" : "Pick a client"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients.length === 0 ? (
                            <SelectItem value="-" disabled>
                              No clients yet
                            </SelectItem>
                          ) : (
                            clients.map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="issueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paymentTerms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment terms</FormLabel>
                      <FormControl>
                        <Input placeholder="Net 30" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            {/* Line items */}
            <section className="bg-[var(--background)] border border-[var(--border)] rounded-[12px] overflow-hidden">
              <div className="px-6 pt-6 flex justify-between items-center">
                <div>
                  <div className="t-overline">Line items</div>
                  <div className="text-[12px] text-[var(--fg-muted)] mt-0.5">What did you do?</div>
                </div>
              </div>

              <div className="p-6 pt-3">
                <div className="grid grid-cols-[1fr_80px_120px_140px_32px] gap-2 px-1 pb-2 t-overline">
                  <span>Description</span>
                  <span className="text-right">Qty</span>
                  <span className="text-right">Rate</span>
                  <span className="text-right">Amount</span>
                  <span></span>
                </div>
                {fields.map((field, index) => {
                  const qty = watchedItems?.[index]?.quantity ?? 0
                  const price = watchedItems?.[index]?.unitPrice ?? 0
                  return (
                    <div
                      key={field.id}
                      className="grid grid-cols-[1fr_80px_120px_140px_32px] gap-2 items-center py-1 border-t border-[var(--border)]"
                    >
                      <FormField
                        control={form.control}
                        name={`items.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="What you did"
                                {...field}
                                className="border-transparent bg-transparent focus-visible:bg-[var(--bg-elevated)] focus-visible:border-[var(--border-strong)]"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                step="1"
                                min="0"
                                value={field.value ?? 0}
                                onChange={(e) => field.onChange(Math.round(parseFloat(e.target.value) || 0))}
                                className="border-transparent bg-transparent text-right font-mono tabular-nums focus-visible:bg-[var(--bg-elevated)] focus-visible:border-[var(--border-strong)]"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.unitPrice`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={field.value ?? 0}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                className="border-transparent bg-transparent text-right font-mono tabular-nums focus-visible:bg-[var(--bg-elevated)] focus-visible:border-[var(--border-strong)]"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <div className="text-right font-mono tabular-nums text-[13px] pr-2">
                        {formatCurrency(qty * price)}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={fields.length === 1}
                        onClick={() => remove(index)}
                        title="Remove"
                        className="text-[var(--fg-muted)] hover:text-[var(--destructive)]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )
                })}
                <div className="mt-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add line
                  </Button>
                </div>
              </div>
            </section>

            {/* Adjustments + totals */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
              <section className="bg-[var(--background)] border border-[var(--border)] rounded-[12px] p-6">
                <div className="t-overline">Adjustments</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="discountType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                            <SelectItem value="FIXED_AMOUNT">Fixed amount</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="discountValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount value</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={field.value ?? 0}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="taxRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax rate (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.001"
                            min="0"
                            max="100"
                            value={field.value ?? 0}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Anything the client should see at the bottom." rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <aside className="bg-[var(--background)] border border-[var(--border)] rounded-[12px] p-6 self-start">
                <div className="t-overline">Totals</div>
                <div className="flex flex-col gap-2 mt-3 text-[13px]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono tabular-nums">{formatCurrency(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-[var(--fg-muted)]">
                      <span>Discount</span>
                      <span className="font-mono tabular-nums">-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  {taxAmount > 0 && (
                    <div className="flex justify-between text-[var(--fg-muted)]">
                      <span>Tax</span>
                      <span className="font-mono tabular-nums">{formatCurrency(taxAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-[var(--ink-900)] dark:border-[var(--foreground)] mt-2 pt-2.5 text-[18px]">
                    <span className="font-[var(--font-display)] italic text-[22px]">Total</span>
                    <span className="font-mono tabular-nums">{formatCurrency(total)}</span>
                  </div>
                </div>
              </aside>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border)]">
              <Button type="button" variant="ghost" asChild>
                <Link href="/invoices">Cancel</Link>
              </Button>
              <Button type="submit">Create invoice</Button>
            </div>
          </form>
        </Form>
      </div>
    </ProtectedLayout>
  )
}
