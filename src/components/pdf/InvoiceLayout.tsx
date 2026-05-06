import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { formatInvoiceDate } from "@/lib/date";
import { processPaymentTerms } from "@/lib/payment-terms";
import "./register-fonts";
import {
  fonts,
  ink,
  space,
  radius,
  statusPalette,
  themePalette,
  type StatusKey,
  type Theme,
} from "./tokens";

type Nullable<T> = T | null | undefined;

type InvoiceItem = {
  description?: Nullable<string>;
  quantity?: Nullable<number | string>;
  unitPrice?: Nullable<number | string>;
  total?: Nullable<number | string>;
};

type Party = {
  name?: Nullable<string>;
  email?: Nullable<string>;
  phone?: Nullable<string>;
  address?: Nullable<string>;
  city?: Nullable<string>;
  state?: Nullable<string>;
  zipCode?: Nullable<string>;
  country?: Nullable<string>;
};

type Invoice = {
  invoiceNumber?: Nullable<string>;
  status?: Nullable<string>;
  issueDate?: Nullable<string | Date>;
  dueDate?: Nullable<string | Date>;
  client?: Nullable<Party>;
  company?: Nullable<Party>;
  user?: Nullable<{ name?: Nullable<string>; email?: Nullable<string> }>;
  items?: Nullable<InvoiceItem[]>;
  subtotal?: Nullable<number | string>;
  discountType?: Nullable<string>;
  discountValue?: Nullable<number | string>;
  discountAmount?: Nullable<number | string>;
  taxRate?: Nullable<number | string>;
  taxAmount?: Nullable<number | string>;
  total?: Nullable<number | string>;
  notes?: Nullable<string>;
  paymentTerms?: Nullable<string>;
};

const formatCurrency = (amount: number | string | undefined) => {
  const n = Number(amount ?? 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number.isFinite(n) ? n : 0);
};

