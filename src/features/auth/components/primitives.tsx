import type { ReactNode } from 'react'
import { Eye, EyeOff, Check, X } from 'lucide-react'
import { useState } from 'react'
import { useLang } from '@/contexts/LanguageContext'

const inputClass = 'w-full px-4 py-3 rounded-lg bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-foreground placeholder:text-muted-foreground text-sm outline-none focus:border-sasi-red/50 focus:bg-slate-200 dark:focus:bg-white/[0.12] transition'

export function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-slate-500 dark:text-white/60">{label}</span>
      {children}
    </label>
  )
}

export function PasswordInput({
  value,
  onChange,
  placeholder,
  confirm,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  confirm?: boolean
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        className={`${inputClass} pr-10 ${confirm ? 'password-confirm' : 'password-input'}`}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      <button
        type="button"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
        onClick={() => setShow(!show)}
        aria-label="Mostrar senha"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  )
}

export function SubmitButton({ children, loading }: { children: ReactNode; loading?: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-3 rounded-lg bg-gradient-to-r from-sasi-red to-red-500 text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-lg shadow-sasi-red/20"
    >
      {children}
    </button>
  )
}

export function SuccessScreen({ title, message, buttonLabel, onClick }: { title: string; message: string; buttonLabel: string; onClick: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center">
        <Check size={26} className="text-emerald-500" />
      </div>
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <p className="text-sm text-slate-300">{message}</p>
      </div>
      <button
        onClick={onClick}
        className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-sasi-red to-red-500 text-white font-semibold text-sm hover:opacity-90 transition"
      >
        {buttonLabel}
      </button>
    </div>
  )
}

export function PasswordChecklist({ password }: { password: string }) {
  const { t } = useLang()
  const checks = [
    { id: 'length', ok: password.length >= 8, label: t('passwordChecklist.length') },
    { id: 'upper', ok: /[A-Z]/.test(password), label: t('passwordChecklist.uppercase') },
    { id: 'lower', ok: /[a-z]/.test(password), label: t('passwordChecklist.lowercase') },
    { id: 'special', ok: /[^A-Za-z0-9]/.test(password), label: t('passwordChecklist.special') },
  ]
  return (
    <ul className="space-y-1 text-xs">
      {checks.map(c => (
        <li key={c.id} className={`flex items-center gap-1.5 ${c.ok ? 'text-emerald-500' : 'text-slate-400'}`}>
          {c.ok ? <Check size={12} /> : <X size={12} />}
          {c.label}
        </li>
      ))}
    </ul>
  )
}

export function isStrongPassword(password: string): boolean {
  return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[^A-Za-z0-9]/.test(password)
}