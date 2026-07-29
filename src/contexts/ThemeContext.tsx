'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

const THEME_KEY = 'sasi_theme'

interface ThemeState {
  isDark: boolean
  toggle: () => void
}

const ThemeContext = createContext<ThemeState>(null!)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_KEY)
      if (saved === 'light') {
        document.documentElement.classList.remove('dark')
        return false
      }
      document.documentElement.classList.add('dark')
    }
    return true
  })

  const toggle = () => {
    setIsDark(prev => {
      const next = !prev
      if (next) {
        document.documentElement.classList.add('dark')
        localStorage.setItem(THEME_KEY, 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem(THEME_KEY, 'light')
      }
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider')
  return ctx
}
