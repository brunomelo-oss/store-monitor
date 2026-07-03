'use client'

interface ModeToggleProps {
  mode: 'view' | 'edit'
  onChange: (mode: 'view' | 'edit') => void
  show: boolean
}

export function ModeToggle({ mode, onChange, show }: ModeToggleProps) {
  if (!show) return null

  return (
    <div className="flex rounded-lg border border-border overflow-hidden bg-surface p-0.5">
      {(['view', 'edit'] as const).map(m => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
            mode === m
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {m === 'view' ? 'Visualizador' : 'Editor'}
        </button>
      ))}
    </div>
  )
}
