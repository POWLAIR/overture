"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light"
type ManualTheme = Theme | null

interface ThemeContextValue {
  theme: Theme
  manualTheme: ManualTheme
  setManualTheme: (theme: ManualTheme) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  manualTheme: null,
  setManualTheme: () => {},
})

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext)
}

function getAutoTheme(): Theme {
  const hour = new Date().getHours()
  return hour >= 18 || hour < 8 ? "dark" : "light"
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [manualTheme, setManualThemeState] = useState<ManualTheme>(() => {
    if (typeof window === "undefined") return null
    const stored = localStorage.getItem("overture:theme") as ManualTheme
    return stored === "dark" || stored === "light" ? stored : null
  })
  const [autoTheme, setAutoTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light"
    return getAutoTheme()
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setAutoTheme(getAutoTheme())
    }, 60_000)
    return () => clearInterval(interval)
  }, [])

  const theme = manualTheme ?? autoTheme

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  function setManualTheme(value: ManualTheme) {
    setManualThemeState(value)
    if (value) {
      localStorage.setItem("overture:theme", value)
    } else {
      localStorage.removeItem("overture:theme")
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, manualTheme, setManualTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
