import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import { processPaymentTerms } from "@/lib/payment-terms"
import { formatInvoiceDate } from "@/lib/date"

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 12,
    fontFamily: "Helvetica",
    color: "#000000",
    lineHeight: 1.2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottom: "2px solid #1e66f5",
  },
  companyInfo: {
    flexDirection: "column",
  },
  companyName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#1e66f5",
    textAlign: "left",
  },
  companyDetails: {
    fontSize: 10,
    lineHeight: 1.3,
    color: "#6c6f85",
    textAlign: "left",
  },
  invoiceInfo: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1e66f5",
    textAlign: "right",
  },
  invoiceNumber: {
    fontSize: 10,
    color: "#1e66f5",
    backgroundColor: "#e6e9ef",
    padding: "6px 12px",
    borderRadius: 4,
    border: "1px solid #1e66f5",
    fontWeight: "bold",
    textAlign: "center",
    alignSelf: "center",
    width: "auto",
    marginBottom: 6,
  },
  statusBadge: {
    fontSize: 12,
    color: "#1e66f5",
    backgroundColor: "#e6e9ef",
    padding: "12px 20px",
    borderRadius: 4,
    marginTop: 6,
    textTransform: "uppercase",
    fontWeight: "bold",
    alignSelf: "center",
    width: "auto",
    letterSpacing: 1,
    border: "1px solid #1e66f5",
    flex: 1,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  clientInfo: {
    marginBottom: 10,
    backgroundColor: "#e6e9ef",
    padding: 10,
    borderRadius: 4,
    border: "1px solid #ccd0da",
    flex: 1,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#1e66f5",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  clientDetails: {
    fontSize: 9,
    lineHeight: 1.2,
    color: "#6c6f85",
  },
  invoiceDetails: {
    marginBottom: 10,
    backgroundColor: "#e6e9ef",
    padding: 10,
    borderRadius: 4,
    border: "1px solid #ccd0da",
    flex: 1,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  table: {
    marginTop: 10,
    border: "2px solid #1e66f5",
    borderRadius: 4,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1e66f5",
    padding: 8,
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottom: "1px solid #ccd0da",
    backgroundColor: "#ffffff",
  },
  tableRowAlt: {
    flexDirection: "row",
    padding: 8,
    borderBottom: "1px solid #ccd0da",
    backgroundColor: "#e6e9ef",
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableCell: {
    fontSize: 9,
    color: "#000000",
  },
  currencyCell: {
    fontSize: 9,
    color: "#000000",
    textAlign: "right",
    fontFamily: "Courier",
    fontWeight: "500",
  },
  descriptionColumn: {
    flex: 3,
  },
  quantityColumn: {
    flex: 1,
    textAlign: "center",
  },
  priceColumn: {
    flex: 1.5,
    textAlign: "right",
  },
  totalColumn: {
    flex: 1.5,
    textAlign: "right",
  },
  totals: {
    marginTop: 10,
    alignItems: "flex-end",
  },
  totalsTable: {
    width: 250,
    backgroundColor: "#e6e9ef",
    padding: 10,
    borderRadius: 4,
    border: "1px solid #ccd0da",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 6,
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 9,
    color: "#6c6f85",
    fontWeight: "500",
  },
  totalValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#1e66f5",
  },
  finalTotal: {
    fontSize: 14,
    fontWeight: "bold",
    paddingTop: 8,
    marginTop: 8,
    color: "#1e66f5",
    borderTop: "1px solid #1e66f5",
  },
  currencyValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#1e66f5",
    textAlign: "right",
    fontFamily: "Courier",
  },
  finalCurrencyValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e66f5",
    textAlign: "right",
    fontFamily: "Courier",
  },
  discountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 8,
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
    border: "2px solid #000000",
  },
  thankYou: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 12,
    color: "#000000",
    fontStyle: "italic",
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 6,
    border: "2px solid #000000",
  },
  footer: {
    marginTop: 15,
    paddingTop: 10,
    borderTop: "1px solid #1e66f5",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  contactInfo: {
    fontSize: 9,
    color: "#6c6f85",
    lineHeight: 1.2,
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#e6e9ef",
    borderRadius: 4,
    border: "1px solid #ccd0da",
  },
  pageNumber: {
    fontSize: 9,
    color: "#6c6f85",
    textAlign: "right",
  },
  notes: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#e6e9ef",
    borderRadius: 4,
    border: "1px solid #ccd0da",
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#1e66f5",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  notesText: {
    fontSize: 9,
    lineHeight: 1.2,
    color: "#6c6f85",
  },
  // Status-specific colors
  statusPaid: {
    fontSize: 12,
    color: "#40a02b",
    backgroundColor: "#e6e9ef",
    padding: "12px 20px",
    borderRadius: 4,
    marginTop: 6,
    textTransform: "uppercase",
    fontWeight: "bold",
    alignSelf: "center",
    width: "auto",
    letterSpacing: 1,
    border: "1px solid #40a02b",
    flex: 1,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  statusPending: {
    fontSize: 12,
    color: "#df8e1d",
    backgroundColor: "#e6e9ef",
    padding: "12px 20px",
    borderRadius: 4,
    marginTop: 6,
    textTransform: "uppercase",
    fontWeight: "bold",
    alignSelf: "center",
    width: "auto",
    letterSpacing: 1,
    border: "1px solid #df8e1d",
    flex: 1,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  statusOverdue: {
    fontSize: 12,
    color: "#d20f39",
    backgroundColor: "#e6e9ef",
    padding: "12px 20px",
    borderRadius: 4,
    marginTop: 6,
    textTransform: "uppercase",
    fontWeight: "bold",
    alignSelf: "center",
    width: "auto",
    letterSpacing: 1,
    border: "1px solid #d20f39",
    flex: 1,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#e6e9ef",
    padding: 10,
    borderRadius: 4,
    border: "1px solid #ccd0da",
    alignItems: "center",
  },
  statLabel: {
    fontSize: 9,
    color: "#6c6f85",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 12,
    color: "#1e66f5",
    fontWeight: "bold",
  },
})

