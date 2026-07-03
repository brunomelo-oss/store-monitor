'use client'

import { useAuth } from '@/contexts/AuthContext'
import { ChartPie, Layers, Users } from 'lucide-react'

interface NavTabsProps {
  active: string
  onChange: (tab: string) => void
}

export function NavTabs({ active, onChange }: NavTabsProps) {
  const { isAdmin } = useAuth()

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: ChartPie },
    { id: 'apps', label: 'Apps', icon: Layers },
    ...(isAdmin ? [{ id: 'users', label: 'Usuários', icon: Users }] : []),
  ]

  return (
    <div className="flex gap-1 bg-surface border border-border rounded-xl p-1 w-fit">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-medium transition ${
            active === id
              ? 'bg-zinc-800 text-white'
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
          }`}
        >
          <Icon size={16} />
          {label}
        </button>
      ))}
    </div>
  )
}
