import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db/prisma"

const VALID_DAYS = [7, 14, 30, 60] as const

interface PatchBody {
  emailAlerts?: boolean
  pushAlerts?: boolean
  alertDaysBefore?: number
  showUnofficialConcerts?: boolean
  manualTheme?: "dark" | "light" | null
}

export async function GET(): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const preferences = await prisma.userPreferences.findUnique({
    where: { userId: session.user.id },
  })

  return NextResponse.json({ preferences })
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: PatchBody
  try {
    body = (await request.json()) as PatchBody
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  const data: {
    emailAlerts?: boolean
    pushAlerts?: boolean
    alertDaysBefore?: number
    showUnofficialConcerts?: boolean
    manualTheme?: string | null
    updatedAt?: Date
  } = {}

  if (typeof body.emailAlerts === "boolean") data.emailAlerts = body.emailAlerts
  if (typeof body.pushAlerts === "boolean") data.pushAlerts = body.pushAlerts
  if (typeof body.showUnofficialConcerts === "boolean") {
    data.showUnofficialConcerts = body.showUnofficialConcerts
  }
  if (
    typeof body.alertDaysBefore === "number" &&
    (VALID_DAYS as readonly number[]).includes(body.alertDaysBefore)
  ) {
    data.alertDaysBefore = body.alertDaysBefore
  }
  if (
    body.manualTheme === "dark" ||
    body.manualTheme === "light" ||
    body.manualTheme === null
  ) {
    data.manualTheme = body.manualTheme
  }

  const preferences = await prisma.userPreferences.upsert({
    where: { userId: session.user.id },
    update: { ...data, updatedAt: new Date() },
    create: { userId: session.user.id, ...data },
  })

  return NextResponse.json({ preferences })
}
