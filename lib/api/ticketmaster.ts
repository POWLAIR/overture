import type { NormalizedConcert } from "@/types/concerts"

interface TicketmasterVenueRaw {
  name?: string
  city?: { name?: string }
  country?: { countryCode?: string; name?: string }
  location?: { latitude?: string; longitude?: string }
  url?: string
}

interface TicketmasterPriceRangeRaw {
  min?: number
  max?: number
  currency?: string
}

interface TicketmasterEventRaw {
  id: string
  name: string
  dates?: {
    start?: { dateTime?: string; localDate?: string }
    status?: { code?: string }
    spanMultipleDays?: boolean
  }
  _embedded?: {
    venues?: TicketmasterVenueRaw[]
    attractions?: Array<{ name?: string }>
  }
  url?: string
  priceRanges?: TicketmasterPriceRangeRaw[]
  sales?: {
    public?: { startDateTime?: string }
  }
}

interface TicketmasterResponse {
  _embedded?: {
    events?: TicketmasterEventRaw[]
  }
  page?: { totalElements?: number }
}

function normalizeTicketmasterEvent(
  event: TicketmasterEventRaw,
  keyword: string
): NormalizedConcert | null {
  const dateStr =
    event.dates?.start?.dateTime ?? event.dates?.start?.localDate
  if (!dateStr) return null

  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return null

  const rawVenue = event._embedded?.venues?.[0]
  const venue = {
    name: rawVenue?.name ?? "Unknown Venue",
    city: rawVenue?.city?.name ?? "Unknown City",
    country: rawVenue?.country?.countryCode ?? "XX",
    lat: rawVenue?.location?.latitude
      ? parseFloat(rawVenue.location.latitude)
      : undefined,
    lng: rawVenue?.location?.longitude
      ? parseFloat(rawVenue.location.longitude)
      : undefined,
    url: rawVenue?.url,
  }

  const artist =
    event._embedded?.attractions?.[0]?.name ?? keyword

  const priceRange = event.priceRanges?.[0]
  const price = priceRange
    ? `${priceRange.min}–${priceRange.max} ${priceRange.currency ?? ""}`.trim()
    : undefined

  const onsaleStr = event.sales?.public?.startDateTime
  const onsaleDate = onsaleStr ? new Date(onsaleStr) : undefined

  const statusCode = event.dates?.status?.code
  const isAvailable = statusCode !== "cancelled" && statusCode !== "offsale"

  return {
    externalId: event.id,
    source: "ticketmaster",
    title: event.name,
    artist,
    gameIds: [],
    date,
    venue,
    ticketUrl: event.url,
    price,
    isOfficial: false,
    isAvailable,
    onsaleDate,
    rawData: event,
  }
}

export async function fetchTicketmasterConcerts(
  keyword: string
): Promise<NormalizedConcert[]> {
  const apiKey = process.env.TICKETMASTER_API_KEY
  if (!apiKey) {
    console.error("[ticketmaster] TICKETMASTER_API_KEY is not set")
    return []
  }

  try {
    const params = new URLSearchParams({
      keyword,
      classificationName: "music",
      apikey: apiKey,
      size: "50",
    })

    const res = await fetch(
      `https://app.ticketmaster.com/discovery/v2/events.json?${params}`,
      { next: { revalidate: 0 } }
    )

    if (!res.ok) {
      console.error("[ticketmaster] fetch failed", {
        keyword,
        status: res.status,
        statusText: res.statusText,
      })
      return []
    }

    const data: TicketmasterResponse = await res.json()
    const events = data._embedded?.events ?? []

    return events
      .map((event) => normalizeTicketmasterEvent(event, keyword))
      .filter((c): c is NormalizedConcert => c !== null)
  } catch (e) {
    console.error("[ticketmaster] fetch failed", { keyword, error: e })
    return []
  }
}
