import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db/prisma"

interface AddBody {
  concertId: string
}

export async function GET(): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const alerts = await prisma.alert.findMany({
    where: { userId: session.user.id },
    include: {
      concert: {
        include: { venue: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ alerts }, { status: 200 })
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

  if (typeof body.concertId !== "string" || body.concertId.trim().length === 0) {
    return NextResponse.json({ error: "concertId required" }, { status: 400 })
  }

  const concert = await prisma.concert.findUnique({ where: { id: body.concertId } })
  if (!concert) {
    return NextResponse.json({ error: "Concert not found" }, { status: 404 })
  }

  const alert = await prisma.alert.upsert({
    where: {
      userId_concertId: {
        userId: session.user.id,
        concertId: body.concertId,
      },
    },
    update: {},
    create: {
      userId: session.user.id,
      concertId: body.concertId,
    },
  })

  return NextResponse.json({ alert }, { status: 201 })
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const concertId = searchParams.get("concertId")

  if (!concertId) {
    return NextResponse.json({ error: "concertId query param required" }, { status: 400 })
  }

  try {
    await prisma.alert.delete({
      where: {
        userId_concertId: {
          userId: session.user.id,
          concertId,
        },
      },
    })
  } catch (e) {
    console.error("[alerts] delete failed", { concertId, error: e })
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}
