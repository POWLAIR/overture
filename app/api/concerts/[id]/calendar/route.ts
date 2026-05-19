import { NextResponse } from "next/server"

import { buildIcsContent } from "@/lib/calendar"
import { prisma } from "@/lib/db/prisma"

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: Params): Promise<NextResponse> {
  const { id } = await params

  const concert = await prisma.concert.findUnique({
    where: { id },
    include: { venue: true },
  })

  if (!concert) {
    return NextResponse.json({ error: "Concert not found" }, { status: 404 })
  }

  const ics = buildIcsContent({
    id: concert.id,
    title: concert.title,
    artist: concert.artist,
    date: concert.date,
    ticketUrl: concert.ticketUrl,
    venue: concert.venue
      ? {
          name: concert.venue.name,
          city: concert.venue.city,
          country: concert.venue.country,
        }
      : null,
  })

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="overture-${concert.id}.ics"`,
      "Cache-Control": "public, max-age=300",
    },
  })
}
