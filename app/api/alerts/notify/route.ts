import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { prisma } from "@/lib/db/prisma"
import { sendAlertEmail } from "@/lib/email"
import { sendPushToUser } from "@/lib/push"

export const maxDuration = 300

const DEFAULT_ALERT_DAYS = 30

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function daysBetween(future: Date, now: Date): number {
  const ms = startOfDay(future).getTime() - startOfDay(now).getTime()
  return Math.round(ms / (1000 * 60 * 60 * 24))
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get("Authorization")
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  const horizonDays = 90
  const horizon = new Date(now.getTime() + horizonDays * 24 * 60 * 60 * 1000)

  const alerts = await prisma.alert.findMany({
    where: {
      notified: false,
      concert: {
        date: { gte: now, lte: horizon },
      },
    },
    include: {
      user: {
        include: { preferences: true },
      },
      concert: {
        include: { venue: true },
      },
    },
  })

  let emailsSent = 0
  let pushSent = 0
  let marked = 0
  let skipped = 0

  for (const alert of alerts) {
    const prefs = alert.user.preferences
    const alertDaysBefore = prefs?.alertDaysBefore ?? DEFAULT_ALERT_DAYS
    const days = daysBetween(alert.concert.date, now)

    if (days > alertDaysBefore || days < 0) {
      skipped += 1
      continue
    }

    const wantEmail = prefs ? prefs.emailAlerts : true
    const wantPush = prefs ? prefs.pushAlerts : true

    if (wantEmail && alert.user.email) {
      const result = await sendAlertEmail({
        user: { name: alert.user.name, email: alert.user.email },
        concert: {
          id: alert.concert.id,
          title: alert.concert.title,
          artist: alert.concert.artist,
          date: alert.concert.date,
          ticketUrl: alert.concert.ticketUrl,
          venue: alert.concert.venue
            ? {
                name: alert.concert.venue.name,
                city: alert.concert.venue.city,
                country: alert.concert.venue.country,
              }
            : null,
        },
        daysBefore: days,
      })
      if (result.ok) emailsSent += 1
    }

    if (wantPush) {
      try {
        const { sent } = await sendPushToUser(alert.user.id, {
          title: `${alert.concert.artist}`,
          body: `${alert.concert.title} — dans ${days} jour${days > 1 ? "s" : ""}`,
          url: `/concerts/${alert.concert.id}`,
          tag: `alert-${alert.id}`,
        })
        pushSent += sent
      } catch (e) {
        console.error("[notify] push failed", { alertId: alert.id, error: e })
      }
    }

    await prisma.alert.update({
      where: { id: alert.id },
      data: { notified: true },
    })
    marked += 1
  }

  return NextResponse.json({
    processed: alerts.length,
    emailsSent,
    pushSent,
    marked,
    skipped,
    timestamp: now.toISOString(),
  })
}
