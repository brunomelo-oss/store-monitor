'use client'

interface ModeToggleProps {
  mode: 'view' | 'edit'
  onChange: (mode: 'view' | 'edit') => void
  show: boolean
}

export function ModeToggle({ mode, onChange, show }: ModeToggleProps) {
  if (!show) return null

  return (
    <div className="flex rounded-lg border border-zinc-800 overflow-hidden">
      <button
        onClick={() => onChange('view')}
        className={`px-4 py-2 text-sm font-medium transition ${
          mode === 'view'
            ? 'bg-zinc-800 text-white'
            : 'bg-surface text-zinc-500 hover:text-zinc-300'
        }`}
      >
        Visualizador
      </button>
      <button
        onClick={() => onChange('edit')}
        className={`px-4 py-2 text-sm font-medium transition ${
          mode === 'edit'
            ? 'bg-zinc-800 text-white'
            : 'bg-surface text-zinc-500 hover:text-zinc-300'
        }`}
      >
        Editor
      </button>
    </div>
  )
}
