import type { NormalizedConcert } from "@/types/concerts"

interface BandsintownVenueRaw {
  name?: string
  city?: string
  country?: string
  latitude?: string
  longitude?: string
}

interface BandsintownOfferRaw {
  type?: string
  url?: string
  status?: string
}

interface BandsintownEventRaw {
  id: string
  title?: string
  artist?: { name?: string }
  datetime?: string
  venue?: BandsintownVenueRaw
  offers?: BandsintownOfferRaw[]
  on_sale_datetime?: string
}

function normalizeBandsintownEvent(
  event: BandsintownEventRaw,
  artist: string
): NormalizedConcert | null {
  if (!event.datetime) return null

  const date = new Date(event.datetime)
  if (isNaN(date.getTime())) return null

  const rawVenue = event.venue
  const venue = {
    name: rawVenue?.name ?? "Unknown Venue",
    city: rawVenue?.city ?? "Unknown City",
    country: rawVenue?.country ?? "XX",
    lat: rawVenue?.latitude ? parseFloat(rawVenue.latitude) : undefined,
    lng: rawVenue?.longitude ? parseFloat(rawVenue.longitude) : undefined,
  }

  const ticketOffer = event.offers?.find((o) => o.type === "Tickets")
  const ticketUrl = ticketOffer?.url
  const isAvailable = ticketOffer?.status !== "unavailable"

  const onsaleDate = event.on_sale_datetime
    ? new Date(event.on_sale_datetime)
    : undefined

  return {
    externalId: String(event.id),
    source: "bandsintown",
    title: event.title ?? `${event.artist?.name ?? artist} live`,
    artist: event.artist?.name ?? artist,
    gameIds: [],
    date,
    venue,
    ticketUrl,
    price: undefined,
    isOfficial: false,
    isAvailable,
    onsaleDate,
    rawData: event,
  }
}

export async function fetchBandsintownConcerts(
  artist: string
): Promise<NormalizedConcert[]> {
  const appId = process.env.BANDSINTOWN_APP_ID
  if (!appId) {
    console.error("[bandsintown] BANDSINTOWN_APP_ID is not set")
    return []
  }

  try {
    const encodedArtist = encodeURIComponent(artist)
    const params = new URLSearchParams({ app_id: appId })

    const res = await fetch(
      `https://rest.bandsintown.com/artists/${encodedArtist}/events?${params}`,
      { next: { revalidate: 0 } }
    )

    if (!res.ok) {
      console.error("[bandsintown] fetch failed", {
        artist,
        status: res.status,
        statusText: res.statusText,
      })
      return []
    }

    const data: BandsintownEventRaw[] = await res.json()

    if (!Array.isArray(data)) return []

    return data
      .map((event) => normalizeBandsintownEvent(event, artist))
      .filter((c): c is NormalizedConcert => c !== null)
  } catch (e) {
    console.error("[bandsintown] fetch failed", { artist, error: e })
    return []
  }
}
