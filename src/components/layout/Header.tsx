'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAppContext } from '@/contexts/AppContext'
import { useToast } from '@/components/Toast'
import { useLang } from '@/contexts/LanguageContext'
import { ProfileDropdown } from './ProfileDropdown'
import { Moon, Sun, RotateCcw, Languages } from 'lucide-react'
import type { LangCode } from '@/lib/i18n'

export function Header() {
  const { isDark, toggle } = useTheme()
  const { totalApps, resetData } = useAppContext()
  const { show } = useToast()
  const { lang, setLang, t } = useLang()
  const [scrolled, setScrolled] = useState(false)
  const [langOpen, setLangOpen] = useState(false)

  const languages: { code: LangCode; label: string }[] = [
    { code: 'en', label: t('header.langEn') },
    { code: 'pt', label: t('header.langPt') },
    { code: 'ar', label: t('header.langAr') },
  ]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleReset = async () => {
    if (confirm(t('header.resetConfirm'))) {
      const err = await resetData()
      if (err) show(err, 'error')
      else show(t('header.resetSuccess'), 'success')
    }
  }

  return (
    <header className={`app-header sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'shadow-sm' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-[url('/assets/logo-sasi-white.png')] bg-center bg-contain bg-no-repeat shrink-0" />
          <div className="flex flex-col">
            <span className="logo-sasi text-xl font-extrabold tracking-tight select-none leading-none" onDoubleClick={handleReset}>
              SASI
            </span>
            <span className="text-[10px] text-muted-foreground font-medium leading-tight mt-0.5">
              {t('header.logoSubtitle')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface text-xs font-medium text-muted-foreground">
            <span className="font-semibold text-foreground">{totalApps}</span>
            {t('header.appCount', { count: '', s: totalApps !== 1 ? 's' : '' }).replace('{count}', '').trim()}
          </div>

          <button
            onClick={toggle}
            className="w-[32px] h-[32px] rounded-full border border-border bg-inset text-muted-foreground hover:text-foreground hover:border-border-light hover:bg-card-hover flex items-center justify-center transition-all duration-200 shrink-0"
            title={t('header.themeToggle')}
          >
            <div className="transition-transform duration-300 hover:scale-110 active:scale-90 flex items-center justify-center">
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </div>
          </button>

          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="w-[32px] h-[32px] rounded-full border border-border bg-inset text-muted-foreground hover:text-foreground hover:border-border-light hover:bg-card-hover flex items-center justify-center transition-all duration-200 shrink-0"
              title={t('header.language')}
            >
              <Languages size={14} />
            </button>
            {langOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-[18px] shadow-[0_20px_50px_rgba(0,0,0,0.18)] py-1.5 z-50 animate-dropdownIn">
                  {languages.map(l => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); setLangOpen(false) }}
                      className={`w-full h-12 px-4 text-left text-sm flex items-center justify-between transition-colors ${lang === l.code ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                    >
                      {l.label}
                      {lang === l.code && (
                        <span className="w-1.5 h-1.5 rounded-full bg-sasi-red" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <ProfileDropdown />

          <button
            onClick={handleReset}
            className="w-[32px] h-[32px] rounded-full border border-border bg-inset text-muted-foreground hover:text-foreground hover:border-border-light hover:bg-card-hover flex items-center justify-center transition-all duration-200 shrink-0"
            title={t('header.reset')}
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>
    </header>
  )
}