const formatDate = (date: string | Date | undefined) => {
  if (!date) return "";
  return formatInvoiceDate(date, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const composeAddress = (p?: Nullable<Party>) => {
  if (!p) return [] as string[];
  const lines: string[] = [];
  if (p.address) lines.push(p.address);
  const cityState = [p.city, p.state].filter(Boolean).join(", ");
  const cityLine = [cityState, p.zipCode].filter(Boolean).join(" ");
  if (cityLine) lines.push(cityLine);
  if (p.country) lines.push(p.country);
  return lines;
};

const normalizeStatus = (raw?: string): StatusKey | null => {
  if (!raw) return null;
  const k = raw.toLowerCase() as StatusKey;
  return k in statusPalette ? k : null;
};

const buildStyles = (theme: Theme) => {
  const c = themePalette[theme];
  return StyleSheet.create({
    page: {
      backgroundColor: c.page,
      color: c.text,
      paddingHorizontal: space[7],
      paddingVertical: space[7],
      fontFamily: fonts.sans,
      fontSize: 10,
      lineHeight: 1.5,
    },
    overline: {
      fontFamily: fonts.sans,
      fontSize: 7.5,
      fontWeight: 600,
      color: c.textMuted,
      letterSpacing: 1.2,
      textTransform: "uppercase",
    },
    headerBand: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      paddingBottom: space[5],
      borderBottomWidth: 0.75,
      borderBottomColor: c.rule,
      borderBottomStyle: "solid",
    },
    headerLeft: {
      flexDirection: "column",
      gap: 6,
    },
    headerInvoiceLabel: {
      fontFamily: fonts.serif,
      fontStyle: "italic",
      fontSize: 22,
      color: c.text,
      lineHeight: 1.05,
    },
    headerInvoiceNumber: {
      fontFamily: fonts.mono,
      fontSize: 18,
      color: c.text,
      letterSpacing: -0.2,
    },
    headerRight: {
      flexDirection: "column",
      alignItems: "flex-end",
      maxWidth: 240,
    },
    companyName: {
      fontFamily: fonts.serif,
      fontStyle: "italic",
      fontSize: 14,
      color: c.text,
      marginBottom: 2,
    },
    companyLine: {
      fontFamily: fonts.sans,
      fontSize: 9,
      color: c.textMuted,
      lineHeight: 1.55,
      textAlign: "right",
    },
    metaRow: {
      flexDirection: "row",
      gap: space[5],
      marginTop: space[5],
      marginBottom: space[6],
      alignItems: "flex-end",
    },
    metaCell: {
      flexDirection: "column",
      gap: 4,
    },
    metaValue: {
      fontFamily: fonts.mono,
      fontSize: 11,
      color: c.text,
    },
    metaCellSpacer: { flex: 1 },
    statusPill: {
      paddingVertical: 2,
      paddingHorizontal: 9,
      borderRadius: radius.pill,
      fontSize: 8.5,
      fontFamily: fonts.sans,
      fontWeight: 600,
      letterSpacing: 0.4,
      textTransform: "uppercase",
      alignSelf: "flex-start",
    },
    parties: {
      flexDirection: "row",
      gap: space[5],
      marginBottom: space[6],
    },
    partyCol: {
      flex: 1,
      flexDirection: "column",
      gap: 6,
    },
    partyName: {
      fontFamily: fonts.serif,
      fontSize: 14,
      color: c.text,
      lineHeight: 1.2,
    },
    partyLine: {
      fontFamily: fonts.sans,
      fontSize: 9.5,
      color: c.textMuted,
      lineHeight: 1.6,
    },
    table: {
      flexDirection: "column",
      marginBottom: space[5],
    },
    tableHead: {
      flexDirection: "row",
      paddingBottom: 6,
      borderBottomWidth: 0.75,
      borderBottomColor: c.ruleStrong,
      borderBottomStyle: "solid",
    },
    tableRow: {
      flexDirection: "row",
      paddingVertical: 9,
      borderBottomWidth: 0.5,
      borderBottomColor: c.rule,
      borderBottomStyle: "solid",
    },
    colDescription: { flex: 1, paddingRight: space[3] },
    colQty: { width: 50, textAlign: "right" },
    colRate: { width: 80, textAlign: "right" },
    colAmount: { width: 90, textAlign: "right" },
    cellDescription: {
      fontFamily: fonts.sans,
      fontSize: 10.5,
      color: c.text,
      lineHeight: 1.4,
    },
    cellNum: {
      fontFamily: fonts.mono,
      fontSize: 10.5,
      color: c.text,
    },
    totals: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: space[3],
      marginBottom: space[5],
    },
    totalsBox: {
      width: 240,
      flexDirection: "column",
      gap: 5,
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
    },
    totalLabel: {
      fontFamily: fonts.sans,
      fontSize: 10,
      color: c.textMuted,
    },
    totalValue: {
      fontFamily: fonts.mono,
      fontSize: 10,
      color: c.text,
    },
    totalDueRule: {
      marginTop: 6,
      borderTopWidth: 1.25,
      borderTopColor: c.ruleAccent,
      borderTopStyle: "solid",
      paddingTop: 8,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
    },
    totalDueLabel: {
      fontFamily: fonts.serif,
      fontStyle: "italic",
      fontSize: 16,
      color: c.text,
    },
    totalDueValue: {
      fontFamily: fonts.mono,
      fontWeight: 500,
      fontSize: 16,
      color: c.text,
    },
    notesBlock: {
      marginTop: space[5],
      paddingTop: space[3],
      borderTopWidth: 0.5,
      borderTopColor: c.ruleStrong,
      borderTopStyle: "dashed",
      flexDirection: "column",
      gap: 8,
    },
    notesGroup: {
      flexDirection: "column",
      gap: 4,
    },
    notesText: {
      fontFamily: fonts.sans,
      fontSize: 9.5,
      color: c.textMuted,
      lineHeight: 1.55,
    },
    footer: {
      position: "absolute",
      left: space[7],
      right: space[7],
      bottom: space[6],
      paddingTop: 10,
      borderTopWidth: 0.5,
      borderTopColor: c.rule,
      borderTopStyle: "solid",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    footerLeft: {
      fontFamily: fonts.sans,
      fontSize: 8.5,
      color: c.textMuted,
    },
    footerRight: {
      fontFamily: fonts.mono,
      fontSize: 8.5,
      color: c.textSubtle,
      letterSpacing: 0.4,
    },
  });
};

function StatusPill({
  status,
  theme,
  styles,
}: {
  status: string;
  theme: Theme;
  styles: ReturnType<typeof buildStyles>;
}) {
  const key = normalizeStatus(status);
  const label = (key ?? status).toUpperCase();
  if (theme === "mono" || !key) {
    return (
      <Text
        style={[
          styles.statusPill,
          {
            color: ink[900],
            backgroundColor: "transparent",
            borderWidth: 0.75,
            borderStyle: "solid",
            borderColor: ink[900],
          },
        ]}
      >
        {label}
      </Text>
    );
  }
  const palette = statusPalette[key];
  return (
    <Text
      style={[
        styles.statusPill,
        { color: palette.fg, backgroundColor: palette.bg },
      ]}
    >
      {label}
    </Text>
  );
}

function PartyBlock({
  label,
  party,
  styles,
  fallbackName,
  nameOnly = false,
}: {
  label: string;
  party?: Nullable<Party>;
  styles: ReturnType<typeof buildStyles>;
  fallbackName?: string;
  nameOnly?: boolean;
}) {
  const lines = nameOnly ? [] : composeAddress(party);
  const name = party?.name || fallbackName;
  return (
    <View style={styles.partyCol}>
      <Text style={styles.overline}>{label}</Text>
      {name ? <Text style={styles.partyName}>{name}</Text> : null}
      {!nameOnly && party?.email ? (
        <Text style={styles.partyLine}>{party.email}</Text>
      ) : null}
      {!nameOnly && party?.phone ? (
        <Text style={styles.partyLine}>{party.phone}</Text>
      ) : null}
      {lines.length > 0 ? (
        <Text style={styles.partyLine}>{lines.join("\n")}</Text>
      ) : null}
    </View>
  );
}

export interface InvoiceLayoutProps {
  invoice: Invoice;
  theme?: Theme;
}

export function InvoiceLayout({
  invoice,
  theme = "paper",
}: InvoiceLayoutProps) {
  const styles = buildStyles(theme);

  const issuerName =
    invoice.company?.name || invoice.user?.name || "Your Company";

  const subtotal = Number(invoice.subtotal ?? 0);
  const discountAmount = Number(invoice.discountAmount ?? 0);
  const taxAmount = Number(invoice.taxAmount ?? 0);
  const taxRate = Number(invoice.taxRate ?? 0);
  const total = Number(invoice.total ?? 0);
  const items = invoice.items ?? [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBand}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerInvoiceLabel}>Invoice</Text>
            {invoice.invoiceNumber ? (
              <Text style={styles.headerInvoiceNumber}>
                {invoice.invoiceNumber}
              </Text>
            ) : null}
          </View>
          {/* <View style={styles.headerRight}>
            <Text style={styles.companyName}>{issuerName}</Text>
            {issuerEmail ? (
              <Text style={styles.companyLine}>{issuerEmail}</Text>
            ) : null}
            {issuerPhone ? (
              <Text style={styles.companyLine}>{issuerPhone}</Text>
            ) : null}
            {issuerLines.length > 0 ? (
              <Text style={styles.companyLine}>{issuerLines.join("\n")}</Text>
            ) : null}
          </View> */}
        </View>

        <View style={styles.metaRow}>
          {invoice.issueDate ? (
            <View style={styles.metaCell}>
              <Text style={styles.overline}>Issued</Text>
              <Text style={styles.metaValue}>
                {formatDate(invoice.issueDate)}
              </Text>
            </View>
          ) : null}
          {invoice.dueDate ? (
            <View style={styles.metaCell}>
              <Text style={styles.overline}>Due</Text>
              <Text style={styles.metaValue}>
                {formatDate(invoice.dueDate)}
              </Text>
            </View>
          ) : null}
          <View style={styles.metaCellSpacer} />
          {invoice.status ? (
            <View style={[styles.metaCell, { alignItems: "flex-end" }]}>
              <Text style={styles.overline}>Status</Text>
              <StatusPill
                status={invoice.status}
                theme={theme}
                styles={styles}
              />
            </View>
          ) : null}
        </View>

        <View style={styles.parties}>
          <PartyBlock
            label="From"
            party={invoice.company}
            fallbackName={issuerName}
            styles={styles}
          />
          <PartyBlock
            label="Bill to"
            party={invoice.client}
            styles={styles}
            nameOnly
          />
        </View>

        {items.length > 0 ? (
          <View style={styles.table}>
            <View style={styles.tableHead}>
              <Text style={[styles.overline, styles.colDescription]}>
                Description
              </Text>
              <Text style={[styles.overline, styles.colQty]}>Qty</Text>
              <Text style={[styles.overline, styles.colRate]}>Rate</Text>
              <Text style={[styles.overline, styles.colAmount]}>Amount</Text>
            </View>
            {items.map((item, idx) => {
              const qty = Number(item.quantity ?? 0);
              const unit = Number(item.unitPrice ?? 0);
              const lineTotal = Number(item.total ?? qty * unit);
              return (
                <View key={idx} style={styles.tableRow} wrap={false}>
                  <Text style={[styles.cellDescription, styles.colDescription]}>
                    {item.description || "—"}
                  </Text>
                  <Text style={[styles.cellNum, styles.colQty]}>{qty}</Text>
                  <Text style={[styles.cellNum, styles.colRate]}>
                    {formatCurrency(unit)}
                  </Text>
                  <Text style={[styles.cellNum, styles.colAmount]}>
                    {formatCurrency(lineTotal)}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : null}

        <View style={styles.totals}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
            </View>
            {discountAmount > 0 ? (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                  Discount
                  {invoice.discountType === "PERCENTAGE" &&
                  invoice.discountValue
                    ? ` · ${Number(invoice.discountValue)}%`
                    : ""}
                </Text>
                <Text style={styles.totalValue}>
                  −{formatCurrency(discountAmount)}
                </Text>
              </View>
            ) : null}
            {taxAmount > 0 ? (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                  Tax{taxRate > 0 ? ` · ${taxRate}%` : ""}
                </Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(taxAmount)}
                </Text>
              </View>
            ) : null}
            <View style={styles.totalDueRule}>
              <Text style={styles.totalDueLabel}>Total due</Text>
              <Text style={styles.totalDueValue}>{formatCurrency(total)}</Text>
            </View>
          </View>
        </View>

        {invoice.notes || invoice.paymentTerms ? (
          <View style={styles.notesBlock}>
            {invoice.paymentTerms ? (
              <View style={styles.notesGroup}>
                <Text style={styles.overline}>Payment terms</Text>
                <Text style={styles.notesText}>
                  {processPaymentTerms(
                    invoice.paymentTerms,
                    invoice.issueDate as string,
                    invoice.dueDate as string,
                  )}
                </Text>
              </View>
            ) : null}
            {invoice.notes ? (
              <View style={styles.notesGroup}>
                <Text style={styles.overline}>Notes</Text>
                <Text style={styles.notesText}>{invoice.notes}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.footer} fixed>
          <Text style={styles.footerLeft}>
            {invoice.paymentTerms ? "Thank you" : ""}
          </Text>
          <Text style={styles.footerRight}>POWERED BY VIBE VOICER</Text>
        </View>
      </Page>
    </Document>
  );
}
