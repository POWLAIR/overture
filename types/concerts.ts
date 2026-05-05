export interface ConcertVenue {
  name: string
  city: string
  country: string
  lat?: number
  lng?: number
  url?: string
}

export interface NormalizedConcert {
  externalId: string
  source: "ticketmaster" | "bandsintown"
  title: string
  artist: string
  gameIds: number[]
  date: Date
  venue: ConcertVenue
  ticketUrl?: string
  price?: string
  isOfficial: boolean
  isAvailable: boolean
  onsaleDate?: Date
  rawData: unknown
}
