import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Medicandle - Back Office",
  description: "Gestion des bougies artisanales",
  icons: {
    icon: [
      { url: "/branding/medicandle_logo.jpg", sizes: "any" },
      { url: "/branding/medicandle_logo.jpg", type: "image/jpeg" },
    ],
    shortcut: "/branding/medicandle_logo.jpg",
    apple: "/branding/medicandle_logo.jpg",
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
