"use client"

import { startTransition, useCallback, useEffect, useState } from "react"
import {
  useLocalWatchlist,
  type WatchlistGame,
} from "./useLocalWatchlist"

export type { WatchlistGame } from "./useLocalWatchlist"

export interface UseWatchlistResult {
  games: WatchlistGame[]
  add: (game: WatchlistGame) => Promise<void>
  remove: (steamId: number) => Promise<void>
  has: (steamId: number) => boolean
  isLoading: boolean
  isAuthenticated: boolean
}

interface RemoteGame {
  steamId: number | null
  name: string
  imageUrl: string | null
  addedAt: string
}

function normalizeRemote(game: RemoteGame): WatchlistGame | null {
  if (game.steamId == null) return null
  return {
    steamId: game.steamId,
    name: game.name,
    imageUrl: game.imageUrl ?? undefined,
    addedAt: game.addedAt,
  }
}

export function useWatchlist(isAuthenticated: boolean): UseWatchlistResult {
  const local = useLocalWatchlist()

  const [remoteGames, setRemoteGames] = useState<WatchlistGame[]>([])
  const [remoteLoading, setRemoteLoading] = useState(isAuthenticated)

  const fetchRemote = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) return
    try {
      const res = await fetch("/api/watchlist", { cache: "no-store" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as { games: RemoteGame[] }
      setRemoteGames(
        data.games
          .map(normalizeRemote)
          .filter((g): g is WatchlistGame => g !== null)
      )
    } catch (e) {
      console.error("[useWatchlist] fetch failed", e)
      setRemoteGames([])
    } finally {
      setRemoteLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) return
    startTransition(() => {
      fetchRemote()
    })
  }, [isAuthenticated, fetchRemote])

  const addRemote = useCallback(
    async (game: WatchlistGame): Promise<void> => {
      const optimistic = { ...game, addedAt: new Date().toISOString() }
      setRemoteGames((current) =>
        current.some((g) => g.steamId === game.steamId)
          ? current
          : [optimistic, ...current]
      )
      try {
        const res = await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(game),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
      } catch (e) {
        console.error("[useWatchlist] add failed", e)
        await fetchRemote()
      }
    },
    [fetchRemote]
  )

  const removeRemote = useCallback(
    async (steamId: number): Promise<void> => {
      const previous = remoteGames
      setRemoteGames((current) => current.filter((g) => g.steamId !== steamId))
      try {
        const res = await fetch(`/api/watchlist?steamId=${steamId}`, {
          method: "DELETE",
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
      } catch (e) {
        console.error("[useWatchlist] remove failed", e)
        setRemoteGames(previous)
      }
    },
    [remoteGames]
  )

  if (isAuthenticated) {
    return {
      games: remoteGames,
      add: addRemote,
      remove: removeRemote,
      has: (steamId) => remoteGames.some((g) => g.steamId === steamId),
      isLoading: remoteLoading,
      isAuthenticated: true,
    }
  }

  return {
    games: local.games,
    add: async (game) => {
      local.add(game)
    },
    remove: async (steamId) => {
      local.remove(steamId)
    },
    has: local.has,
    isLoading: local.isLoading,
    isAuthenticated: false,
  }
}
