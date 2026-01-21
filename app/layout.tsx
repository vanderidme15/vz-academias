import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "./providers"
import { hanken, protest } from "./fonts"
import { Toaster } from "sonner"


export const metadata: Metadata = {
  title: "Academias",
  description: "Academias",
  icons: {
    icon: [
      {
        url: "/icon.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.png",
        type: "image/png",
      },
    ],
    apple: "/icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${hanken.variable} ${protest.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster closeButton richColors position="top-right" />
      </body>
    </html>
  )
}