// Mirror of the slice of src/app/globals.css the PDF renderers need.
// Keep this in lockstep with --ink-*, --citrus*, --status-*-bg/fg.

export const fonts = {
  sans: "Geist",
  serif: "Instrument Serif",
  mono: "JetBrains Mono",
} as const

export const ink = {
  50: "#FAF7F2",
  100: "#F2EEE6",
  200: "#E8E2D5",
  300: "#D6CFBE",
  400: "#A8A293",
  500: "#6E6A60",
  600: "#4A4842",
  700: "#2A2925",
  800: "#161513",
  900: "#0E0E0E",
} as const

export const citrus = {
  base: "#E8FF4A",
  soft: "#F4FFAB",
  on: "#0E0E0E",
} as const

export type StatusKey =
  | "draft"
  | "sent"
  | "viewed"
  | "paid"
  | "overdue"
  | "void"
  | "pending"

export const statusPalette: Record<StatusKey, { bg: string; fg: string }> = {
  draft: { bg: "#E8E2D5", fg: "#4A4842" },
  sent: { bg: "#FCEFC9", fg: "#8A5A00" },
  viewed: { bg: "#ECE2FA", fg: "#4F2A8E" },
  paid: { bg: "#D6EFCB", fg: "#1F5A2E" },
  overdue: { bg: "#FAD9DF", fg: "#94203A" },
  void: { bg: "#ECE8DE", fg: "#6E6A60" },
  pending: { bg: "#FCEFC9", fg: "#8A5A00" },
}

export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 24,
  6: 32,
  7: 48,
  8: 72,
} as const

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  pill: 999,
} as const

export type Theme = "paper" | "mono"

export const themePalette: Record<
  Theme,
  {
    page: string
    text: string
    textMuted: string
    textSubtle: string
    rule: string
    ruleStrong: string
    ruleAccent: string
    accent: string
  }
> = {
  paper: {
    page: ink[50],
    text: ink[900],
    textMuted: ink[500],
    textSubtle: ink[400],
    rule: ink[200],
    ruleStrong: ink[300],
    ruleAccent: ink[900],
    accent: citrus.base,
  },
  mono: {
    page: "#FFFFFF",
    text: ink[900],
    textMuted: ink[600],
    textSubtle: ink[500],
    rule: ink[300],
    ruleStrong: ink[600],
    ruleAccent: ink[900],
    accent: ink[900],
  },
}
