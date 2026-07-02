'use client'

import { Search } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (v: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
      <input
        className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-surface border border-zinc-800 text-white placeholder-zinc-500 text-sm outline-none focus:border-zinc-600 transition"
        type="text"
        placeholder="Buscar app..."
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}
