'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAppContext } from '@/contexts/AppContext'
import { useToast } from '@/components/Toast'
import { ProfileDropdown } from './ProfileDropdown'
import { Moon, Sun, RotateCcw } from 'lucide-react'

export function Header() {
  const { isDark, toggle } = useTheme()
  const { totalApps, resetData } = useAppContext()
  const { show } = useToast()
  const [scrolled, setScrolled] = useState(false)

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
              SASI
            </span>
            <span className="text-[10px] text-muted-foreground font-medium leading-tight mt-0.5">
              Comunicações Ágil Ltda
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface text-xs font-medium text-muted-foreground">
            <span className="font-semibold text-foreground">{totalApps}</span>
            app{totalApps !== 1 ? 's' : ''}
          </div>

          <button
            onClick={toggle}
            className="w-[34px] h-[34px] rounded-full border border-border bg-inset text-muted-foreground hover:text-foreground hover:border-border-light hover:bg-card-hover flex items-center justify-center transition-all duration-200 shrink-0"
            title="Alternar tema"
          >
            <div className="transition-transform duration-300 hover:scale-110 active:scale-90 flex items-center justify-center">
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </div>
          </button>

          <ProfileDropdown />

          <button
            onClick={handleReset}
            className="w-[34px] h-[34px] rounded-full border border-border bg-inset text-muted-foreground hover:text-foreground hover:border-border-light hover:bg-card-hover flex items-center justify-center transition-all duration-200 shrink-0"
            title="Restaurar dados iniciais"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
    </header>
  )
}
