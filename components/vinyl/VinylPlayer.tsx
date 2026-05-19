"use client"

import { motion, useReducedMotion } from "framer-motion"

interface VinylPlayerProps {
  size?: number
  className?: string
  playing?: boolean
}

export function VinylPlayer({
  size = 280,
  className = "",
  playing = true,
}: VinylPlayerProps) {
  const prefersReduced = useReducedMotion()
  const shouldAnimate = playing && !prefersReduced

  const duration = 3.2

  return (
    <div
      className={`relative select-none ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* Vinyl disc */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `
            radial-gradient(circle at 50% 50%,
              #2a1a0a 0%,
              #1a0f05 15%,
              #0d0a07 30%,
              #1a1410 45%,
              #0d0a07 55%,
              #1a1410 65%,
              #0d0a07 75%,
              #1a1410 85%,
              #0d0a07 100%
            )
          `,
          boxShadow: `
            0 0 0 2px rgba(200, 135, 42, 0.3),
            0 8px 32px rgba(0, 0, 0, 0.6),
            inset 0 0 60px rgba(0, 0, 0, 0.4)
          `,
        }}
        animate={shouldAnimate ? { rotate: 360 } : {}}
        transition={
          shouldAnimate
            ? { duration, ease: "linear", repeat: Infinity }
            : {}
        }
      >
        {/* Groove rings */}
        {[30, 38, 46, 54, 62, 70, 78, 86].map((pct) => (
          <div
            key={pct}
            className="absolute rounded-full border"
            style={{
              inset: `${pct / 2}%`,
              borderColor: "rgba(200, 135, 42, 0.08)",
            }}
          />
        ))}

        {/* Center label */}
        <div
          className="absolute rounded-full flex items-center justify-center"
          style={{
            inset: "35%",
            background:
              "radial-gradient(circle, #c8872a 0%, #8b5a1a 60%, #6b3d0a 100%)",
            boxShadow: "0 0 12px rgba(200, 135, 42, 0.4)",
          }}
        >
          {/* Spindle hole */}
          <div
            className="rounded-full"
            style={{
              width: "18%",
              height: "18%",
              background: "#0d0a07",
              boxShadow: "inset 0 0 4px rgba(0,0,0,0.8)",
            }}
          />
        </div>

        {/* Highlight reflection */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%)",
          }}
        />
      </motion.div>

      {/* Tonearm */}
      <div
        className="absolute"
        style={{
          top: "8%",
          right: "4%",
          width: "28%",
          height: "55%",
          transformOrigin: "top right",
        }}
      >
        <svg viewBox="0 0 40 80" fill="none" className="w-full h-full">
          <line
            x1="36"
            y1="4"
            x2="8"
            y2="74"
            stroke="rgba(200,135,42,0.6)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="36" cy="4" r="4" fill="rgba(200,135,42,0.7)" />
          <circle cx="8" cy="74" r="3" fill="rgba(200,135,42,0.5)" />
        </svg>
      </div>
    </div>
  )
}
