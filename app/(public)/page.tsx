"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { VinylPlayer } from "@/components/vinyl/VinylPlayer"
import { InstrumentParticles } from "@/components/vinyl/InstrumentParticles"

export default function LandingPage() {
  return (
    <main className="flex flex-col min-h-[calc(100dvh-3.5rem)]">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center flex-1 px-6 py-20 overflow-hidden text-center">
        {/* Background gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 60%, rgba(200,135,42,0.08) 0%, transparent 70%)",
          }}
        />

        {/* Vinyl + particles container */}
        <div className="relative mb-12">
          <div className="relative" style={{ width: 280, height: 280 }}>
            <VinylPlayer size={280} playing />
            <InstrumentParticles count={50} active />
          </div>
        </div>

        {/* Headline */}
        <motion.h1
          className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-wide mb-6 max-w-2xl"
          style={{ fontFamily: "var(--font-cinzel)", color: "var(--text)" }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        >
          Tes jeux préférés{" "}
          <span style={{ color: "var(--accent-light)" }}>sur scène</span>
        </motion.h1>

        <motion.p
          className="text-lg sm:text-xl max-w-lg mb-10 leading-relaxed"
          style={{ color: "var(--text-muted)" }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
        >
          Overture détecte les concerts orchestraux des jeux de ta bibliothèque
          Steam et t&apos;alerte avant que les billets disparaissent.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 w-full max-w-sm sm:max-w-none sm:w-auto"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
        >
          <Link
            href="/explore"
            className="inline-flex items-center justify-center h-14 px-8 rounded-full text-base font-semibold transition-all duration-200"
            style={{
              fontFamily: "var(--font-cinzel)",
              background: "var(--accent)",
              color: "var(--bg)",
            }}
          >
            Explorer les concerts
          </Link>
          <Link
            href="/inscription"
            className="inline-flex items-center justify-center h-14 px-8 rounded-full text-base font-semibold border transition-all duration-200"
            style={{
              fontFamily: "var(--font-cinzel)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          >
            Créer un compte
          </Link>
        </motion.div>

        {/* Social proof / stats */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-8 mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          {[
            { value: "2 sources", label: "Ticketmaster + Bandsintown" },
            { value: "50+ jeux", label: "mappés avec leurs compositeurs" },
            { value: "Gratuit", label: "sans inscription requise" },
          ].map((stat) => (
            <div key={stat.value} className="text-center">
              <div
                className="text-xl font-semibold"
                style={{
                  fontFamily: "var(--font-cinzel)",
                  color: "var(--accent-light)",
                }}
              >
                {stat.value}
              </div>
              <div className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* How it works */}
      <section
        className="py-20 px-6"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-2xl sm:text-3xl font-bold text-center mb-12"
            style={{ fontFamily: "var(--font-cinzel)", color: "var(--text)" }}
          >
            Comment ça marche
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Connecte ta Steam",
                body: "Recherche tes jeux et ajoute-les à ta watchlist. Pas besoin de compte.",
              },
              {
                step: "02",
                title: "On surveille pour toi",
                body: "Overture agrège Ticketmaster et Bandsintown toutes les 6 heures.",
              },
              {
                step: "03",
                title: "Alerte avant sold-out",
                body: "Reçois un email ou une notification push dès qu'un concert correspond.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative p-6 rounded-2xl"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  className="text-4xl font-bold mb-4 opacity-30"
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    color: "var(--accent)",
                  }}
                >
                  {item.step}
                </div>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ fontFamily: "var(--font-cinzel)", color: "var(--text)" }}
                >
                  {item.title}
                </h3>
                <p className="text-base leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-8 px-6 text-center text-sm"
        style={{
          borderTop: "1px solid var(--border)",
          color: "var(--text-muted)",
        }}
      >
        <p style={{ fontFamily: "var(--font-cinzel)" }}>
          © 2026 Overture — concerts de musique de jeux vidéo
        </p>
      </footer>
    </main>
  )
}
