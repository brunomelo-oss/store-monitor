'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { localStorageApi } from '@/lib/storage'

interface ThemeState {
  isDark: boolean
  toggle: () => void
}

const ThemeContext = createContext<ThemeState>(null!)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    localStorageApi.getTheme().then(saved => {
      if (saved === 'light') {
        setIsDark(false)
        document.documentElement.classList.remove('dark')
      } else {
        setIsDark(true)
        document.documentElement.classList.add('dark')
      }
    })
  }, [])

  const toggle = () => {
    setIsDark(prev => {
      const next = !prev
      if (next) {
        document.documentElement.classList.add('dark')
        localStorageApi.saveTheme('dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorageApi.saveTheme('light')
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
