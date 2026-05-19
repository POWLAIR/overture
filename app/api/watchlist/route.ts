import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db/prisma"

interface AddBody {
  steamId: number
  name: string
  imageUrl?: string
}

export async function GET(): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const games = await prisma.watchlistGame.findMany({
    where: { userId: session.user.id },
    orderBy: { addedAt: "desc" },
  })

  return NextResponse.json({ games }, { status: 200 })
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: AddBody
  try {
    body = (await request.json()) as AddBody
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  if (
    typeof body.steamId !== "number" ||
    typeof body.name !== "string" ||
    body.name.trim().length === 0
  ) {
    return NextResponse.json(
      { error: "steamId and name are required" },
      { status: 400 }
    )
  }

  const game = await prisma.watchlistGame.upsert({
    where: {
      userId_steamId: {
        userId: session.user.id,
        steamId: body.steamId,
      },
    },
    update: {
      name: body.name,
      imageUrl: body.imageUrl,
    },
    create: {
      userId: session.user.id,
      steamId: body.steamId,
      name: body.name,
      imageUrl: body.imageUrl,
    },
  })

  return NextResponse.json({ game }, { status: 201 })
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const steamIdRaw = searchParams.get("steamId")
  const steamId = steamIdRaw ? parseInt(steamIdRaw, 10) : NaN

  if (!Number.isFinite(steamId)) {
    return NextResponse.json(
      { error: "steamId query param required" },
      { status: 400 }
    )
  }

  try {
    await prisma.watchlistGame.delete({
      where: {
        userId_steamId: {
          userId: session.user.id,
          steamId,
        },
      },
    })
  } catch (e) {
    console.error("[watchlist] delete failed", { steamId, error: e })
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}
