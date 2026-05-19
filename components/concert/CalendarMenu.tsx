"use client"

import { useEffect, useRef, useState } from "react"

import { buildGoogleCalendarUrl, type CalendarConcert } from "@/lib/calendar"

interface CalendarMenuProps {
  concert: CalendarConcert
  className?: string
  size?: "sm" | "md"
}

export function CalendarMenu({ concert, className = "", size = "md" }: CalendarMenuProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [open])

  const heightClass = size === "sm" ? "h-9 text-xs" : "h-10 text-sm"
  const googleUrl = buildGoogleCalendarUrl({
    ...concert,
    date: concert.date instanceof Date ? concert.date : new Date(concert.date),
  })
  const icsUrl = `/api/concerts/${concert.id}/calendar`

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`inline-flex items-center justify-center gap-2 px-4 ${heightClass} rounded-xl font-semibold border transition-all duration-150 w-full`}
        style={{
          background: "transparent",
          color: "var(--text)",
          borderColor: "var(--border)",
        }}
      >
        <span aria-hidden="true">📅</span>
        <span>Calendrier</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 min-w-[200px] rounded-xl overflow-hidden shadow-lg"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <a
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-3 text-sm transition-colors hover:opacity-80"
            style={{ color: "var(--text)" }}
          >
            <span aria-hidden="true">🗓</span>
            <span>Google Calendar</span>
          </a>
          <div style={{ borderTop: "1px solid var(--border)" }} />
          <a
            href={icsUrl}
            download
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-3 text-sm transition-colors hover:opacity-80"
            style={{ color: "var(--text)" }}
          >
            <span aria-hidden="true">⬇</span>
            <span>Télécharger .ics</span>
          </a>
        </div>
      )}
    </div>
  )
}
