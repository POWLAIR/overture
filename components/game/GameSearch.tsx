"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { WatchlistGame } from "@/hooks/useLocalWatchlist"

interface SteamSearchResult {
  steamId: number
  name: string
  iconUrl: string
}

interface GameSearchProps {
  onAdd: (game: WatchlistGame) => void | Promise<void>
  isInWatchlist: (steamId: number) => boolean
  className?: string
}

export function GameSearch({
  onAdd,
  isInWatchlist,
  className = "",
}: GameSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SteamSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (abortRef.current) abortRef.current.abort()

    const trimmed = query.trim()

    debounceRef.current = setTimeout(async () => {
      if (trimmed.length < 2) {
        setResults([])
        setLoading(false)
        setError(null)
        return
      }

      const controller = new AbortController()
      abortRef.current = controller
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(
          `/api/games/search?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        )
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json()) as { games: SteamSearchResult[] }
        setResults(data.games)
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return
        setError("La recherche a échoué. Réessaie.")
        setResults([])
      } finally {
        setLoading(false)
      }
    }, trimmed.length < 2 ? 0 : 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="relative mb-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un jeu Steam (ex: Hollow Knight)…"
          className="w-full h-12 pl-11 pr-4 rounded-full text-base border transition-colors"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            color: "var(--text)",
          }}
          aria-label="Rechercher un jeu"
        />
        <span
          aria-hidden="true"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-lg"
          style={{ color: "var(--text-muted)" }}
        >
          {loading ? "…" : "🔍"}
        </span>
      </div>

      {error && (
        <div
          className="mb-4 p-3 rounded-lg text-sm"
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#ef4444",
          }}
        >
          {error}
        </div>
      )}

      {results.length > 0 && (
        <ul
          className="rounded-2xl overflow-hidden divide-y"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <AnimatePresence>
            {results.map((game) => {
              const added = isInWatchlist(game.steamId)
              return (
                <motion.li
                  key={game.steamId}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 p-3"
                  style={{ borderColor: "var(--border)" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={game.iconUrl}
                    alt=""
                    className="w-16 h-7 rounded object-cover flex-shrink-0"
                    style={{ background: "var(--bg)" }}
                    loading="lazy"
                  />
                  <span
                    className="flex-1 text-sm truncate"
                    style={{ color: "var(--text)" }}
                  >
                    {game.name}
                  </span>
                  <button
                    type="button"
                    disabled={added}
                    onClick={() =>
                      onAdd({
                        steamId: game.steamId,
                        name: game.name,
                        imageUrl: game.iconUrl,
                      })
                    }
                    className="flex-shrink-0 h-9 px-4 rounded-full text-xs font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      fontFamily: "var(--font-cinzel)",
                      background: added ? "transparent" : "var(--accent)",
                      color: added ? "var(--text-muted)" : "var(--bg)",
                      border: added
                        ? "1px solid var(--border)"
                        : "1px solid transparent",
                    }}
                  >
                    {added ? "Ajouté" : "Ajouter"}
                  </button>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>
      )}

      {!loading && !error && query.trim().length >= 2 && results.length === 0 && (
        <p
          className="text-sm text-center py-6"
          style={{ color: "var(--text-muted)" }}
        >
          Aucun jeu trouvé pour « {query.trim()} ».
        </p>
      )}
    </div>
  )
}
