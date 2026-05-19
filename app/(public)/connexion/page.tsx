"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import { login, loginWithGoogle } from "@/lib/auth/actions"
import { VinylPlayer } from "@/components/vinyl/VinylPlayer"

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center w-full h-12 rounded-full text-base font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        fontFamily: "var(--font-cinzel)",
        background: "var(--accent)",
        color: "var(--bg)",
      }}
    >
      {pending ? "Connexion…" : label}
    </button>
  )
}

function GoogleButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-3 w-full h-12 rounded-full text-base font-semibold border transition-all duration-150 disabled:opacity-50"
      style={{
        borderColor: "var(--border)",
        color: "var(--text)",
        background: "var(--surface)",
      }}
    >
      <GoogleIcon />
      Continuer avec Google
    </button>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"
      />
    </svg>
  )
}

export default function ConnexionPage() {
  const [state, formAction] = useActionState(login, undefined)

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo + title */}
        <Link href="/" className="flex flex-col items-center gap-4 mb-10">
          <VinylPlayer size={64} playing />
          <h1
            className="text-3xl font-bold tracking-wide"
            style={{
              fontFamily: "var(--font-cinzel)",
              color: "var(--accent-light)",
            }}
          >
            Overture
          </h1>
        </Link>

        <div
          className="rounded-2xl p-6 sm:p-8"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <h2
            className="text-xl font-bold mb-2"
            style={{ fontFamily: "var(--font-cinzel)", color: "var(--text)" }}
          >
            Connexion
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            Bon retour parmi nous.
          </p>

          {/* Google */}
          <form action={loginWithGoogle} className="mb-4">
            <GoogleButton />
          </form>

          {/* Separator */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              ou
            </span>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>

          {/* Credentials */}
          <form action={formAction} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text)" }}
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full h-11 px-3 rounded-lg text-base border transition-colors"
                style={{
                  background: "var(--bg)",
                  borderColor: "var(--border)",
                  color: "var(--text)",
                }}
              />
              {state?.errors?.email && (
                <p className="mt-1 text-sm" style={{ color: "#ef4444" }}>
                  {state.errors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text)" }}
              >
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full h-11 px-3 rounded-lg text-base border transition-colors"
                style={{
                  background: "var(--bg)",
                  borderColor: "var(--border)",
                  color: "var(--text)",
                }}
              />
              {state?.errors?.password && (
                <p className="mt-1 text-sm" style={{ color: "#ef4444" }}>
                  {state.errors.password}
                </p>
              )}
            </div>

            {state?.message && (
              <div
                className="p-3 rounded-lg text-sm"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "#ef4444",
                }}
              >
                {state.message}
              </div>
            )}

            <SubmitButton label="Se connecter" />
          </form>
        </div>

        <p
          className="text-center text-sm mt-6"
          style={{ color: "var(--text-muted)" }}
        >
          Pas encore de compte ?{" "}
          <Link
            href="/inscription"
            className="font-semibold underline-offset-4 hover:underline"
            style={{ color: "var(--accent)" }}
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </main>
  )
}
