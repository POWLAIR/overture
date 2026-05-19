"use client"

import { useState } from "react"
import { motion, useReducedMotion, AnimatePresence } from "framer-motion"
import { useIsClient } from "@/hooks/useIsClient"

const INSTRUMENT_GLYPHS = ["♩", "♪", "♫", "♬", "𝄞", "𝄢", "𝄡"]

interface Particle {
  id: number
  x: number
  y: number
  glyph: string
  size: number
  angle: number
  distance: number
  delay: number
  duration: number
  opacity: number
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 50,
    y: 50,
    glyph: INSTRUMENT_GLYPHS[Math.floor(Math.random() * INSTRUMENT_GLYPHS.length)],
    size: randomBetween(12, 26),
    angle: randomBetween(0, 360),
    distance: randomBetween(80, 180),
    delay: randomBetween(0, 0.6),
    duration: randomBetween(1.2, 2.4),
    opacity: randomBetween(0.6, 1),
  }))
}

interface InstrumentParticlesProps {
  count?: number
  active?: boolean
  className?: string
}

export function InstrumentParticles({
  count = 48,
  active = true,
  className = "",
}: InstrumentParticlesProps) {
  const prefersReduced = useReducedMotion()
  const isClient = useIsClient()
  const [particles] = useState<Particle[]>(() => generateParticles(count))

  if (!isClient || prefersReduced || !active) return null

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <AnimatePresence>
        {particles.map((p) => {
          const rad = (p.angle * Math.PI) / 180
          const tx = Math.cos(rad) * p.distance
          const ty = Math.sin(rad) * p.distance

          return (
            <motion.span
              key={p.id}
              className="absolute font-mono select-none"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                fontSize: p.size,
                color: "var(--accent-light)",
                filter: "drop-shadow(0 0 6px var(--accent))",
                originX: "50%",
                originY: "50%",
              }}
              initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
              animate={{
                opacity: [0, p.opacity, p.opacity * 0.5, 0],
                x: [0, tx * 0.4, tx],
                y: [0, ty * 0.4, ty],
                scale: [0, 1.2, 0.8, 0],
                rotate: [0, randomBetween(-45, 45)],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: "easeOut",
                repeat: Infinity,
                repeatDelay: randomBetween(1.5, 4),
              }}
            >
              {p.glyph}
            </motion.span>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
