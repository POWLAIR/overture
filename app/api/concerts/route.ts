import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { Ratelimit } from "@upstash/ratelimit"

import { prisma } from "@/lib/db/prisma"
import { redis, getCached, setCached, TTL_CONCERTS } from "@/lib/cache/redis"

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "1 m"),
  prefix: "ratelimit:concerts",
})

export async function GET(request: NextRequest): Promise<NextResponse> {
  const ip = request.headers.get("x-forwarded-for") ?? "anonymous"
  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    )
  }

  const { searchParams } = new URL(request.url)
  const gameId = searchParams.get("gameId")
  const country = searchParams.get("country")
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  const cacheKey = gameId
    ? `concerts:game:${gameId}`
    : country
      ? `concerts:country:${country}`
      : "concerts:all"

  const cached = await getCached(cacheKey)
  if (cached) {
    return NextResponse.json({ concerts: cached, fromCache: true })
  }

  const where: Record<string, unknown> = {
    isOfficial: true,
    isAvailable: true,
  }

  if (gameId) {
    where.gameIds = { has: parseInt(gameId, 10) }
  }

  if (country) {
    where.venue = { is: { country } }
  }

  if (from || to) {
    const dateFilter: Record<string, Date> = {}
    if (from) dateFilter.gte = new Date(from)
    if (to) dateFilter.lte = new Date(to)
    where.date = dateFilter
  }

  const concerts = await prisma.concert.findMany({
    where,
    orderBy: { date: "asc" },
    include: {
      venue: true,
    },
  })

  await setCached(cacheKey, concerts, TTL_CONCERTS)

  return NextResponse.json({ concerts, fromCache: false }, { status: 200 })
}
