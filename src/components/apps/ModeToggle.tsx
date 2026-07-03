'use client'

interface ModeToggleProps {
  mode: 'view' | 'edit'
  onChange: (mode: 'view' | 'edit') => void
  show: boolean
}

export function ModeToggle({ mode, onChange, show }: ModeToggleProps) {
  if (!show) return null

  return (
    <div className="flex rounded-xl border border-border overflow-hidden bg-surface p-0.5 shadow-sm">
      {(['view', 'edit'] as const).map(m => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
            mode === m
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {m === 'view' ? 'Visualizador' : 'Editor'}
        </button>
      ))}
    </div>
  )
}
