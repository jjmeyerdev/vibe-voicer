import { InvoiceLayout, type InvoiceLayoutProps } from "./pdf/InvoiceLayout"

type Props = { invoice: InvoiceLayoutProps["invoice"] }

export function PaperInvoicePDF({ invoice }: Props) {
  return <InvoiceLayout invoice={invoice} theme="paper" />
}

export const SimpleInvoicePDF = PaperInvoicePDF
