// app/fonts.ts
import { Hanken_Grotesk, Protest_Strike } from "next/font/google"

export const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-sans",
  display: "swap",
})

export const protest = Protest_Strike({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
})
