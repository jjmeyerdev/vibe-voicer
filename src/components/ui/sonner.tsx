"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  // Visual styling lives in globals.css `@layer components` — this stays minimal.
  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      closeButton
      expand
      duration={4000}
      {...props}
    />
  )
}

export { Toaster }
