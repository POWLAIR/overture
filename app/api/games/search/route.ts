import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { Ratelimit } from "@upstash/ratelimit"
import { redis, getCached, setCached, TTL_STEAM } from "@/lib/cache/redis"

interface SteamAppRaw {
  appid: number
  name: string
}

interface SteamSearchResult {
  steamId: number
  name: string
  iconUrl: string
}

const STEAM_API_BASE = "https://api.steampowered.com"

export async function GET(request: NextRequest): Promise<NextResponse> {
  const ratelimit = new Ratelimit({
    redis: redis(),
    limiter: Ratelimit.slidingWindow(30, "1 m"),
    prefix: "ratelimit:steam-search",
  })

  const ip = request.headers.get("x-forwarded-for") ?? "anonymous"
  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")?.trim()

  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: "Query must be at least 2 characters" },
      { status: 400 }
    )
  }

  const cacheKey = `steam:search:${query.toLowerCase()}`
  const cached = await getCached<SteamSearchResult[]>(cacheKey)
  if (cached) {
    return NextResponse.json({ games: cached, fromCache: true })
  }

  try {
    const res = await fetch(
      `${STEAM_API_BASE}/ISteamApps/GetAppList/v2/`,
      { next: { revalidate: 86400 } }
    )

    if (!res.ok) {
      console.error("[steam] GetAppList failed", { status: res.status })
      return NextResponse.json({ error: "Steam API unavailable" }, { status: 503 })
    }

    const data: { applist?: { apps?: SteamAppRaw[] } } = await res.json()
    const apps = data.applist?.apps ?? []

    const queryLower = query.toLowerCase()
    const matches = apps
      .filter((app) => app.name.toLowerCase().includes(queryLower))
      .slice(0, 20)
      .map(
        (app): SteamSearchResult => ({
          steamId: app.appid,
          name: app.name,
          iconUrl: `https://cdn.akamai.steamstatic.com/steam/apps/${app.appid}/capsule_sm_120.jpg`,
        })
      )

    await setCached(cacheKey, matches, TTL_STEAM)

    return NextResponse.json({ games: matches, fromCache: false }, { status: 200 })
  } catch (e) {
    console.error("[steam] search failed", { query, error: e })
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
