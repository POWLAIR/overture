import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { Prisma } from "@/generated/prisma"

import { prisma } from "@/lib/db/prisma"
import { fetchTicketmasterConcerts } from "@/lib/api/ticketmaster"
import { fetchBandsintownConcerts } from "@/lib/api/bandsintown"
import { applyScoring } from "@/lib/scoring"
import { invalidateConcertCache } from "@/lib/cache/redis"
import {
  getAllSearchTerms,
  getGameIdsByArtist,
  GAME_ARTIST_MAPPING,
} from "@/lib/mapping/games-to-artists"
import type { NormalizedConcert } from "@/types/concerts"

export const maxDuration = 300

function enrichWithGameIds(concerts: NormalizedConcert[]): NormalizedConcert[] {
  const allArtists = GAME_ARTIST_MAPPING.flatMap((g) =>
    g.artists.map((a) => a.toLowerCase())
  )

  return concerts.map((concert) => {
    const artistLower = concert.artist.toLowerCase()
    const isKnown = allArtists.includes(artistLower)
    const gameIds = isKnown ? getGameIdsByArtist(concert.artist) : []
    return { ...concert, gameIds }
  })
}

function deduplicateConcerts(
  concerts: NormalizedConcert[]
): NormalizedConcert[] {
  const seen = new Set<string>()
  return concerts.filter((c) => {
    const key = `${c.externalId}:${c.source}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function isAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return false
  const authHeader = request.headers.get("Authorization")
  return authHeader === `Bearer ${cronSecret}`
}

async function runSync(): Promise<NextResponse> {
  const searchTerms = getAllSearchTerms()

  const results = await Promise.allSettled(
    searchTerms.flatMap((term) => [
      fetchTicketmasterConcerts(term),
      fetchBandsintownConcerts(term),
    ])
  )

  const raw: NormalizedConcert[] = results.flatMap((r) =>
    r.status === "fulfilled" ? r.value : []
  )

  const enriched = enrichWithGameIds(raw)
  const unique = deduplicateConcerts(enriched)
  const scored = applyScoring(unique)

  let synced = 0

  for (const concert of scored) {
    try {
      const venueData = {
        name: concert.venue.name,
        city: concert.venue.city,
        country: concert.venue.country,
        lat: concert.venue.lat,
        lng: concert.venue.lng,
        url: concert.venue.url,
      }

      const concertData = {
        externalId: concert.externalId,
        source: concert.source,
        title: concert.title,
        artist: concert.artist,
        gameIds: concert.gameIds,
        gameNames: concert.gameIds.map(
          (id) =>
            GAME_ARTIST_MAPPING.find((g) => g.steamId === id)?.name ?? ""
        ),
        date: concert.date,
        ticketUrl: concert.ticketUrl,
        price: concert.price,
        isOfficial: concert.isOfficial,
        isAvailable: concert.isAvailable,
        onsaleDate: concert.onsaleDate,
        rawData: concert.rawData as Prisma.InputJsonValue,
      }

      await prisma.concert.upsert({
        where: {
          externalId_source: {
            externalId: concert.externalId,
            source: concert.source,
          },
        },
        update: {
          ...concertData,
          updatedAt: new Date(),
          venue: {
            connectOrCreate: {
              where: {
                name_city: {
                  name: concert.venue.name,
                  city: concert.venue.city,
                },
              },
              create: venueData,
            },
          },
        },
        create: {
          ...concertData,
          venue: {
            connectOrCreate: {
              where: {
                name_city: {
                  name: concert.venue.name,
                  city: concert.venue.city,
                },
              },
              create: venueData,
            },
          },
        },
      })

      synced++
    } catch (e) {
      console.error("[sync] upsert failed", {
        externalId: concert.externalId,
        source: concert.source,
        error: e,
      })
    }
  }

  await invalidateConcertCache()

  return NextResponse.json({
    synced,
    total: scored.length,
    timestamp: new Date().toISOString(),
  })
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return runSync()
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return runSync()
}
