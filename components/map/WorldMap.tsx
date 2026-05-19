"use client"

import { useEffect, useRef, useCallback } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { useTheme } from "@/components/ui/ThemeProvider"
import type { ConcertCardData } from "@/components/concert/ConcertCard"

const MAPBOX_STYLE_DARK =
  "mapbox://styles/mapbox/dark-v11"
const MAPBOX_STYLE_LIGHT =
  "mapbox://styles/mapbox/light-v11"

interface WorldMapProps {
  concerts: ConcertCardData[]
  selectedId?: string | null
  onSelectConcert?: (id: string) => void
  className?: string
}

export function WorldMap({
  concerts,
  selectedId,
  onSelectConcert,
  className = "",
}: WorldMapProps) {
  const { theme } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []
  }, [])

  const addMarkers = useCallback(
    (map: mapboxgl.Map) => {
      clearMarkers()

      concerts.forEach((concert) => {
        if (!concert.venue) return

        const venueWithCoords = concert.venue as ConcertCardData["venue"] & {
          lat?: number
          lng?: number
        }
        if (venueWithCoords.lat == null || venueWithCoords.lng == null) return

        const isSelected = concert.id === selectedId

        const el = document.createElement("div")
        el.className = "overture-marker"
        el.setAttribute("role", "button")
        el.setAttribute("aria-label", concert.title)
        el.style.cssText = `
          width: ${isSelected ? 20 : 14}px;
          height: ${isSelected ? 20 : 14}px;
          background: ${isSelected ? "var(--accent-light)" : "var(--accent)"};
          border: 2px solid ${isSelected ? "var(--bg)" : "rgba(255,255,255,0.4)"};
          border-radius: 50%;
          cursor: pointer;
          transition: transform 150ms ease, background 150ms ease;
          box-shadow: 0 0 ${isSelected ? 12 : 6}px ${isSelected ? "var(--accent-light)" : "var(--accent)"};
        `

        el.addEventListener("mouseenter", () => {
          el.style.transform = "scale(1.3)"
        })
        el.addEventListener("mouseleave", () => {
          el.style.transform = "scale(1)"
        })
        el.addEventListener("click", () => {
          onSelectConcert?.(concert.id)
        })

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([venueWithCoords.lng, venueWithCoords.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 16, closeButton: false }).setHTML(`
              <div style="font-family: var(--font-cinzel); padding: 4px 0;">
                <strong style="font-size: 13px; color: var(--text);">${concert.title}</strong><br>
                <span style="font-size: 11px; color: var(--text-muted);">
                  ${concert.venue.city}, ${concert.venue.country}
                </span>
              </div>
            `)
          )
          .addTo(map)

        markersRef.current.push(marker)
      })
    },
    [concerts, selectedId, onSelectConcert, clearMarkers]
  )

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token || !containerRef.current) return

    mapboxgl.accessToken = token

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: theme === "dark" ? MAPBOX_STYLE_DARK : MAPBOX_STYLE_LIGHT,
      center: [10, 30],
      zoom: 1.8,
      projection: "mercator",
      attributionControl: false,
    })

    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "top-right"
    )
    map.addControl(
      new mapboxgl.AttributionControl({ compact: true }),
      "bottom-left"
    )

    map.on("load", () => {
      addMarkers(map)
    })

    mapRef.current = map

    return () => {
      clearMarkers()
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]) // intentionally: re-init only on theme change, markers handled by separate effect

  useEffect(() => {
    if (mapRef.current?.isStyleLoaded()) {
      addMarkers(mapRef.current)
    }
  }, [concerts, selectedId, addMarkers])

  return (
    <div
      ref={containerRef}
      className={`w-full h-full min-h-[300px] rounded-xl overflow-hidden ${className}`}
      style={{ border: "1px solid var(--border)" }}
    />
  )
}
