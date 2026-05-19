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
  const [filtersOpen, setFiltersOpen] = useState(false)
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

  const activeFilterCount =
    (filters.country ? 1 : 0) + (filters.from ? 1 : 0) + (filters.to ? 1 : 0)

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem)]">
      {/* Sub-header : counter + filter toggle */}
      <header
        className="flex-shrink-0 px-4 sm:px-6 py-3"
        style={{
          borderBottom: "1px solid var(--border)",
          background: "var(--surface)",
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <span
            className="text-sm"
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              color: "var(--text-muted)",
            }}
          >
            {isPending
              ? "Recherche…"
              : `${concerts.length} concert${concerts.length > 1 ? "s" : ""}`}
          </span>

          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            className="md:hidden inline-flex items-center gap-2 h-9 px-3 rounded-full text-sm transition-colors"
            style={{
              border: "1px solid var(--border)",
              color: activeFilterCount > 0 ? "var(--accent)" : "var(--text)",
              background: "var(--bg)",
            }}
            aria-expanded={filtersOpen}
            aria-controls="explore-filters"
          >
            Filtres
            {activeFilterCount > 0 && (
              <span
                className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-mono"
                style={{
                  background: "var(--accent)",
                  color: "var(--bg)",
                }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Desktop filters inline */}
          <div className="hidden md:flex items-center gap-2 flex-wrap">
            <FilterControls
              filters={filters}
              onChange={(next) => setFilters(next)}
            />
          </div>
        </div>

        {/* Mobile filters drawer */}
        <div
          id="explore-filters"
          className={`md:hidden grid transition-all duration-200 ease-out ${
            filtersOpen ? "grid-rows-[1fr] mt-3" : "grid-rows-[0fr]"
          }`}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col gap-2">
              <FilterControls
                filters={filters}
                onChange={(next) => setFilters(next)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main split-screen */}
      <div className="flex-1 flex overflow-hidden">
        <div className="hidden md:block flex-1 p-3">
          <WorldMap
            concerts={concerts}
            selectedId={selectedId}
            onSelectConcert={setSelectedId}
            className="h-full"
          />
        </div>

        <aside
          className="w-full md:w-96 flex-shrink-0 flex flex-col"
          style={{ borderLeft: "1px solid var(--border)" }}
        >
          <ConcertTimeline
            concerts={concerts}
            selectedId={selectedId}
            onSelectConcert={setSelectedId}
            loading={isPending}
            className="flex-1 px-3 py-3"
          />
        </aside>
      </div>
    </div>
  )
}

interface FilterControlsProps {
  filters: FiltersState
  onChange: (next: FiltersState) => void
}

function FilterControls({ filters, onChange }: FilterControlsProps) {
  const hasActive = !!(filters.country || filters.from || filters.to)

  const baseInputClass =
    "h-10 md:h-9 px-3 rounded-lg text-sm border w-full md:w-auto"
  const baseInputStyle = {
    background: "var(--bg)",
    borderColor: "var(--border)",
    color: "var(--text)",
  }

  return (
    <>
      <select
        value={filters.country}
        onChange={(e) => onChange({ ...filters, country: e.target.value })}
        className={baseInputClass}
        style={baseInputStyle}
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
        onChange={(e) => onChange({ ...filters, from: e.target.value })}
        className={baseInputClass}
        style={baseInputStyle}
        aria-label="À partir du"
      />

      <input
        type="date"
        value={filters.to}
        onChange={(e) => onChange({ ...filters, to: e.target.value })}
        className={baseInputClass}
        style={baseInputStyle}
        aria-label="Jusqu'au"
      />

      {hasActive && (
        <button
          type="button"
          onClick={() => onChange({ country: "", from: "", to: "" })}
          className="h-10 md:h-9 px-3 rounded-lg text-sm transition-colors"
          style={{
            color: "var(--accent)",
            border: "1px solid var(--accent)",
          }}
        >
          Effacer
        </button>
      )}
    </>
  )
}
