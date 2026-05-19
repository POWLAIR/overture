"use client"

import { motion } from "framer-motion"
import type { WatchlistGame } from "@/hooks/useLocalWatchlist"

interface WatchlistItemProps {
  game: WatchlistGame
  onRemove: (steamId: number) => void | Promise<void>
}

export function WatchlistItem({ game, onRemove }: WatchlistItemProps) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.15 }}
      className="flex items-center gap-3 p-3 rounded-xl"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      {game.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={game.imageUrl}
          alt=""
          className="w-20 h-9 rounded object-cover flex-shrink-0"
          style={{ background: "var(--bg)" }}
          loading="lazy"
        />
      ) : (
        <div
          className="w-20 h-9 rounded flex-shrink-0 flex items-center justify-center text-xs"
          style={{ background: "var(--bg)", color: "var(--text-muted)" }}
        >
          🎮
        </div>
      )}

      <span
        className="flex-1 text-sm truncate"
        style={{ color: "var(--text)" }}
      >
        {game.name}
      </span>

      <button
        type="button"
        onClick={() => onRemove(game.steamId)}
        className="flex-shrink-0 h-9 px-3 rounded-full text-xs transition-colors"
        style={{
          color: "var(--text-muted)",
          border: "1px solid var(--border)",
        }}
        aria-label={`Retirer ${game.name} de la watchlist`}
      >
        Retirer
      </button>
    </motion.li>
  )
}
