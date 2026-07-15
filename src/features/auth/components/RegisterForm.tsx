'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { PasswordChecklist } from './PasswordChecklist'
import { useLang } from '@/contexts/LanguageContext'

interface RegisterFormProps {
  onSuccess: () => void
  onBack: () => void
}

const inputClass = 'w-full px-4 py-3 rounded-lg bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-foreground dark:text-white placeholder-zinc-500 text-sm outline-none focus:border-sasi-red/50 focus:bg-slate-200 dark:focus:bg-white/[0.12] transition'

export function RegisterForm({ onSuccess, onBack }: RegisterFormProps) {
  const { register } = useAuth()
  const { t } = useLang()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const pwOk = password.length >= 8 && /[a-zA-Z]/.test(password) && /[!@#$%^&*()_+\-=\[\]{}|;':",.\/<>\?`~]/.test(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email) { setError(t('register.error.email')); return }
    if (!pwOk) { setError(t('register.error.password')); return }
    setLoading(true)
    const err = await register(email, password)
    setLoading(false)
    if (err) { setError(err); return }
    onSuccess()
  }

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition">
        <ArrowLeft size={14} />
        {t('common.back')}
      </button>

      <div className="text-center">
        <div className="text-lg font-semibold text-foreground dark:text-white">{t('register.title')}</div>
        <div className="text-sm text-zinc-500 mt-1">{t('register.subtitle')}</div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          className={inputClass}
          type="email" autoComplete="email" placeholder={t('register.email')}
          value={email} onChange={e => setEmail(e.target.value)}
        />

        <div className="relative">
          <input
            className={`${inputClass} pr-10`}
            type={showPw ? 'text' : 'password'} autoComplete="new-password" placeholder={t('register.password')}
            value={password} onChange={e => setPassword(e.target.value)}
          />
          <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition" onClick={() => setShowPw(!showPw)}>
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <PasswordChecklist password={password} />

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
            <p className="text-red-400 text-xs">{error}</p>
          </div>
        )}

        <button type="submit" disabled={loading || !pwOk}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-sasi-red to-red-500 text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-lg shadow-sasi-red/20"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {t('register.submit')}
        </button>
      </form>
    </div>
  )
}
