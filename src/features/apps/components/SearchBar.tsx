'use client'

import { useLang } from '@/contexts/LanguageContext'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (v: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const { t } = useLang()
  return (
    <div className="relative max-w-xs w-full">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <input
        className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-surface border border-border text-foreground placeholder-muted-foreground text-sm outline-none focus:border-sasi-red/50 focus:ring-2 focus:ring-sasi-red/10 transition-all duration-200"
        type="text"
        placeholder={t('search.placeholder')}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
