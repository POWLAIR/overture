"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ConcertCard } from "./ConcertCard"
import type { ConcertCardData } from "./ConcertCard"
import { VinylPlayer } from "@/components/vinyl/VinylPlayer"

interface ConcertTimelineProps {
  concerts: ConcertCardData[]
  selectedId?: string | null
  onSelectConcert?: (id: string) => void
  loading?: boolean
  className?: string
}

function groupByMonth(
  concerts: ConcertCardData[]
): Record<string, ConcertCardData[]> {
  return concerts.reduce<Record<string, ConcertCardData[]>>((acc, concert) => {
    const d = concert.date instanceof Date ? concert.date : new Date(concert.date)
    const key = d.toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    })
    if (!acc[key]) acc[key] = []
    acc[key].push(concert)
    return acc
  }, {})
}

export function ConcertTimeline({
  concerts,
  selectedId,
  onSelectConcert,
  loading = false,
  className = "",
}: ConcertTimelineProps) {
  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center gap-6 h-full ${className}`}>
        <VinylPlayer size={80} playing />
        <p
          className="text-sm animate-pulse"
          style={{ color: "var(--text-muted)" }}
        >
          Recherche des concerts…
        </p>
      </div>
    )
  }

  if (concerts.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center gap-6 h-full ${className}`}>
        <VinylPlayer size={80} playing={false} />
        <p
          className="text-base text-center max-w-xs"
          style={{ color: "var(--text-muted)" }}
        >
          Aucun concert trouvé pour ces critères.
          <br />
          <span style={{ color: "var(--accent)" }}>Essaie d&apos;élargir ta recherche.</span>
        </p>
      </div>
    )
  }

  const groups = groupByMonth(concerts)
  const monthKeys = Object.keys(groups)

  return (
    <div className={`overflow-y-auto ${className}`}>
      <AnimatePresence mode="popLayout">
        {monthKeys.map((month, groupIdx) => (
          <motion.div
            key={month}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, delay: groupIdx * 0.05 }}
            className="mb-6"
          >
            {/* Month header */}
            <div
              className="sticky top-0 z-10 py-2 px-1 mb-3 backdrop-blur-sm"
              style={{
                background: "rgba(var(--bg), 0.85)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <h2
                className="text-xs font-semibold tracking-widest uppercase"
                style={{
                  fontFamily: "var(--font-cinzel)",
                  color: "var(--accent)",
                }}
              >
                {month}
              </h2>
            </div>

            {/* Cards */}
            <div className="space-y-3 px-1">
              {groups[month].map((concert, i) => (
                <motion.div
                  key={concert.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  onClick={() => onSelectConcert?.(concert.id)}
                  className="cursor-pointer"
                >
                  <ConcertCard
                    concert={concert}
                    className={selectedId === concert.id ? "outline outline-2 outline-[var(--accent)]" : ""}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
