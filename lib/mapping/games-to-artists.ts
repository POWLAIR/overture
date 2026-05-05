export interface GameMapping {
  steamId: number
  name: string
  artists: string[]
}

export const GAME_ARTIST_MAPPING: GameMapping[] = [
  {
    steamId: 292030,
    name: "The Witcher 3: Wild Hunt",
    artists: ["Marcin Przybylowicz", "Percival Schuttenbach"],
  },
  {
    steamId: 1245620,
    name: "Elden Ring",
    artists: ["Yuka Kitamura", "Lands Between Orchestra"],
  },
  {
    steamId: 1086940,
    name: "Baldur's Gate 3",
    artists: ["Borislav Slavov"],
  },
  {
    steamId: 814380,
    name: "Sekiro: Shadows Die Twice",
    artists: ["Yuka Kitamura", "Metropolis Ensemble"],
  },
  {
    steamId: 367520,
    name: "Hollow Knight",
    artists: ["Christopher Larkin"],
  },
  {
    steamId: 39210,
    name: "Final Fantasy XIV Online",
    artists: ["Distant Worlds", "Nobuo Uematsu"],
  },
  {
    steamId: 2369390,
    name: "The Legend of Zelda: Tears of the Kingdom",
    artists: ["The Legend of Zelda Symphony", "Koji Kondo"],
  },
  {
    steamId: 1145360,
    name: "Hades",
    artists: ["Darren Korb"],
  },
  {
    steamId: 524220,
    name: "NieR: Automata",
    artists: ["Keiichi Okabe", "MONACA"],
  },
  {
    steamId: 261570,
    name: "Ori and the Blind Forest",
    artists: ["Gareth Coker"],
  },
  {
    steamId: 1091500,
    name: "Cyberpunk 2077",
    artists: ["PT Adamczyk", "Marcin Przybyłowicz"],
  },
  {
    steamId: 570,
    name: "Dota 2",
    artists: ["Valve Studio Orchestra"],
  },
]

export const GLOBAL_TERMS: string[] = [
  "Video Games Live",
  "Game Music Festival",
  "Symphonic Legends",
  "Play! A Video Game Symphony",
  "Dear Friends Final Fantasy",
  "orchestral video games",
]

export function getAllSearchTerms(): string[] {
  const artistTerms = GAME_ARTIST_MAPPING.flatMap((g) => g.artists)
  return [...new Set([...artistTerms, ...GLOBAL_TERMS])]
}

export function getArtistsByGameId(steamId: number): string[] {
  return GAME_ARTIST_MAPPING.find((g) => g.steamId === steamId)?.artists ?? []
}

export function getKnownArtistsSet(): Set<string> {
  return new Set(GAME_ARTIST_MAPPING.flatMap((g) => g.artists))
}

export function getGameIdsByArtist(artist: string): number[] {
  return GAME_ARTIST_MAPPING.filter((g) =>
    g.artists.some((a) => a.toLowerCase() === artist.toLowerCase())
  ).map((g) => g.steamId)
}
