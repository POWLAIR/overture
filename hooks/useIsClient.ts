"use client"

import { useSyncExternalStore } from "react"

function subscribe(): () => void {
  return () => {}
}

function getSnapshot(): boolean {
  return true
}

function getServerSnapshot(): boolean {
  return false
}

/**
 * Returns true once the component has hydrated on the client.
 * Returns false during SSR and during the first render on the client,
 * making it safe to gate rendering that depends on browser-only APIs
 * (window.matchMedia, useReducedMotion, etc.) without causing hydration
 * mismatches.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
