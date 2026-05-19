"use client"

import { useState, useTransition } from "react"

interface AlertButtonProps {
  concertId: string
  initialAlerted?: boolean
  className?: string
  size?: "sm" | "md"
  onChange?: (alerted: boolean) => void
}

export function AlertButton({
  concertId,
  initialAlerted = false,
  className = "",
  size = "md",
  onChange,
}: AlertButtonProps) {
  const [isAlerted, setIsAlerted] = useState(initialAlerted)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const heightClass = size === "sm" ? "h-9 text-xs" : "h-10 text-sm"

  function toggle(): void {
    setError(null)
    const next = !isAlerted
    setIsAlerted(next)

    startTransition(async () => {
      try {
        const response = next
          ? await fetch("/api/alerts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ concertId }),
            })
          : await fetch(`/api/alerts?concertId=${encodeURIComponent(concertId)}`, {
              method: "DELETE",
            })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        onChange?.(next)
      } catch (e) {
        console.error("[alert-button] toggle failed", e)
        setIsAlerted(!next)
        setError("Impossible de mettre à jour l'alerte")
      }
    })
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={toggle}
        disabled={isPending}
        aria-pressed={isAlerted}
        className={`inline-flex items-center justify-center gap-2 px-4 ${heightClass} rounded-xl font-semibold border transition-all duration-150 disabled:opacity-60 w-full`}
        style={
          isAlerted
            ? {
                background: "var(--accent)",
                color: "var(--bg)",
                borderColor: "var(--accent)",
              }
            : {
                background: "transparent",
                color: "var(--accent)",
                borderColor: "var(--accent)",
              }
        }
      >
        <span aria-hidden="true">{isAlerted ? "🔔" : "🔕"}</span>
        <span>{isAlerted ? "Alerte activée" : "Activer l'alerte"}</span>
      </button>
      {error && (
        <p
          className="text-xs mt-1.5"
          style={{ color: "#ef4444" }}
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  )
}
