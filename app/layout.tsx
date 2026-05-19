import type { Metadata, Viewport } from "next"
import { Cinzel, EB_Garamond, JetBrains_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/ui/ThemeProvider"
import "./globals.css"

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: "swap",
})

const ebGaramond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Overture — Concerts orchestraux de jeux vidéo",
    template: "%s — Overture",
  },
  description:
    "Overture alerte les gamers quand un jeu de leur bibliothèque fait l'objet d'un concert orchestral. Découvrez les concerts de musique de jeux vidéo près de chez vous.",
  keywords: [
    "concert",
    "orchestre",
    "jeux vidéo",
    "musique",
    "overture",
    "video game music",
    "orchestral",
  ],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://overture.music",
    siteName: "Overture",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf7f2" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0a07" },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="fr"
      className={`${cinzel.variable} ${ebGaramond.variable} ${jetbrainsMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
