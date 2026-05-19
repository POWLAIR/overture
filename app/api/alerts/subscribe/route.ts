import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db/prisma"

interface SubscribeBody {
  endpoint: string
  p256dh: string
  auth: string
  userAgent?: string
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: SubscribeBody
  try {
    body = (await request.json()) as SubscribeBody
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  if (
    typeof body.endpoint !== "string" ||
    typeof body.p256dh !== "string" ||
    typeof body.auth !== "string"
  ) {
    return NextResponse.json({ error: "endpoint, p256dh and auth required" }, { status: 400 })
  }

  const subscription = await prisma.pushSubscription.upsert({
    where: { endpoint: body.endpoint },
    update: {
      userId: session.user.id,
      p256dh: body.p256dh,
      authKey: body.auth,
      userAgent: body.userAgent,
    },
    create: {
      userId: session.user.id,
      endpoint: body.endpoint,
      p256dh: body.p256dh,
      authKey: body.auth,
      userAgent: body.userAgent,
    },
  })

  return NextResponse.json({ subscription }, { status: 201 })
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get("endpoint")

  if (!endpoint) {
    return NextResponse.json({ error: "endpoint query param required" }, { status: 400 })
  }

  try {
    await prisma.pushSubscription.deleteMany({
      where: {
        endpoint,
        userId: session.user.id,
      },
    })
  } catch (e) {
    console.error("[alerts/subscribe] delete failed", { endpoint, error: e })
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}
