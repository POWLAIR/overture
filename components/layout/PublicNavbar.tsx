import Link from "next/link"
import { auth } from "@/auth"

export async function PublicNavbar() {
  const session = await auth()
  const user = session?.user ?? null

  const initial =
    (user?.name ?? user?.email ?? "?").charAt(0).toUpperCase() || "?"

  return (
    <header
      className="sticky top-0 z-30 backdrop-blur"
      style={{
        background: "color-mix(in srgb, var(--bg) 85%, transparent)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between h-14 px-4 sm:px-6">
        <Link
          href="/"
          className="text-lg font-bold tracking-wide"
          style={{
            fontFamily: "var(--font-cinzel)",
            color: "var(--accent-light)",
          }}
        >
          Overture
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/explore"
            className="px-3 sm:px-4 h-10 inline-flex items-center rounded-full text-sm transition-colors"
            style={{
              fontFamily: "var(--font-cinzel)",
              color: "var(--text-muted)",
            }}
          >
            Explorer
          </Link>

          {user ? (
            <Link
              href="/dashboard"
              className="ml-1 inline-flex items-center gap-2 h-10 pl-2 pr-3 rounded-full transition-colors"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text)",
              }}
              aria-label="Mon dashboard"
            >
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt=""
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
                  style={{
                    fontFamily: "var(--font-cinzel)",
                    background: "var(--accent)",
                    color: "var(--bg)",
                  }}
                  aria-hidden="true"
                >
                  {initial}
                </span>
              )}
              <span
                className="hidden sm:inline text-sm"
                style={{ fontFamily: "var(--font-cinzel)" }}
              >
                Dashboard
              </span>
            </Link>
          ) : (
            <>
              <Link
                href="/connexion"
                className="hidden sm:inline-flex items-center px-4 h-10 rounded-full text-sm transition-colors"
                style={{
                  fontFamily: "var(--font-cinzel)",
                  color: "var(--text)",
                }}
              >
                Connexion
              </Link>
              <Link
                href="/inscription"
                className="inline-flex items-center px-4 sm:px-5 h-10 rounded-full text-sm font-semibold transition-all"
                style={{
                  fontFamily: "var(--font-cinzel)",
                  background: "var(--accent)",
                  color: "var(--bg)",
                }}
              >
                S&apos;inscrire
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
