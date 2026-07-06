'use client'

import { useLang } from '@/contexts/LanguageContext'

interface ModeToggleProps {
  mode: 'view' | 'edit'
  onChange: (mode: 'view' | 'edit') => void
  show: boolean
}

export function ModeToggle({ mode, onChange, show }: ModeToggleProps) {
  const { t } = useLang()
  if (!show) return null

  return (
    <div className="flex rounded-xl border border-border overflow-hidden bg-surface p-0.5 shadow-sm">
      {(['view', 'edit'] as const).map(m => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
            mode === m
              ? 'bg-sasi-red text-white shadow-sm shadow-sasi-red/20'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {m === 'view' ? t('modeToggle.view') : t('modeToggle.edit')}
        </button>
      ))}
    </div>
  )
}
