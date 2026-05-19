"use client"

import Link from "next/link"
import { motion } from "framer-motion"

interface ConcertVenue {
  name: string
  city: string
  country: string
}

export interface ConcertCardData {
  id: string
  title: string
  artist: string
  date: Date | string
  venue: ConcertVenue
  ticketUrl?: string | null
  price?: string | null
  isAvailable: boolean
  gameNames: string[]
}

interface ConcertCardProps {
  concert: ConcertCardData
  className?: string
}

function getUrgencyColor(date: Date | string): {
  color: string
  label: string
} {
  const concertDate = date instanceof Date ? date : new Date(date)
  const now = new Date()
  const daysUntil = Math.ceil(
    (concertDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (daysUntil < 0) return { color: "var(--text-muted)", label: "Passé" }
  if (daysUntil < 7) return { color: "#ef4444", label: `J-${daysUntil}` }
  if (daysUntil < 30) return { color: "#f59e0b", label: `J-${daysUntil}` }
  return { color: "var(--accent-light)", label: `J-${daysUntil}` }
}

function formatDate(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function ConcertCard({ concert, className = "" }: ConcertCardProps) {
  const urgency = getUrgencyColor(concert.date)

  return (
    <motion.article
      className={`relative rounded-2xl overflow-hidden ${className}`}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
      whileHover={{ y: -2, boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}
      transition={{ duration: 0.15 }}
    >
      {/* Urgency strip */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: urgency.color }}
      />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3
              className="text-base font-semibold truncate leading-snug"
              style={{
                fontFamily: "var(--font-cinzel)",
                color: "var(--text)",
              }}
            >
              {concert.title}
            </h3>
            <p
              className="text-sm mt-0.5 truncate"
              style={{ color: "var(--text-muted)" }}
            >
              {concert.artist}
            </p>
          </div>

          {/* Urgency badge */}
          <span
            className="flex-shrink-0 text-xs font-mono px-2 py-1 rounded-full"
            style={{
              color: urgency.color,
              background: `${urgency.color}20`,
              border: `1px solid ${urgency.color}40`,
            }}
          >
            {urgency.label}
          </span>
        </div>

        {/* Date + venue */}
        <div className="space-y-1 mb-4">
          <div
            className="flex items-center gap-2 text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            <span aria-hidden="true">📅</span>
            <span style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
              {formatDate(concert.date)}
            </span>
          </div>
          <div
            className="flex items-center gap-2 text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            <span aria-hidden="true">📍</span>
            <span className="truncate">
              {concert.venue.name}, {concert.venue.city}
            </span>
          </div>
          {concert.price && (
            <div
              className="flex items-center gap-2 text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              <span aria-hidden="true">🎫</span>
              <span style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                {concert.price}
              </span>
            </div>
          )}
        </div>

        {/* Game tags */}
        {concert.gameNames.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {concert.gameNames.slice(0, 3).map((name) => (
              <span
                key={name}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(200,135,42,0.12)",
                  color: "var(--accent-light)",
                  border: "1px solid rgba(200,135,42,0.2)",
                }}
              >
                {name}
              </span>
            ))}
            {concert.gameNames.length > 3 && (
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ color: "var(--text-muted)" }}
              >
                +{concert.gameNames.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <Link
            href={`/concerts/${concert.id}`}
            className="flex-1 inline-flex items-center justify-center h-10 rounded-xl text-sm font-semibold transition-all duration-150"
            style={{
              background: "var(--accent)",
              color: "var(--bg)",
            }}
          >
            Détails
          </Link>

          {concert.ticketUrl && concert.isAvailable && (
            <a
              href={concert.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center h-10 rounded-xl text-sm font-semibold border transition-all duration-150"
              style={{
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
            >
              Billetterie ↗
            </a>
          )}
        </div>
      </div>
    </motion.article>
  )
}
