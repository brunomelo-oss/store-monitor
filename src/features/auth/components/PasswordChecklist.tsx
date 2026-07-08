'use client'

import { Check } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'

export function PasswordChecklist({ password }: { password: string }) {
  const { t } = useLang()
  const checks = [
    { label: t('passwordChecklist.length'), ok: password.length >= 8 },
    { label: t('passwordChecklist.letter'), ok: /[a-zA-Z]/.test(password) },
    { label: t('passwordChecklist.special'), ok: /[!@#$%^&*()_+\-=\[\]{}|;':",.\/<>\?`~]/.test(password) },
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
