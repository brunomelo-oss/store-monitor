'use client'

import { Check } from 'lucide-react'

export function PasswordChecklist({ password }: { password: string }) {
  const checks = [
    { label: 'Mínimo 8 caracteres', ok: password.length >= 8 },
    { label: 'Pelo menos 1 letra', ok: /[a-zA-Z]/.test(password) },
    { label: 'Pelo menos 1 caractere especial', ok: /[!@#$%^&*()_+\-=\[\]{}|;':",.\/<>\?`~]/.test(password) },
  ]

  return (
    <div className="space-y-1.5">
      {checks.map((c, i) => (
        <div
          key={i}
          className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
            c.ok ? 'text-emerald-400' : 'text-zinc-500'
          }`}
        >
          <Check size={12} className={`transition-all duration-200 ${c.ok ? 'opacity-100 scale-100' : 'opacity-40 scale-75'}`} />
          {c.label}
        </div>
      ))}
    </div>
  )
}
