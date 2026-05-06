import path from "node:path"
import { Font } from "@react-pdf/renderer"

const fontDir = path.join(process.cwd(), "public", "fonts")
const f = (file: string) => path.join(fontDir, file)

let registered = false

export function registerPdfFonts() {
  if (registered) return
  registered = true

  Font.register({
    family: "Geist",
    fonts: [
      { src: f("Geist-Regular.ttf"), fontWeight: 400 },
      { src: f("Geist-Medium.ttf"), fontWeight: 500 },
      { src: f("Geist-SemiBold.ttf"), fontWeight: 600 },
    ],
  })

  Font.register({
    family: "Instrument Serif",
    fonts: [
      { src: f("InstrumentSerif-Regular.woff"), fontWeight: 400 },
      {
        src: f("InstrumentSerif-Italic.woff"),
        fontWeight: 400,
        fontStyle: "italic",
      },
    ],
  })

  Font.register({
    family: "JetBrains Mono",
    fonts: [
      { src: f("JetBrainsMono-Regular.woff"), fontWeight: 400 },
      { src: f("JetBrainsMono-Medium.woff"), fontWeight: 500 },
    ],
  })

  // Long descriptions look cleaner without mid-word hyphenation in narrow cells.
  Font.registerHyphenationCallback((word) => [word])
}

registerPdfFonts()
