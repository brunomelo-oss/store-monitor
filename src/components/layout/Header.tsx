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

  const btnClass = 'p-2 rounded-lg text-zinc-500 hover:text-foreground hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition'

  return (
    <header className={`sticky top-0 z-40 bg-surface/80 backdrop-blur-lg border-b transition-all duration-200 ${scrolled ? 'border-zinc-500/30 shadow-lg shadow-black/10' : 'border-border'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-xl font-bold text-foreground tracking-tight select-none" onDoubleClick={handleReset}>SASI</div>
          <span className="hidden sm:inline text-xs text-zinc-600">Comunicações Ágil Ltda</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 mr-1">
            <span className="font-semibold text-zinc-300">{totalApps}</span> apps
          </span>

          <button onClick={toggle} className={btnClass} title="Alternar tema">
            <div className="transition-transform duration-300 hover:scale-110">
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
