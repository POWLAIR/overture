"use client"

import { useEffect, useState, useTransition } from "react"

import { useIsClient } from "@/hooks/useIsClient"

type PermissionState = "default" | "granted" | "denied" | "unsupported"

function urlBase64ToBuffer(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = atob(base64)
  const buffer = new ArrayBuffer(rawData.length)
  const view = new Uint8Array(buffer)
  for (let i = 0; i < rawData.length; i += 1) {
    view[i] = rawData.charCodeAt(i)
  }
  return buffer
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

export function EnablePushButton({
  vapidPublicKey,
}: {
  vapidPublicKey?: string
}) {
  const isClient = useIsClient()
  const [permission, setPermission] = useState<PermissionState>("default")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isClient) return

    const supported =
      typeof Notification !== "undefined" && "serviceWorker" in navigator

    startTransition(() => {
      setPermission(
        supported ? (Notification.permission as PermissionState) : "unsupported",
      )
    })

    if (!supported) return

    navigator.serviceWorker.getRegistration().then(async (reg) => {
      if (!reg) return
      const sub = await reg.pushManager.getSubscription()
      startTransition(() => {
        setIsSubscribed(Boolean(sub))
      })
    })
  }, [isClient])

  function enable(): void {
    setError(null)
    if (!vapidPublicKey) {
      setError("Clé VAPID non configurée")
      return
    }

    startTransition(async () => {
      try {
        const requested = await Notification.requestPermission()
        setPermission(requested as PermissionState)
        if (requested !== "granted") return

        const registration =
          (await navigator.serviceWorker.getRegistration()) ??
          (await navigator.serviceWorker.register("/sw.js"))

        await navigator.serviceWorker.ready

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToBuffer(vapidPublicKey),
        })

        const json = subscription.toJSON()
        const p256dh = json.keys?.p256dh
        const auth = json.keys?.auth

        if (!p256dh || !auth) {
          const rawP = subscription.getKey("p256dh")
          const rawA = subscription.getKey("auth")
          if (!rawP || !rawA) throw new Error("Missing subscription keys")
        }

        const response = await fetch("/api/alerts/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
            p256dh:
              p256dh ??
              arrayBufferToBase64(subscription.getKey("p256dh") as ArrayBuffer),
            auth:
              auth ??
              arrayBufferToBase64(subscription.getKey("auth") as ArrayBuffer),
            userAgent: navigator.userAgent,
          }),
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        setIsSubscribed(true)
      } catch (e) {
        console.error("[push] enable failed", e)
        setError("Impossible d'activer les notifications")
      }
    })
  }

  function disable(): void {
    setError(null)
    startTransition(async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        const subscription = await registration?.pushManager.getSubscription()
        if (subscription) {
          await fetch(
            `/api/alerts/subscribe?endpoint=${encodeURIComponent(subscription.endpoint)}`,
            { method: "DELETE" },
          )
          await subscription.unsubscribe()
        }
        setIsSubscribed(false)
      } catch (e) {
        console.error("[push] disable failed", e)
        setError("Impossible de désactiver")
      }
    })
  }

  if (!isClient) return null

  if (permission === "unsupported") {
    return (
      <div
        className="rounded-xl px-4 py-3 text-sm"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          color: "var(--text-muted)",
        }}
      >
        Notifications push non supportées par ce navigateur.
      </div>
    )
  }

  if (permission === "denied") {
    return (
      <div
        className="rounded-xl px-4 py-3 text-sm"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          color: "var(--text-muted)",
        }}
      >
        Notifications bloquées dans le navigateur. Active-les dans les réglages du site.
      </div>
    )
  }

  return (
    <div>
      {isSubscribed ? (
        <button
          type="button"
          onClick={disable}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-semibold border transition-all duration-150 disabled:opacity-60"
          style={{
            background: "transparent",
            color: "var(--text-muted)",
            borderColor: "var(--border)",
          }}
        >
          <span aria-hidden="true">🔕</span>
          <span>Désactiver les notifications</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={enable}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-semibold transition-all duration-150 disabled:opacity-60"
          style={{
            background: "var(--accent)",
            color: "var(--bg)",
          }}
        >
          <span aria-hidden="true">🔔</span>
          <span>{isPending ? "Activation..." : "Activer les notifications"}</span>
        </button>
      )}
      {error && (
        <p className="text-xs mt-2" style={{ color: "#ef4444" }} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
