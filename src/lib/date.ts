export function parseInvoiceDate(input: string): Date {
  // Calendar dates ("YYYY-MM-DD") get anchored to UTC midnight so they round-trip
  // intact regardless of viewer timezone. Full timestamps pass through untouched.
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(input)
  return new Date(dateOnly ? `${input}T00:00:00.000Z` : input)
}

export function formatInvoiceDate(
  input: Date | string,
  opts: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" }
): string {
  const d = typeof input === "string" ? new Date(input) : input
  return d.toLocaleDateString("en-US", { ...opts, timeZone: "UTC" })
}

export function toInvoiceDateInputValue(input: Date | string): string {
  const d = typeof input === "string" ? new Date(input) : input
  const yyyy = d.getUTCFullYear()
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0")
  const dd = String(d.getUTCDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}
