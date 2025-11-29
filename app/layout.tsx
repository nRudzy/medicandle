import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Medicandle - Back Office",
  description: "Gestion des bougies artisanales",
  icons: {
    icon: [
      { url: "/branding/medicandle_logo_no_bg.png", sizes: "any" },
      { url: "/branding/medicandle_logo_no_bg.png", type: "image/png" },
    ],
    shortcut: "/branding/medicandle_logo_no_bg.png",
    apple: "/branding/medicandle_logo_no_bg.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
