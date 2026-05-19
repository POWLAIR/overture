"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { logout } from "@/lib/auth/actions"

interface AuthNavbarProps {
  user: {
    name: string | null
    email: string | null
    image: string | null
  }
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "♪" },
  { href: "/watchlist", label: "Bibliothèque", icon: "♫" },
  { href: "/alerts", label: "Alertes", icon: "♬" },
  { href: "/settings", label: "Réglages", icon: "𝄞" },
]

export function AuthNavbar({ user }: AuthNavbarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop top bar */}
      <header
        className="hidden md:flex sticky top-0 z-30 items-center justify-between h-14 px-6"
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Link
          href="/dashboard"
          className="text-lg font-bold tracking-wide"
          style={{
            fontFamily: "var(--font-cinzel)",
            color: "var(--accent-light)",
          }}
        >
          Overture
        </Link>

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 h-10 inline-flex items-center rounded-full text-sm transition-colors"
                style={{
                  fontFamily: "var(--font-cinzel)",
                  color: active ? "var(--accent-light)" : "var(--text-muted)",
                  background: active ? "rgba(200,135,42,0.1)" : "transparent",
                }}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          <UserAvatar user={user} />
          <form action={logout}>
            <button
              type="submit"
              className="text-sm transition-colors"
              style={{ color: "var(--text-muted)" }}
            >
              Déconnexion
            </button>
          </form>
        </div>
      </header>

      {/* Mobile top bar */}
      <header
        className="md:hidden sticky top-0 z-30 flex items-center justify-between h-14 px-4"
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Link
          href="/dashboard"
          className="text-lg font-bold tracking-wide"
          style={{
            fontFamily: "var(--font-cinzel)",
            color: "var(--accent-light)",
          }}
        >
          Overture
        </Link>
        <UserAvatar user={user} />
      </header>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 grid grid-cols-4 h-16"
        style={{
          background: "var(--surface)",
          borderTop: "1px solid var(--border)",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 transition-colors min-h-[48px]"
              style={{
                color: active ? "var(--accent-light)" : "var(--text-muted)",
              }}
            >
              <span className="text-lg" aria-hidden="true">
                {item.icon}
              </span>
              <span
                className="text-[10px] tracking-widest uppercase"
                style={{ fontFamily: "var(--font-cinzel)" }}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}

function UserAvatar({
  user,
}: {
  user: AuthNavbarProps["user"]
}) {
  const initial = (user.name ?? user.email ?? "?").charAt(0).toUpperCase()

  if (user.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.image}
        alt=""
        className="w-9 h-9 rounded-full object-cover"
        style={{ border: "1px solid var(--border)" }}
      />
    )
  }

  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold"
      style={{
        fontFamily: "var(--font-cinzel)",
        background: "var(--accent)",
        color: "var(--bg)",
      }}
      aria-label={user.name ?? user.email ?? "Utilisateur"}
    >
      {initial}
    </div>
  )
}
