import type { NormalizedConcert } from "@/types/concerts"
import {
  getKnownArtistsSet,
  GLOBAL_TERMS,
} from "@/lib/mapping/games-to-artists"

const ORCHESTRAL_KEYWORDS = [
  "symphony",
  "symphonic",
  "orchestral",
  "orchestra",
  "philharmonic",
  "concert",
  "live",
  "ensemble",
  "chamber",
]

const CONCERT_VENUE_KEYWORDS = [
  "hall",
  "theatre",
  "theater",
  "auditorium",
  "opera",
  "philharmonic",
  "arena",
  "centre",
  "center",
  "symphony",
]

const GENERIC_ARTIST_PATTERNS = [
  /tribute/i,
  /cover/i,
  /karaoke/i,
  /unknown/i,
]

export const OFFICIAL_SCORE_THRESHOLD = 2

export function scoreConcert(
  concert: NormalizedConcert,
  knownArtists: Set<string>
): number {
  let score = 0

  const artistLower = concert.artist.toLowerCase()
  const titleLower = concert.title.toLowerCase()
  const venueLower = concert.venue.name.toLowerCase()

  const isKnownArtist = [...knownArtists].some(
    (a) => a.toLowerCase() === artistLower
  )
  if (isKnownArtist) {
    score += 3
  }

  const isGlobalTerm = GLOBAL_TERMS.some(
    (term) =>
      titleLower.includes(term.toLowerCase()) ||
      artistLower.includes(term.toLowerCase())
  )
  if (isGlobalTerm) {
    score += 2
  }

  const hasOrchestralKeyword = ORCHESTRAL_KEYWORDS.some((kw) =>
    titleLower.includes(kw)
  )
  if (hasOrchestralKeyword) {
    score += 1
  }

  const isConvertHall = CONCERT_VENUE_KEYWORDS.some((kw) =>
    venueLower.includes(kw)
  )
  if (isConvertHall) {
    score += 1
  }

  const isGenericArtist = GENERIC_ARTIST_PATTERNS.some((re) =>
    re.test(concert.artist)
  )
  if (!isKnownArtist && isGenericArtist) {
    score -= 2
  }

  return score
}

export function applyScoring(
  concerts: NormalizedConcert[]
): NormalizedConcert[] {
  const knownArtists = getKnownArtistsSet()

  return concerts.map((concert) => {
    const score = scoreConcert(concert, knownArtists)
    return {
      ...concert,
      isOfficial: score >= OFFICIAL_SCORE_THRESHOLD,
    }
  })
}
