'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAppContext } from '@/contexts/AppContext'
import { useToast } from '@/components/Toast'
import { ProfileDropdown } from './ProfileDropdown'
import { Moon, Sun, RotateCcw, Languages } from 'lucide-react'

export function Header() {
  const { isDark, toggle } = useTheme()
  const { totalApps, resetData } = useAppContext()
  const { show } = useToast()
  const [scrolled, setScrolled] = useState(false)
  const [langOpen, setLangOpen] = useState(false)

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'pt', label: 'Português' },
    { code: 'ar', label: 'العربية' },
  ]
  const [currentLang, setCurrentLang] = useState('pt')
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleReset = async () => {
    if (confirm('Restaurar dados iniciais do dashboard?')) {
      const err = await resetData()
      if (err) show(err, 'error')
      else show('Dados restaurados', 'success')
    }
  }

  return (
    <header className={`app-header sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'shadow-sm' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-[url('/assets/SASI-4.png')] bg-center bg-contain bg-no-repeat shrink-0" />
          <div className="flex flex-col">
            <span className="logo-sasi text-xl font-extrabold tracking-tight select-none leading-none" onDoubleClick={handleReset}>
              SASI - Comunicação Ágil
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface text-xs font-medium text-muted-foreground">
            <span className="font-semibold text-foreground">{totalApps}</span>
            app{totalApps !== 1 ? 's' : ''}
          </div>

          <button
            onClick={toggle}
            className="w-[32px] h-[32px] rounded-full border border-border bg-inset text-muted-foreground hover:text-foreground hover:border-border-light hover:bg-card-hover flex items-center justify-center transition-all duration-200 shrink-0"
            title="Alternar tema"
          >
            <div className="transition-transform duration-300 hover:scale-110 active:scale-90 flex items-center justify-center">
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </div>
          </button>

          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="w-[32px] h-[32px] rounded-full border border-border bg-inset text-muted-foreground hover:text-foreground hover:border-border-light hover:bg-card-hover flex items-center justify-center transition-all duration-200 shrink-0"
              title="Idioma"
            >
              <Languages size={14} />
            </button>
            {langOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-36 bg-card border border-border rounded-xl shadow-xl py-1 z-50 animate-dropdownIn origin-top-right">
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => { setCurrentLang(lang.code); setLangOpen(false) }}
                      className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between transition-colors ${currentLang === lang.code ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                    >
                      {lang.label}
                      {currentLang === lang.code && (
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
            title="Restaurar dados iniciais"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>
    </header>
  )
}
