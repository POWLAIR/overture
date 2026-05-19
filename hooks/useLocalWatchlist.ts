"use client"

import { useCallback, useSyncExternalStore } from "react"

export interface WatchlistGame {
  steamId: number
  name: string
  imageUrl?: string
  addedAt?: string
}

const STORAGE_KEY = "overture:watchlist"

function readStorage(): WatchlistGame[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (g): g is WatchlistGame =>
        typeof g === "object" &&
        g !== null &&
        typeof (g as WatchlistGame).steamId === "number" &&
        typeof (g as WatchlistGame).name === "string"
    )
  } catch {
    return []
  }
}

function writeStorage(games: WatchlistGame[]): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(games))
    window.dispatchEvent(
      new StorageEvent("storage", { key: STORAGE_KEY })
    )
  } catch (e) {
    console.error("[useLocalWatchlist] write failed", e)
  }
}

let cachedSnapshot: WatchlistGame[] | null = null
let lastRaw: string | null = null

function getSnapshot(): WatchlistGame[] {
  if (typeof window === "undefined") return EMPTY
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (raw === lastRaw && cachedSnapshot !== null) return cachedSnapshot
  lastRaw = raw
  cachedSnapshot = readStorage()
  return cachedSnapshot
}

const EMPTY: WatchlistGame[] = []

function getServerSnapshot(): WatchlistGame[] {
  return EMPTY
}

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {}
  function handler(e: StorageEvent) {
    if (e.key === STORAGE_KEY || e.key === null) {
      cachedSnapshot = null
      callback()
    }
  }
  window.addEventListener("storage", handler)
  return () => window.removeEventListener("storage", handler)
}

export interface UseLocalWatchlistResult {
  games: WatchlistGame[]
  add: (game: WatchlistGame) => void
  remove: (steamId: number) => void
  has: (steamId: number) => boolean
  clear: () => void
  isLoading: boolean
}

export function useLocalWatchlist(): UseLocalWatchlistResult {
  const games = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const add = useCallback((game: WatchlistGame) => {
    const current = readStorage()
    if (current.some((g) => g.steamId === game.steamId)) return
    const next = [...current, { ...game, addedAt: new Date().toISOString() }]
    writeStorage(next)
  }, [])

  const remove = useCallback((steamId: number) => {
    const current = readStorage()
    const next = current.filter((g) => g.steamId !== steamId)
    writeStorage(next)
  }, [])

  const has = useCallback(
    (steamId: number) => games.some((g) => g.steamId === steamId),
    [games]
  )

  const clear = useCallback(() => {
    writeStorage([])
  }, [])

  return { games, add, remove, has, clear, isLoading: false }
}
