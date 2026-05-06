"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Paperclip } from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { defaultInvoiceEmail } from "@/lib/invoice-email"
import { formatCurrency } from "@/lib/utils"
import { formatInvoiceDate } from "@/lib/date"
import type { InvoiceStatus } from "@/components/status-badge"

type DialogInvoice = {
  id: string
  invoiceNumber: string
  publicSlug: string
  total: number
  dueDate: string
  status: InvoiceStatus
  client: { name: string; email: string | null }
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: DialogInvoice
  onSent: () => void
}

const schema = z.object({
  subject: z.string().min(1, "Add a subject."),
  body: z.string().min(1, "Add a message."),
})

type FormData = z.infer<typeof schema>

export function SendInvoiceDialog({ open, onOpenChange, invoice, onSent }: Props) {
  const hasEmail = !!invoice.client.email
  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/i/${invoice.publicSlug}`
      : `/i/${invoice.publicSlug}`

  const defaults = defaultInvoiceEmail({
    invoiceNumber: invoice.invoiceNumber,
    clientName: invoice.client.name,
    total: invoice.total,
    dueDate: invoice.dueDate,
    publicUrl,
  })

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  })

  // Reset to fresh defaults whenever the dialog opens for a different invoice.
  useEffect(() => {
    if (open) form.reset(defaults)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, invoice.id])

  const [sending, setSending] = useState(false)

  const onSubmit = async (data: FormData) => {
    if (sending) return
    setSending(true)
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/send`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: data.subject, body: data.body }),
      })

      if (!response.ok) {
        const errorData = (await response
          .json()
          .catch(() => ({}))) as { error?: string; code?: string }
        if (errorData.code === "SMTP_NOT_CONFIGURED") {
          toast.error("Gmail isn’t set up yet. Use the Gmail draft instead.")
        } else {
          toast.error(errorData.error ?? "Couldn’t send.")
        }
        return
      }

      toast.success(`Sent to ${invoice.client.name}.`)
      onSent()
      onOpenChange(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Couldn’t send."
      toast.error(message)
    } finally {
      setSending(false)
    }
  }

  const openMailtoFallback = async () => {
    const subject = form.getValues("subject")
    const body = form.getValues("body")
    if (hasEmail && invoice.client.email) {
      // Mark as SENT only on a best-effort basis — matches the previous behavior
      // when the user hits the mailto path on a DRAFT invoice.
      if (invoice.status === "DRAFT") {
        try {
          const response = await fetch(`/api/invoices/${invoice.id}`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "SENT" }),
          })
          if (response.ok) onSent()
        } catch {
          // Non-fatal — the draft will still open even if the status flip fails.
        }
      }
      window.location.href =
        `mailto:${invoice.client.email}` +
        `?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(body)}`
      toast.success("Email draft opened.")
      onOpenChange(false)
      return
    }
    // No email on file — copy the public link.
    try {
      await navigator.clipboard.writeText(publicUrl)
      toast.success("Public link copied — paste it to your client.")
    } catch {
      toast.error("Couldn’t copy the link.")
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[560px] gap-0 p-0 border-border rounded-[14px] overflow-hidden"
        showCloseButton={false}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-5">
          <DialogHeader className="gap-1.5">
            <div className="t-overline">Send invoice</div>
            <DialogTitle className="font-(--font-display) italic font-normal text-[28px] leading-[1.05] tracking-[-0.01em]">
              {invoice.client.name},
            </DialogTitle>
            <DialogDescription className="text-[13px] text-(--fg-muted) leading-[1.55]">
              Sending {invoice.invoiceNumber} for {formatCurrency(invoice.total)}.
              You can tweak the wording before it goes.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Recipient + attachment block */}
        <div className="mx-6 mb-5 rounded-[10px] border border-border bg-(--bg-sunken) overflow-hidden">
          <div className="grid grid-cols-[64px_1fr] items-baseline gap-3 px-4 py-3">
            <span className="t-overline">To</span>
            {hasEmail ? (
              <span className="font-mono tabular-nums text-[13px] truncate">
                {invoice.client.email}
              </span>
            ) : (
              <span className="font-(--font-display) italic text-[14px] text-(--fg-subtle)">
                No email on file.
              </span>
            )}
          </div>
          <div className="h-px bg-border" />
          <div className="grid grid-cols-[64px_1fr] items-center gap-3 px-4 py-3">
            <span className="t-overline">PDF</span>
            <div className="flex items-center gap-2 min-w-0">
              <Paperclip className="h-3.5 w-3.5 text-(--fg-muted) shrink-0" />
              <span className="font-mono text-[13px] truncate">
                invoice-{invoice.invoiceNumber}.pdf
              </span>
              <span className="text-[11px] text-(--fg-muted) shrink-0">
                · attached
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
            <div className="px-6 flex flex-col gap-4 pb-5">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={sending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={9}
                        disabled={sending}
                        className="font-mono text-[13px] leading-[1.6] min-h-48"
                      />
                    </FormControl>
                    <div className="text-[11px] text-(--fg-muted) mt-1">
                      Due {formatInvoiceDate(invoice.dueDate, { dateStyle: "medium" })}.
                      The public link is in the body — keep it there.
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="px-6 py-4 border-t border-border bg-(--bg-sunken)/40 sm:flex-row sm:items-center sm:justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={openMailtoFallback}
                disabled={sending}
                className="justify-start text-(--fg-muted) hover:text-foreground"
              >
                {hasEmail ? "Open Gmail draft instead" : "Copy public link instead"}
              </Button>
              <div className="flex items-center gap-2 sm:justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  disabled={sending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={sending || !hasEmail}>
                  {sending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    "Send email"
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
