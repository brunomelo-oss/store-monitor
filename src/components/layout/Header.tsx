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

  const btnClass = 'p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-zinc-200/50 dark:hover:bg-white/[0.08] transition-all duration-200'

  return (
    <header className={`sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b transition-all duration-300 ${scrolled ? 'border-border/80 shadow-sm' : 'border-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-xl font-extrabold text-foreground tracking-tight select-none" onDoubleClick={handleReset}>SASI</div>
          <span className="hidden sm:inline-block h-4 w-px bg-border" />
          <span className="hidden sm:inline text-xs text-muted-foreground font-medium">Comunicações Ágil Ltda</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface text-xs font-medium text-muted-foreground">
            <span className="font-semibold text-foreground">{totalApps}</span>
            app{totalApps !== 1 ? 's' : ''}
          </div>

          <button onClick={toggle} className={btnClass} title="Alternar tema">
            <div className="transition-transform duration-300 hover:scale-110 active:scale-90">
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </div>
          </button>

          <ProfileDropdown />

          <button onClick={handleReset} className={btnClass} title="Restaurar dados iniciais">
            <RotateCcw size={15} />
          </button>
        </div>
      </div>
    </header>
  )
}
