'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useLang } from '@/contexts/LanguageContext'
import { ChartPie, Layers, Users } from 'lucide-react'

interface NavTabsProps {
  active: string
  onChange: (tab: string) => void
}

export function NavTabs({ active, onChange }: NavTabsProps) {
  const { isAdmin } = useAuth()
  const { t } = useLang()

  const tabs = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: ChartPie },
    { id: 'apps', label: t('nav.apps'), icon: Layers },
    ...(isAdmin ? [{ id: 'users', label: t('nav.users'), icon: Users }] : []),
  ]

  return (
    <div className="flex gap-1 bg-card border border-border rounded-2xl p-1 w-fit shadow-sm">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            active === id
              ? 'bg-inset text-foreground shadow-sm font-semibold'
              : 'text-muted-foreground hover:text-foreground hover:bg-surface'
          }`}
        >
          <Icon size={16} />
          {label}
        </button>
      ))}
    </div>
  )
}
