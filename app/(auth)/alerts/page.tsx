import Link from "next/link"
import type { Metadata } from "next"

import { auth } from "@/auth"
import { prisma } from "@/lib/db/prisma"
import { ConcertCard } from "@/components/concert/ConcertCard"
import type { ConcertCardData } from "@/components/concert/ConcertCard"
import { AlertButton } from "@/components/concert/AlertButton"
import { CalendarMenu } from "@/components/concert/CalendarMenu"
import { EnablePushButton } from "@/components/alerts/EnablePushButton"
import { VinylPlayer } from "@/components/vinyl/VinylPlayer"

export const metadata: Metadata = {
  title: "Mes alertes",
}

function filterUpcoming<T extends { concert: { date: Date } }>(items: T[]): T[] {
  const now = Date.now()
  return items.filter((a) => a.concert.date.getTime() >= now)
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16">
      <VinylPlayer size={100} playing={false} />
      <h2
        className="text-xl font-bold mt-6 mb-2"
        style={{ fontFamily: "var(--font-cinzel)", color: "var(--text)" }}
      >
        Aucune alerte pour l&apos;instant
      </h2>
      <p
        className="max-w-md mb-6 leading-relaxed"
        style={{ color: "var(--text-muted)" }}
      >
        Active une alerte depuis l&apos;explorateur ou ton dashboard.
        Tu recevras un email et une notification quand le concert approche.
      </p>
      <Link
        href="/explore"
        className="inline-flex items-center justify-center h-11 px-6 rounded-full text-sm font-semibold transition-all"
        style={{
          fontFamily: "var(--font-cinzel)",
          background: "var(--accent)",
          color: "var(--bg)",
        }}
      >
        Explorer les concerts
      </Link>
    </div>
  )
}

export default async function AlertsPage() {
  const session = await auth()
  if (!session?.user?.id) {
    return null
  }

  const alerts = await prisma.alert.findMany({
    where: { userId: session.user.id },
    include: {
      concert: { include: { venue: true } },
    },
    orderBy: { concert: { date: "asc" } },
  })

  const vapidPublicKey =
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? process.env.VAPID_PUBLIC_KEY

  const upcoming = filterUpcoming(alerts)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <header className="mb-8">
        <h1
          className="text-2xl sm:text-3xl font-bold mb-2"
          style={{ fontFamily: "var(--font-cinzel)", color: "var(--text)" }}
        >
          Mes alertes
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          {upcoming.length === 0
            ? "Active des alertes pour ne plus rater un concert."
            : `${upcoming.length} concert${upcoming.length > 1 ? "s" : ""} suivi${upcoming.length > 1 ? "s" : ""}.`}
        </p>
      </header>

      <section
        className="mb-10 rounded-2xl p-5"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        <h2
          className="text-xs font-semibold tracking-widest uppercase mb-3"
          style={{ fontFamily: "var(--font-cinzel)", color: "var(--accent)" }}
        >
          Notifications push
        </h2>
        <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
          Active les notifications pour recevoir une alerte instantanée
          quand un concert approche.
        </p>
        <EnablePushButton vapidPublicKey={vapidPublicKey} />
      </section>

      {upcoming.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcoming.map((alert) => {
            if (!alert.concert.venue) return null
            const data: ConcertCardData = {
              id: alert.concert.id,
              title: alert.concert.title,
              artist: alert.concert.artist,
              date: alert.concert.date,
              venue: {
                name: alert.concert.venue.name,
                city: alert.concert.venue.city,
                country: alert.concert.venue.country,
              },
              ticketUrl: alert.concert.ticketUrl,
              price: alert.concert.price,
              isAvailable: alert.concert.isAvailable,
              gameNames: alert.concert.gameNames,
            }
            return (
              <div key={alert.id} className="flex flex-col gap-2">
                <ConcertCard concert={data} />
                <div className="grid grid-cols-2 gap-2">
                  <AlertButton
                    concertId={alert.concert.id}
                    initialAlerted
                    size="sm"
                  />
                  <CalendarMenu
                    concert={{
                      id: alert.concert.id,
                      title: alert.concert.title,
                      artist: alert.concert.artist,
                      date: alert.concert.date,
                      ticketUrl: alert.concert.ticketUrl,
                      venue: {
                        name: alert.concert.venue.name,
                        city: alert.concert.venue.city,
                        country: alert.concert.venue.country,
                      },
                    }}
                    size="sm"
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
