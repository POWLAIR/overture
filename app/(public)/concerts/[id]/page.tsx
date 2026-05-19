import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { prisma } from "@/lib/db/prisma"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params
  const concert = await prisma.concert.findUnique({
    where: { id },
    include: { venue: true },
  })

  if (!concert) return { title: "Concert introuvable" }

  return {
    title: concert.title,
    description: `Concert le ${new Date(concert.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} à ${concert.venue?.city ?? "lieu inconnu"}.`,
    openGraph: {
      type: "website",
      title: concert.title,
    },
  }
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function UrgencyBadge({ date }: { date: Date }) {
  const now = new Date()
  const days = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (days < 0) return null

  const color =
    days < 7 ? "#ef4444" : days < 30 ? "#f59e0b" : "var(--accent-light)"

  return (
    <span
      className="inline-flex items-center gap-1.5 text-sm font-mono px-3 py-1 rounded-full"
      style={{ color, background: `${color}20`, border: `1px solid ${color}40` }}
    >
      {days === 0 ? "Aujourd'hui !" : `Dans ${days} jour${days > 1 ? "s" : ""}`}
    </span>
  )
}

export default async function ConcertDetailPage({ params }: PageProps) {
  const { id } = await params

  const concert = await prisma.concert.findUnique({
    where: { id },
    include: { venue: true },
  })

  if (!concert) notFound()

  const concertDate = new Date(concert.date)

  return (
    <main className="min-h-dvh py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Back link */}
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 text-sm mb-8 transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          ← Retour à l&apos;exploration
        </Link>

        {/* Header */}
        <div
          className="rounded-2xl p-6 sm:p-8 mb-6"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="flex flex-wrap items-start gap-3 mb-4">
            <UrgencyBadge date={concertDate} />
            <span
              className="inline-flex items-center text-xs px-2.5 py-1 rounded-full"
              style={{
                background: "rgba(200,135,42,0.12)",
                color: "var(--accent-light)",
                border: "1px solid rgba(200,135,42,0.2)",
              }}
            >
              {concert.source}
            </span>
          </div>

          <h1
            className="text-2xl sm:text-3xl font-bold leading-snug mb-2"
            style={{ fontFamily: "var(--font-cinzel)", color: "var(--text)" }}
          >
            {concert.title}
          </h1>

          <p className="text-lg" style={{ color: "var(--accent-light)" }}>
            {concert.artist}
          </p>
        </div>

        {/* Details grid */}
        <div className="grid gap-4 mb-6">
          {/* Date & time */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <h2
              className="text-xs font-semibold tracking-widest uppercase mb-3"
              style={{ fontFamily: "var(--font-cinzel)", color: "var(--accent)" }}
            >
              Date & heure
            </h2>
            <p className="text-base" style={{ fontFamily: "var(--font-jetbrains-mono)", color: "var(--text)" }}>
              {formatDate(concertDate)}
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              {formatTime(concertDate)}
            </p>
          </div>

          {/* Venue */}
          {concert.venue && (
            <div
              className="rounded-2xl p-5"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <h2
                className="text-xs font-semibold tracking-widest uppercase mb-3"
                style={{ fontFamily: "var(--font-cinzel)", color: "var(--accent)" }}
              >
                Lieu
              </h2>
              <p className="text-base font-semibold" style={{ color: "var(--text)" }}>
                {concert.venue.name}
              </p>
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                {concert.venue.city}, {concert.venue.country}
              </p>
              {concert.venue.url && (
                <a
                  href={concert.venue.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-sm transition-colors"
                  style={{ color: "var(--accent)" }}
                >
                  Site du lieu ↗
                </a>
              )}
            </div>
          )}

          {/* Related games */}
          {concert.gameNames.length > 0 && (
            <div
              className="rounded-2xl p-5"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <h2
                className="text-xs font-semibold tracking-widest uppercase mb-3"
                style={{ fontFamily: "var(--font-cinzel)", color: "var(--accent)" }}
              >
                Jeux associés
              </h2>
              <div className="flex flex-wrap gap-2">
                {concert.gameNames.map((name) => (
                  <span
                    key={name}
                    className="text-sm px-3 py-1 rounded-full"
                    style={{
                      background: "rgba(200,135,42,0.12)",
                      color: "var(--accent-light)",
                      border: "1px solid rgba(200,135,42,0.2)",
                    }}
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Price */}
          {concert.price && (
            <div
              className="rounded-2xl p-5"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <h2
                className="text-xs font-semibold tracking-widest uppercase mb-3"
                style={{ fontFamily: "var(--font-cinzel)", color: "var(--accent)" }}
              >
                Tarif
              </h2>
              <p
                className="text-xl font-semibold"
                style={{ fontFamily: "var(--font-jetbrains-mono)", color: "var(--text)" }}
              >
                {concert.price}
              </p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          {concert.ticketUrl && concert.isAvailable && (
            <a
              href={concert.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center h-14 rounded-full text-base font-semibold transition-all duration-200"
              style={{
                fontFamily: "var(--font-cinzel)",
                background: "var(--accent)",
                color: "var(--bg)",
              }}
            >
              Acheter des billets ↗
            </a>
          )}

          {!concert.isAvailable && (
            <div
              className="flex-1 inline-flex items-center justify-center h-14 rounded-full text-base"
              style={{
                borderColor: "var(--border)",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
              }}
            >
              Billetterie non disponible
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