interface SimpleInvoicePDFProps {
  invoice: any
}

export function SimpleInvoicePDF({ invoice }: SimpleInvoicePDFProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (date: string) =>
    formatInvoiceDate(date, { year: "numeric", month: "long", day: "numeric" })

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>
              {invoice.company?.name || invoice.user?.name || "Your Company"}
            </Text>
            {invoice.company?.email && (
              <Text style={styles.companyDetails}>{invoice.company.email}</Text>
            )}
            {invoice.company?.phone && (
              <Text style={styles.companyDetails}>{invoice.company.phone}</Text>
            )}
            {(invoice.company?.address || invoice.company?.city || invoice.company?.state || invoice.company?.country) && (
              <Text style={styles.companyDetails}>
                {invoice.company?.address && `${invoice.company.address}\n`}
                {invoice.company?.city && invoice.company?.state
                  ? `${invoice.company.city}, ${invoice.company.state} ${invoice.company.zipCode || ""}`.trim()
                  : invoice.company?.city || invoice.company?.state || ""
                }
                {invoice.company?.country && `\n${invoice.company.country}`}
              </Text>
            )}

          </View>
          <View style={styles.invoiceInfo}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <View style={{
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              minHeight: 40,
              display: "flex"
            }}>
              {invoice.status && (
                <Text style={
                  invoice.status.toLowerCase() === 'paid' ? styles.statusPaid :
                  invoice.status.toLowerCase() === 'pending' ? styles.statusPending :
                  invoice.status.toLowerCase() === 'overdue' ? styles.statusOverdue :
                  styles.statusBadge
                }>{invoice.status}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {invoice.invoiceNumber && (
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Invoice #</Text>
              <Text style={styles.statValue}>{invoice.invoiceNumber}</Text>
            </View>
          )}
          {invoice.issueDate && (
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Issue Date</Text>
              <Text style={styles.statValue}>{formatInvoiceDate(invoice.issueDate)}</Text>
            </View>
          )}
          {invoice.dueDate && (
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Due Date</Text>
              <Text style={styles.statValue}>{formatInvoiceDate(invoice.dueDate)}</Text>
            </View>
          )}
          {invoice.total && (
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Amount</Text>
              <Text style={styles.statValue}>{formatCurrency(invoice.total)}</Text>
            </View>
          )}
        </View>

        {/* Client Info and Invoice Details Side by Side */}
        <View style={{ flexDirection: "row", marginBottom: 20 }}>
          <View style={styles.clientInfo}>
            <Text style={styles.sectionTitle}>Bill To:</Text>
            <View style={styles.clientDetails}>
              {invoice.client?.name && <Text>{invoice.client.name}</Text>}
              {invoice.client?.email && <Text>{invoice.client.email}</Text>}
              {invoice.client?.phone && <Text>{invoice.client.phone}</Text>}
              {(invoice.client?.address || invoice.client?.city || invoice.client?.state || invoice.client?.country) && (
                <Text>
                  {invoice.client?.address && `${invoice.client.address}\n`}
                  {invoice.client?.city && invoice.client?.state
                    ? `${invoice.client.city}, ${invoice.client.state} ${invoice.client.zipCode || ""}`.trim()
                    : invoice.client?.city || invoice.client?.state || ""
                  }
                  {invoice.client?.country && `\n${invoice.client.country}`}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.invoiceDetails}>
            <Text style={styles.sectionTitle}>Invoice Details</Text>
            <View style={styles.clientDetails}>
              {invoice.issueDate && (
                <Text><Text style={{ fontWeight: "bold" }}>Invoice Date:</Text> {formatDate(invoice.issueDate)}</Text>
              )}
              {invoice.dueDate && (
                <Text><Text style={{ fontWeight: "bold" }}>Due Date:</Text> {formatDate(invoice.dueDate)}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Items Table */}
        {invoice.items && invoice.items.length > 0 && (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.descriptionColumn]}>
                Description
              </Text>
              <Text style={[styles.tableHeaderText, styles.quantityColumn]}>
                Qty
              </Text>
              <Text style={[styles.tableHeaderText, styles.priceColumn]}>
                Unit Price
              </Text>
              <Text style={[styles.tableHeaderText, styles.totalColumn]}>
                Total
              </Text>
            </View>
            {invoice.items.map((item: any, index: number) => (
              <View key={index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <Text style={[styles.tableCell, styles.descriptionColumn]}>
                  {item.description || "Item"}
                </Text>
                <Text style={[styles.tableCell, styles.quantityColumn]}>
{Math.round(item.quantity || 0)}
                </Text>
                <Text style={[styles.currencyCell, styles.priceColumn]}>
                  {formatCurrency(item.unitPrice || 0)}
                </Text>
                <Text style={[styles.currencyCell, styles.totalColumn]}>
                  {formatCurrency(item.total || 0)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Totals */}
        {(invoice.subtotal || invoice.total) && (
          <View style={styles.totals}>
            <View style={styles.totalsTable}>
              {invoice.subtotal && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Subtotal:</Text>
                  <Text style={styles.currencyValue}>
                    {formatCurrency(invoice.subtotal)}
                  </Text>
                </View>
              )}
              {Number(invoice.discountAmount) > 0 && (
                <View style={styles.discountRow}>
                  <Text style={styles.totalLabel}>
                    Discount ({invoice.discountType === "PERCENTAGE" ? `${invoice.discountValue}%` : "Fixed"}):
                  </Text>
                  <Text style={styles.currencyValue}>
                    -{formatCurrency(invoice.discountAmount)}
                  </Text>
                </View>
              )}
              {invoice.discountAmount > 0 && invoice.subtotal && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Subtotal after discount:</Text>
                  <Text style={styles.currencyValue}>
                    {formatCurrency(Number(invoice.subtotal) - Number(invoice.discountAmount))}
                  </Text>
                </View>
              )}
              {Number(invoice.taxAmount) > 0 && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>
                    Tax ({invoice.taxRate || 0}%):
                  </Text>
                  <Text style={styles.currencyValue}>
                    {formatCurrency(invoice.taxAmount)}
                  </Text>
                </View>
              )}
              {invoice.total && (
                <View style={[styles.totalRow, styles.finalTotal]}>
                  <Text style={styles.finalTotal}>Total:</Text>
                  <Text style={styles.finalCurrencyValue}>
                    {formatCurrency(invoice.total)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Payment Terms */}
        {invoice.paymentTerms && (
          <View style={styles.notes}>
            <Text style={styles.notesTitle}>Payment Terms</Text>
            <Text style={styles.notesText}>
              {processPaymentTerms(invoice.paymentTerms, invoice.issueDate, invoice.dueDate)}
            </Text>
          </View>
        )}

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}

        {/* Thank You Message */}
        <View style={styles.thankYou}>
          <Text>Thank you for your business!</Text>
        </View>
      </Page>
    </Document>
  )
}
