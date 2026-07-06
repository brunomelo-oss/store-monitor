'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { dictionaries, type LangCode } from '@/lib/i18n'

interface LanguageContextType {
  lang: LangCode
  setLang: (code: LangCode) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

export const LanguageContext = createContext<LanguageContextType | null>(null)

const STORAGE_KEY = 'sasi_lang'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>('pt')

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as LangCode | null
      if (saved && dictionaries[saved]) setLangState(saved)
    } catch {}
  }, [])

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let value = dictionaries[lang]?.[key]
      if (!value) {
        value = dictionaries.pt[key]
      }
      if (!value) return key
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          value = value.replace(`{${k}}`, String(v))
        }
      }
      return value
    },
    [lang],
  )

  const setLang = useCallback((code: LangCode) => {
    setLangState(code)
    try { localStorage.setItem(STORAGE_KEY, code) } catch {}
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr'
  }, [])

  useEffect(() => {
    document.title = t('layout.title')
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  }, [lang, t])

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used within LanguageProvider')
  return ctx
}
