import type { SendResult, WebPushError } from "web-push"

import { prisma } from "@/lib/db/prisma"

export type PushPayload = {
  title: string
  body: string
  url?: string
  tag?: string
}

let isVapidConfigured = false

async function getWebPush() {
  const mod = await import("web-push")
  const webpush = mod.default

  if (!isVapidConfigured) {
    const publicKey = process.env.VAPID_PUBLIC_KEY ?? process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    const privateKey = process.env.VAPID_PRIVATE_KEY
    const subject = process.env.VAPID_SUBJECT

    if (!publicKey || !privateKey || !subject) {
      throw new Error("[push] VAPID keys manquantes (VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY / VAPID_SUBJECT)")
    }

    webpush.setVapidDetails(subject, publicKey, privateKey)
    isVapidConfigured = true
  }

  return webpush
}

function isWebPushError(error: unknown): error is WebPushError {
  return typeof error === "object" && error !== null && "statusCode" in error
}

export async function sendPushToUser(
  userId: string,
  payload: PushPayload,
): Promise<{ sent: number; removed: number }> {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  })

  if (subscriptions.length === 0) {
    return { sent: 0, removed: 0 }
  }

  const webpush = await getWebPush()
  const json = JSON.stringify(payload)

  const expiredEndpoints: string[] = []
  let sent = 0

  await Promise.all(
    subscriptions.map(async (sub) => {
      const subscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.authKey,
        },
      }

      try {
        const result: SendResult = await webpush.sendNotification(subscription, json)
        if (result.statusCode >= 200 && result.statusCode < 300) {
          sent += 1
        }
      } catch (error) {
        if (isWebPushError(error) && (error.statusCode === 404 || error.statusCode === 410)) {
          expiredEndpoints.push(sub.endpoint)
        } else {
          console.error("[push] send error", { endpoint: sub.endpoint, error })
        }
      }
    }),
  )

  if (expiredEndpoints.length > 0) {
    await prisma.pushSubscription.deleteMany({
      where: { endpoint: { in: expiredEndpoints } },
    })
  }

  return { sent, removed: expiredEndpoints.length }
}
