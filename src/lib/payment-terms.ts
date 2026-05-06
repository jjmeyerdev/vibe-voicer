/**
 * Utility functions for handling payment terms with dynamic values
 */

/**
 * Calculate the number of days between two dates
 */
export function calculateDaysBetween(startDate: Date, endDate: Date): number {
  const timeDiff = endDate.getTime() - startDate.getTime()
  return Math.ceil(timeDiff / (1000 * 3600 * 24))
}

/**
 * Replace placeholders in payment terms text with dynamic values
 * @param paymentTerms - The payment terms text with placeholders
 * @param issueDate - The invoice issue date
 * @param dueDate - The invoice due date
 * @returns The payment terms text with placeholders replaced
 */
export function processPaymentTerms(
  paymentTerms: string | null | undefined,
  issueDate: Date | string,
  dueDate: Date | string
): string {
  if (!paymentTerms) return ""
  
  // Convert dates to Date objects if they're strings
  const issue = typeof issueDate === 'string' ? new Date(issueDate) : issueDate
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
  
  // Calculate days between issue and due date
  const days = calculateDaysBetween(issue, due)
  
  // Replace [X] placeholder with the calculated days
  return paymentTerms.replace(/\[X\]/g, days.toString())
}

/**
 * Get a preview of payment terms with sample dates (30 days from today)
 * @param paymentTerms - The payment terms text with placeholders
 * @returns The payment terms text with placeholders replaced using sample dates
 */
export function getPaymentTermsPreview(paymentTerms: string | null | undefined): string {
  if (!paymentTerms) return ""

  const today = new Date()
  const sampleDueDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days from today

  return processPaymentTerms(paymentTerms, today, sampleDueDate)
}

export const PAYMENT_TERM_OPTIONS = [
  { value: "Due on Receipt", days: 0 },
  { value: "Net 30", days: 30 },
  { value: "Net 60", days: 60 },
  { value: "Net 90", days: 90 },
] as const

export type PaymentTermValue = (typeof PAYMENT_TERM_OPTIONS)[number]["value"]

export function isKnownPaymentTerm(term: string | null | undefined): term is PaymentTermValue {
  return PAYMENT_TERM_OPTIONS.some((o) => o.value === term)
}

export function daysForPaymentTerm(term: string | null | undefined): number | null {
  const match = PAYMENT_TERM_OPTIONS.find((o) => o.value === term)
  return match ? match.days : null
}

export function dueDateFromTerm(issueDate: string, term: string): string | null {
  const days = daysForPaymentTerm(term)
  if (days === null) return null
  const [y, m, d] = issueDate.split("-").map(Number)
  if (!y || !m || !d) return null
  const due = new Date(y, m - 1, d + days)
  const yyyy = due.getFullYear()
  const mm = String(due.getMonth() + 1).padStart(2, "0")
  const dd = String(due.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}
