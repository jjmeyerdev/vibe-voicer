"use client"

import { ProtectedLayout } from "@/components/protected-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm, useFieldArray, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { formatCurrency } from "@/lib/utils"

const invoiceItemSchema = z.object({
  id: z.string().optional(),
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

type InvoiceData = {
  id: string
  invoiceNumber: string
  status: string
  issueDate: string
  dueDate: string
  client: { id: string; name: string }
  items: Array<{ id: string; description: string; quantity: number; unitPrice: number }>
  discountType?: "PERCENTAGE" | "FIXED_AMOUNT"
  discountValue: number
  taxRate: number
  notes?: string
  paymentTerms?: string
}

export default function EditInvoicePage() {
  const router = useRouter()
  const params = useParams()
  const invoiceId = params.id as string
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [invoice, setInvoice] = useState<InvoiceData | null>(null)

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      clientId: "",
      issueDate: new Date().toLocaleDateString("en-CA"),
      dueDate: "",
      discountType: "PERCENTAGE",
      discountValue: 0,
      taxRate: 0,
      notes: "",
      paymentTerms: "",
      items: [{ description: "", quantity: 1, unitPrice: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" })
  const watchedItems = useWatch({ control: form.control, name: "items" })
  const watchedTaxRate = useWatch({ control: form.control, name: "taxRate" })
  const watchedDiscountType = useWatch({ control: form.control, name: "discountType" })
  const watchedDiscountValue = useWatch({ control: form.control, name: "discountValue" })

  const items = watchedItems ?? []
  const subtotal = items.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0,
  )
  const discountAmount =
    watchedDiscountValue && watchedDiscountValue > 0
      ? watchedDiscountType === "PERCENTAGE"
        ? (subtotal * watchedDiscountValue) / 100
        : watchedDiscountValue
      : 0
  const taxAmount = ((subtotal - discountAmount) * (watchedTaxRate || 0)) / 100
  const total = subtotal - discountAmount + taxAmount

  useEffect(() => {
    const load = async () => {
      try {
        const [invoiceRes, clientsRes] = await Promise.all([
          fetch(`/api/invoices/${invoiceId}`, { credentials: "include" }),
          fetch("/api/clients", { credentials: "include" }),
        ])
        if (!invoiceRes.ok) throw new Error("Couldn’t load the invoice.")
        if (!clientsRes.ok) throw new Error("Couldn’t load clients.")
        const data = (await invoiceRes.json()) as InvoiceData
        const clientsData = (await clientsRes.json()) as Client[]
        setInvoice(data)
        setClients(clientsData)
        form.reset({
          clientId: data.client.id,
          issueDate: new Date(data.issueDate).toLocaleDateString("en-CA"),
          dueDate: data.dueDate ? new Date(data.dueDate).toLocaleDateString("en-CA") : "",
          discountType: data.discountType ?? "PERCENTAGE",
          discountValue: Number(data.discountValue) || 0,
          taxRate: Number(data.taxRate) || 0,
          notes: data.notes ?? "",
          paymentTerms: data.paymentTerms ?? "",
          items: data.items.map((item) => ({
            id: `original_${item.id}`,
            description: item.description,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
          })),
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : "Couldn’t load the invoice."
        toast.error(message)
      } finally {
        setLoading(false)
      }
    }
    if (invoiceId) load()
  }, [invoiceId, form])

  const onSubmit = async (data: InvoiceFormData) => {
    try {
      const originalItems = data.items
        .filter((item) => item.id && item.id.startsWith("original_"))
        .map((item) => ({
          id: item.id?.replace("original_", "") ?? "",
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        }))
      const newItems = data.items
        .filter((item) => !item.id || !item.id.startsWith("original_"))
        .map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        }))

      const invoiceData = {
        ...data,
        originalItems,
        items: newItems,
        subtotal,
        discountAmount,
        taxAmount,
        total,
        status: invoice?.status ?? "DRAFT",
      }
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(invoiceData),
      })
      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { error?: string }
        throw new Error(errorData.error ?? "Couldn’t save changes.")
      }
      toast.success("Invoice updated.")
      router.push(`/invoices/${invoiceId}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Couldn’t save changes."
      toast.error(message)
    }
  }

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="h-px w-24 bg-[var(--ink-300)] dark:bg-[var(--ink-700)] animate-pulse" />
        </div>
      </ProtectedLayout>
    )
  }

  if (!invoice) {
    return (
      <ProtectedLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center gap-4">
          <div className="font-[var(--font-display)] italic text-[40px]">Not here.</div>
          <Button asChild>
            <Link href="/invoices">← Back to invoices</Link>
          </Button>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout title={`Edit ${invoice.invoiceNumber}`} subtitle="Tweak the details, save when ready.">
      <div className="flex flex-col gap-4 max-w-[920px]">
        <div className="flex items-center justify-between">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/invoices/${invoiceId}`}>
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Link>
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
                            <SelectValue placeholder="Pick a client" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
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

            <section className="bg-[var(--background)] border border-[var(--border)] rounded-[12px] overflow-hidden">
              <div className="px-6 pt-6">
                <div className="t-overline">Line items</div>
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
                  const isOriginal = !!field.id && field.id.toString().startsWith("original_")
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
                        disabled={isOriginal || fields.length === 1}
                        onClick={() => remove(index)}
                        title={isOriginal ? "Original line — can’t remove" : "Remove"}
                        className="text-[var(--fg-muted)] hover:text-[var(--destructive)] disabled:opacity-30"
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
                    onClick={() =>
                      append({ id: `new_${Date.now()}`, description: "", quantity: 1, unitPrice: 0 })
                    }
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add line
                  </Button>
                </div>
              </div>
            </section>

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
                          <Textarea rows={3} {...field} />
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
                <Link href={`/invoices/${invoiceId}`}>Cancel</Link>
              </Button>
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </Form>
      </div>
    </ProtectedLayout>
  )
}
