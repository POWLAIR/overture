import type { NextAuthConfig } from "next-auth"

const PROTECTED_PATHS = ["/dashboard", "/watchlist", "/alerts", "/settings"]

export const authConfig: NextAuthConfig = {
  providers: [],
  pages: {
    signIn: "/connexion",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isProtected = PROTECTED_PATHS.some((path) =>
        nextUrl.pathname.startsWith(path)
      )
      if (isProtected && !isLoggedIn) return false
      return true
    },
  },
}
