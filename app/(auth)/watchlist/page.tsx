"use client"

import { AnimatePresence } from "framer-motion"
import { GameSearch } from "@/components/game/GameSearch"
import { WatchlistItem } from "@/components/game/WatchlistItem"
import { useWatchlist } from "@/hooks/useWatchlist"
import { VinylPlayer } from "@/components/vinyl/VinylPlayer"

export default function WatchlistPage() {
  const { games, add, remove, has, isLoading } = useWatchlist(true)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <header className="mb-8">
        <h1
          className="text-2xl sm:text-3xl font-bold mb-2"
          style={{ fontFamily: "var(--font-cinzel)", color: "var(--text)" }}
        >
          Bibliothèque
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          {isLoading
            ? "Chargement…"
            : games.length === 0
              ? "Ajoute des jeux pour suivre leurs concerts."
              : `${games.length} jeu${games.length > 1 ? "x" : ""} suivi${games.length > 1 ? "s" : ""}.`}
        </p>
      </header>

      <section className="mb-10">
        <h2
          className="text-xs font-semibold tracking-widest uppercase mb-3"
          style={{ fontFamily: "var(--font-cinzel)", color: "var(--accent)" }}
        >
          Ajouter un jeu
        </h2>
        <GameSearch onAdd={add} isInWatchlist={has} />
      </section>

      <section>
        <h2
          className="text-xs font-semibold tracking-widest uppercase mb-3"
          style={{ fontFamily: "var(--font-cinzel)", color: "var(--accent)" }}
        >
          Mes jeux
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <VinylPlayer size={64} playing />
          </div>
        ) : games.length === 0 ? (
          <div
            className="rounded-2xl py-12 px-6 text-center"
            style={{
              background: "var(--surface)",
              border: "1px dashed var(--border)",
            }}
          >
            <VinylPlayer size={64} playing={false} />
            <p
              className="mt-4 text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              Recherche un jeu ci-dessus pour démarrer.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AnimatePresence>
              {games.map((game) => (
                <WatchlistItem
                  key={game.steamId}
                  game={game}
                  onRemove={remove}
                />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </section>
    </div>
  )
}
