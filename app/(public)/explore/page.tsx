"use client"

import { useState, useEffect, useCallback, useTransition } from "react"
import { WorldMap } from "@/components/map/WorldMap"
import { ConcertTimeline } from "@/components/concert/ConcertTimeline"
import type { ConcertCardData } from "@/components/concert/ConcertCard"

interface FiltersState {
  country: string
  from: string
  to: string
}

export default function ExplorePage() {
  const [concerts, setConcerts] = useState<ConcertCardData[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filters, setFilters] = useState<FiltersState>({
    country: "",
    from: "",
    to: "",
  })
  const [isPending, startTransition] = useTransition()

  const fetchConcerts = useCallback(async () => {
    const params = new URLSearchParams()
    if (filters.country) params.set("country", filters.country)
    if (filters.from) params.set("from", filters.from)
    if (filters.to) params.set("to", filters.to)

    const res = await fetch(`/api/concerts?${params}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    setConcerts(data.concerts ?? [])
  }, [filters])

  useEffect(() => {
    startTransition(() => {
      fetchConcerts().catch(() => setConcerts([]))
    })
  }, [fetchConcerts, startTransition])

  return (
    <div className="flex flex-col h-dvh">
      {/* Top bar */}
      <header
        className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 gap-4"
        style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)" }}
      >
        <h1
          className="text-lg font-bold tracking-wide"
          style={{ fontFamily: "var(--font-cinzel)", color: "var(--accent-light)" }}
        >
          Overture
        </h1>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filters.country}
            onChange={(e) =>
              setFilters((f) => ({ ...f, country: e.target.value }))
            }
            className="h-9 px-3 rounded-lg text-sm border"
            style={{
              background: "var(--bg)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
            aria-label="Filtrer par pays"
          >
            <option value="">Tous les pays</option>
            <option value="FR">France</option>
            <option value="US">États-Unis</option>
            <option value="GB">Royaume-Uni</option>
            <option value="DE">Allemagne</option>
            <option value="JP">Japon</option>
          </select>

          <input
            type="date"
            value={filters.from}
            onChange={(e) =>
              setFilters((f) => ({ ...f, from: e.target.value }))
            }
            className="h-9 px-3 rounded-lg text-sm border"
            style={{
              background: "var(--bg)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
            aria-label="À partir du"
          />

          <input
            type="date"
            value={filters.to}
            onChange={(e) =>
              setFilters((f) => ({ ...f, to: e.target.value }))
            }
            className="h-9 px-3 rounded-lg text-sm border"
            style={{
              background: "var(--bg)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
            aria-label="Jusqu'au"
          />

          {(filters.country || filters.from || filters.to) && (
            <button
              onClick={() => setFilters({ country: "", from: "", to: "" })}
              className="h-9 px-3 rounded-lg text-sm transition-colors"
              style={{ color: "var(--accent)", border: "1px solid var(--accent)" }}
            >
              Effacer
            </button>
          )}
        </div>

        {/* Concert count */}
        <span
          className="flex-shrink-0 text-sm hidden sm:block"
          style={{ fontFamily: "var(--font-jetbrains-mono)", color: "var(--text-muted)" }}
        >
          {isPending ? "…" : `${concerts.length} concerts`}
        </span>
      </header>

      {/* Main split-screen */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map — hidden on small screens, shown on md+ */}
        <div className="hidden md:block flex-1 p-3">
          <WorldMap
            concerts={concerts}
            selectedId={selectedId}
            onSelectConcert={setSelectedId}
            className="h-full"
          />
        </div>

        {/* Timeline sidebar */}
        <aside
          className="w-full md:w-96 flex-shrink-0 flex flex-col"
          style={{ borderLeft: "1px solid var(--border)" }}
        >
          <ConcertTimeline
            concerts={concerts}
            selectedId={selectedId}
            onSelectConcert={setSelectedId}
            loading={isPending}
            className="flex-1 py-2 px-2"
          />
        </aside>
      </div>
    </div>
  )
}
