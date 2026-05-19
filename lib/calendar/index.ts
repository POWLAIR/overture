import ical from "ical-generator"

export type CalendarConcert = {
  id: string
  title: string
  artist: string
  date: Date
  ticketUrl?: string | null
  venue?: {
    name: string
    city: string
    country: string
  } | null
}

const DEFAULT_DURATION_MS = 2 * 60 * 60 * 1000

function buildLocation(venue: CalendarConcert["venue"]): string {
  if (!venue) return ""
  return [venue.name, venue.city, venue.country].filter(Boolean).join(", ")
}

function buildDescription(concert: CalendarConcert): string {
  const parts = [
    `Artiste : ${concert.artist}`,
    concert.ticketUrl ? `Billetterie : ${concert.ticketUrl}` : null,
    "",
    "Alerte gérée par Overture — overture.music",
  ].filter(Boolean) as string[]
  return parts.join("\n")
}

function formatGoogleDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
}

export function buildGoogleCalendarUrl(concert: CalendarConcert): string {
  const start = concert.date
  const end = new Date(start.getTime() + DEFAULT_DURATION_MS)
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${concert.title} — ${concert.artist}`,
    dates: `${formatGoogleDate(start)}/${formatGoogleDate(end)}`,
    details: buildDescription(concert),
    location: buildLocation(concert.venue),
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function buildIcsContent(concert: CalendarConcert): string {
  const start = concert.date
  const end = new Date(start.getTime() + DEFAULT_DURATION_MS)

  const cal = ical({
    name: "Overture",
    prodId: { company: "Overture", product: "Concert", language: "FR" },
  })

  cal.createEvent({
    id: `overture-${concert.id}`,
    start,
    end,
    summary: `${concert.title} — ${concert.artist}`,
    description: buildDescription(concert),
    location: buildLocation(concert.venue),
    url: concert.ticketUrl ?? undefined,
  })

  return cal.toString()
}
