'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { useAppContext } from '@/contexts/AppContext'
import { ProfileDropdown } from './ProfileDropdown'
import { Moon, Sun, RotateCcw } from 'lucide-react'

export function Header() {
  const { isDark, toggle } = useTheme()
  const { totalApps } = useAppContext()

  return (
    <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-lg border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-xl font-bold text-white tracking-tight">SASI</div>
          <span className="hidden sm:inline text-xs text-zinc-500">Comunicações Ágil Ltda</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-400">
            <span className="font-semibold text-white">{totalApps}</span> apps monitorados
          </span>

          <button
            onClick={toggle}
            className="p-2 rounded-lg bg-white/[0.08] border border-white/[0.12] text-zinc-400 hover:text-white hover:bg-white/[0.12] transition"
            title="Alternar tema"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <ProfileDropdown />

          <button
            className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition"
            title="Restaurar dados iniciais"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>
    </header>
  )
}
