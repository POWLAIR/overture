"use client"

import { useState, useTransition } from "react"
import { signOut } from "next-auth/react"
import { useTheme } from "@/components/ui/ThemeProvider"
import { EnablePushButton } from "@/components/alerts/EnablePushButton"
import { logout } from "@/lib/auth/actions"

type ManualTheme = "dark" | "light" | null

interface Prefs {
  emailAlerts: boolean
  pushAlerts: boolean
  alertDaysBefore: number
  showUnofficialConcerts: boolean
  manualTheme: ManualTheme
}

const DEFAULT_PREFS: Prefs = {
  emailAlerts: true,
  pushAlerts: true,
  alertDaysBefore: 30,
  showUnofficialConcerts: false,
  manualTheme: null,
}

interface SettingsClientProps {
  email: string
  vapidKey?: string
  initialPrefs: Prefs | null
}

async function patchPrefs(partial: Partial<Prefs>): Promise<void> {
  const res = await fetch("/api/user/preferences", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(partial),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section
      className="rounded-2xl p-5 sm:p-6"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <h2
        className="text-xs font-semibold tracking-widest uppercase mb-4"
        style={{ fontFamily: "var(--font-cinzel)", color: "var(--accent)" }}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

function Toggle({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer min-h-[48px]">
      <div>
        <span className="text-sm font-medium" style={{ color: "var(--text)" }}>
          {label}
        </span>
        {description && (
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {description}
          </p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className="relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 disabled:opacity-50"
        style={{ background: checked ? "var(--accent)" : "var(--border)" }}
      >
        <span
          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform duration-200"
          style={{
            background: "var(--bg)",
            transform: checked ? "translateX(20px)" : "translateX(0)",
          }}
        />
      </button>
    </label>
  )
}

export function SettingsClient({
  email,
  vapidKey,
  initialPrefs,
}: SettingsClientProps) {
  const { setManualTheme } = useTheme()
  const [prefs, setPrefs] = useState<Prefs>(initialPrefs ?? DEFAULT_PREFS)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  function update(partial: Partial<Prefs>) {
    const prevPrefs = prefs
    const next = { ...prefs, ...partial }
    setPrefs(next)
    setError(null)

    if ("manualTheme" in partial) {
      setManualTheme(partial.manualTheme ?? null)
    }

    startTransition(async () => {
      try {
        await patchPrefs(partial)
      } catch {
        setPrefs(prevPrefs)
        setError("Impossible de sauvegarder. Réessaie.")
      }
    })
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      "Supprimer définitivement ton compte ? Toutes tes alertes et ta bibliothèque seront perdues. Cette action est irréversible."
    )
    if (!confirmed) return

    setIsDeleting(true)
    setError(null)

    try {
      const res = await fetch("/api/user", { method: "DELETE" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await signOut({ callbackUrl: "/" })
    } catch {
      setError("Impossible de supprimer le compte. Réessaie.")
      setIsDeleting(false)
    }
  }

  const themeOptions: { value: ManualTheme; label: string; desc: string }[] = [
    { value: null, label: "Auto", desc: "Dark 18h–8h, light 8h–18h" },
    { value: "dark", label: "Dark", desc: "Toujours le mode nuit" },
    { value: "light", label: "Light", desc: "Toujours le mode jour" },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-4">
      <header className="mb-6">
        <h1
          className="text-2xl sm:text-3xl font-bold"
          style={{ fontFamily: "var(--font-cinzel)", color: "var(--text)" }}
        >
          Réglages
        </h1>
      </header>

      {error && (
        <div
          className="p-3 rounded-xl text-sm"
          role="alert"
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#ef4444",
          }}
        >
          {error}
        </div>
      )}

      {/* Theme */}
      <Section title="Apparence">
        <div className="flex flex-col sm:flex-row gap-2">
          {themeOptions.map((opt) => {
            const active = prefs.manualTheme === opt.value
            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => update({ manualTheme: opt.value })}
                disabled={isPending}
                className="flex-1 flex flex-col items-start px-4 py-3 rounded-xl border transition-all duration-150 text-left min-h-[56px] disabled:opacity-60"
                style={{
                  background: active ? "rgba(200,135,42,0.12)" : "var(--bg)",
                  borderColor: active ? "var(--accent)" : "var(--border)",
                }}
              >
                <span
                  className="text-sm font-semibold"
                  style={{ color: active ? "var(--accent-light)" : "var(--text)" }}
                >
                  {opt.label}
                </span>
                <span className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {opt.desc}
                </span>
              </button>
            )
          })}
        </div>
      </Section>

      {/* Email notifications */}
      <Section title="Notifications email">
        <div
          className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg"
          style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
        >
          <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
            {email || "—"}
          </span>
        </div>
        <Toggle
          label="Alertes par email"
          description="Reçois un email quand un concert approche."
          checked={prefs.emailAlerts}
          onChange={(v) => update({ emailAlerts: v })}
          disabled={isPending}
        />
      </Section>

      {/* Push notifications */}
      <Section title="Notifications push">
        <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
          Reçois une alerte instantanée dans le navigateur, même sans ouvrir Overture.
        </p>
        <EnablePushButton vapidPublicKey={vapidKey} />
      </Section>

      {/* Alert delay */}
      <Section title="Délai d'alerte">
        <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>
          Nombre de jours avant le concert auquel tu veux être notifié.
        </p>
        <div className="grid grid-cols-4 gap-2">
          {([7, 14, 30, 60] as const).map((days) => {
            const active = prefs.alertDaysBefore === days
            return (
              <button
                key={days}
                type="button"
                onClick={() => update({ alertDaysBefore: days })}
                disabled={isPending}
                className="h-11 rounded-xl border text-sm font-semibold transition-all duration-150 disabled:opacity-60"
                style={{
                  background: active ? "var(--accent)" : "var(--bg)",
                  borderColor: active ? "var(--accent)" : "var(--border)",
                  color: active ? "var(--bg)" : "var(--text)",
                  fontFamily: "var(--font-jetbrains-mono)",
                }}
              >
                {days}j
              </button>
            )
          })}
        </div>
      </Section>

      {/* Concert filters */}
      <Section title="Filtres concerts">
        <Toggle
          label="Concerts non officiels"
          description="Affiche aussi les concerts faiblement scorés par l'algorithme."
          checked={prefs.showUnofficialConcerts}
          onChange={(v) => update({ showUnofficialConcerts: v })}
          disabled={isPending}
        />
      </Section>

      {/* Account */}
      <Section title="Compte">
        <div className="flex flex-col gap-3">
          <form action={logout}>
            <button
              type="submit"
              className="w-full h-11 rounded-xl border text-sm font-semibold transition-all duration-150"
              style={{
                borderColor: "var(--border)",
                color: "var(--text)",
                background: "transparent",
              }}
            >
              Se déconnecter
            </button>
          </form>

          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="w-full h-11 rounded-xl text-sm font-semibold transition-all duration-150 disabled:opacity-50"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#ef4444",
            }}
          >
            {isDeleting ? "Suppression…" : "Supprimer mon compte"}
          </button>
        </div>
      </Section>
    </div>
  )
}
