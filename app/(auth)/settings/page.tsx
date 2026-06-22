import type { Metadata } from "next"

import { auth } from "@/auth"
import { prisma } from "@/lib/db/prisma"
import { SettingsClient } from "./SettingsClient"

export const metadata: Metadata = {
  title: "Réglages",
}

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) return null

  const prefs = await prisma.userPreferences.findUnique({
    where: { userId: session.user.id },
  })

  const vapidKey =
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? process.env.VAPID_PUBLIC_KEY

  return (
    <SettingsClient
      email={session.user.email ?? ""}
      vapidKey={vapidKey}
      initialPrefs={
        prefs
          ? {
              emailAlerts: prefs.emailAlerts,
              pushAlerts: prefs.pushAlerts,
              alertDaysBefore: prefs.alertDaysBefore,
              showUnofficialConcerts: prefs.showUnofficialConcerts,
              manualTheme: (prefs.manualTheme as "dark" | "light" | null) ?? null,
            }
          : null
      }
    />
  )
}
