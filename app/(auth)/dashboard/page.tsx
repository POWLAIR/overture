import Link from "next/link"
import type { Metadata } from "next"
import { auth } from "@/auth"
import { prisma } from "@/lib/db/prisma"
import { ConcertCard } from "@/components/concert/ConcertCard"
import type { ConcertCardData } from "@/components/concert/ConcertCard"
import { VinylPlayer } from "@/components/vinyl/VinylPlayer"

export const metadata: Metadata = {
  title: "Tableau de bord",
}

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000

interface DashboardConcert extends ConcertCardData {
  rawDate: Date
}

function bucketize(concerts: DashboardConcert[]): {
  thisWeek: DashboardConcert[]
  thisMonth: DashboardConcert[]
  later: DashboardConcert[]
} {
  const now = Date.now()
  const thisWeek: DashboardConcert[] = []
  const thisMonth: DashboardConcert[] = []
  const later: DashboardConcert[] = []

  for (const c of concerts) {
    const diff = c.rawDate.getTime() - now
    if (diff < 0) continue
    if (diff < ONE_WEEK_MS) thisWeek.push(c)
    else if (diff < ONE_MONTH_MS) thisMonth.push(c)
    else later.push(c)
  }

  return { thisWeek, thisMonth, later }
}

function Section({
  title,
  concerts,
}: {
  title: string
  concerts: DashboardConcert[]
}) {
  if (concerts.length === 0) return null
  return (
    <section className="mb-10">
      <h2
        className="text-xs font-semibold tracking-widest uppercase mb-4"
        style={{ fontFamily: "var(--font-cinzel)", color: "var(--accent)" }}
      >
        {title} · {concerts.length}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {concerts.map((c) => (
          <ConcertCard key={c.id} concert={c} />
        ))}
      </div>
    </section>
  )
}

function EmptyState({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <VinylPlayer size={120} playing={false} />
      <h2
        className="text-2xl font-bold mt-8 mb-3"
        style={{ fontFamily: "var(--font-cinzel)", color: "var(--text)" }}
      >
        Bienvenue, {name}
      </h2>
      <p
        className="max-w-md mb-8 leading-relaxed"
        style={{ color: "var(--text-muted)" }}
      >
        Ta bibliothèque est vide. Ajoute tes jeux préférés pour découvrir
        les concerts orchestraux qui te concernent.
      </p>
      <Link
        href="/watchlist"
        className="inline-flex items-center justify-center h-12 px-8 rounded-full text-base font-semibold transition-all"
        style={{
          fontFamily: "var(--font-cinzel)",
          background: "var(--accent)",
          color: "var(--bg)",
        }}
      >
        Ajouter mon premier jeu
      </Link>
    </div>
  )
}

function NoConcerts({ gameCount }: { gameCount: number }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <VinylPlayer size={100} playing={false} />
      <h2
        className="text-xl font-bold mt-6 mb-2"
        style={{ fontFamily: "var(--font-cinzel)", color: "var(--text)" }}
      >
        Aucun concert pour l&apos;instant
      </h2>
      <p
        className="max-w-md mb-6 leading-relaxed"
        style={{ color: "var(--text-muted)" }}
      >
        Tes {gameCount} jeu{gameCount > 1 ? "x" : ""} sont surveillés.
        On t&apos;alertera dès qu&apos;un concert est annoncé.
      </p>
      <Link
        href="/explore"
        className="inline-flex items-center justify-center h-11 px-6 rounded-full text-sm font-semibold border transition-all"
        style={{
          fontFamily: "var(--font-cinzel)",
          borderColor: "var(--border)",
          color: "var(--text)",
        }}
      >
        Explorer tous les concerts
      </Link>
    </div>
  )
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) {
    return null
  }

  const watchlist = await prisma.watchlistGame.findMany({
    where: { userId: session.user.id },
    select: { steamId: true, name: true },
  })

  const watchedSteamIds = watchlist
    .map((g) => g.steamId)
    .filter((id): id is number => id !== null)

  if (watchedSteamIds.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <EmptyState name={session.user.name ?? "musicien"} />
      </div>
    )
  }

  const concerts = await prisma.concert.findMany({
    where: {
      isOfficial: true,
      isAvailable: true,
      date: { gte: new Date() },
      gameIds: { hasSome: watchedSteamIds },
    },
    include: { venue: true },
    orderBy: { date: "asc" },
    take: 60,
  })

  const dashboardConcerts: DashboardConcert[] = concerts
    .filter((c) => c.venue !== null)
    .map((c) => ({
      id: c.id,
      title: c.title,
      artist: c.artist,
      date: c.date,
      rawDate: c.date,
      venue: {
        name: c.venue!.name,
        city: c.venue!.city,
        country: c.venue!.country,
      },
      ticketUrl: c.ticketUrl,
      price: c.price,
      isAvailable: c.isAvailable,
      gameNames: c.gameNames,
    }))

  const { thisWeek, thisMonth, later } = bucketize(dashboardConcerts)
  const total = thisWeek.length + thisMonth.length + later.length

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <header className="mb-10">
        <h1
          className="text-2xl sm:text-3xl font-bold mb-2"
          style={{ fontFamily: "var(--font-cinzel)", color: "var(--text)" }}
        >
          Bonjour, {session.user.name?.split(" ")[0] ?? "musicien"}
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          {total === 0
            ? `On surveille tes ${watchedSteamIds.length} jeu${watchedSteamIds.length > 1 ? "x" : ""}.`
            : `${total} concert${total > 1 ? "s" : ""} pour tes ${watchedSteamIds.length} jeu${watchedSteamIds.length > 1 ? "x" : ""}.`}
        </p>
      </header>

      {total === 0 ? (
        <NoConcerts gameCount={watchedSteamIds.length} />
      ) : (
        <>
          <Section title="Cette semaine" concerts={thisWeek} />
          <Section title="Ce mois-ci" concerts={thisMonth} />
          <Section title="Plus tard" concerts={later} />
        </>
      )}
    </div>
  )
}
