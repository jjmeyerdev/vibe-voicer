import { InvoiceLayout, type InvoiceLayoutProps } from "./pdf/InvoiceLayout"

type Props = { invoice: InvoiceLayoutProps["invoice"] }

export function MonoInvoicePDF({ invoice }: Props) {
  return <InvoiceLayout invoice={invoice} theme="mono" />
}

export const BlackWhiteInvoicePDF = MonoInvoicePDF
