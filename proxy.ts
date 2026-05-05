import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

export const { auth: proxy } = NextAuth(authConfig)

export const config = {
  matcher: [
    /*
     * Exclure : fichiers statiques, images Next.js, favicon
     * Inclure : toutes les autres routes (publiques + protégées)
     */
    "/((?!_next/static|_next/image|favicon.ico|icons|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
