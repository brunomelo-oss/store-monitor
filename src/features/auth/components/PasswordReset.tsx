'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2, ArrowLeft, Eye, EyeOff, Mail } from 'lucide-react'
import { PasswordChecklist } from './PasswordChecklist'
import { useLang } from '@/contexts/LanguageContext'

interface PasswordResetProps {
  onBack: () => void
  onSuccess: () => void
}

const inputClass = 'w-full px-4 py-3 rounded-lg bg-white/10 border border-white/10 text-white placeholder-zinc-500 text-sm outline-none focus:border-sasi-red/50 focus:bg-white/[0.12] transition'

export function PasswordReset({ onBack, onSuccess }: PasswordResetProps) {
  const { sendResetEmail, doResetPassword } = useAuth()
  const { t } = useLang()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [code] = useState('000000')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const pwOk = password.length >= 8 && /[a-zA-Z]/.test(password) && /[!@#$%^&*()_+\-=\[\]{}|;':",.\/<>\?`~]/.test(password)

  const handleSend = async () => {
    setError('')
    if (!email) { setError(t('reset.error.email')); return }
    setLoading(true)
    const err = await sendResetEmail(email)
    setLoading(false)
    if (err) { setError(err); return }
    setSent(true)
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!pwOk) { setError(t('reset.error.password')); return }
    if (password !== confirm) { setError(t('reset.error.match')); return }
    setLoading(true)
    const err = await doResetPassword(email, code, password)
    setLoading(false)
    if (err) { setError(err); return }
    onSuccess()
  }

  if (!sent) {
    return (
      <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition">
          <ArrowLeft size={14} />
          {t('common.back')}
        </button>

        <div className="text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
            <Mail size={20} className="text-yellow-400" />
          </div>
          <div className="text-lg font-semibold text-white mt-3">{t('reset.title.email')}</div>
          <div className="text-sm text-zinc-500 mt-1">{t('reset.subtitle.email')}</div>
        </div>

        <input
          className={inputClass}
          type="email" autoComplete="email" placeholder={t('reset.email')}
          value={email} onChange={e => setEmail(e.target.value)}
        />

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
            <p className="text-red-400 text-xs">{error}</p>
          </div>
        )}

        <button onClick={handleSend} disabled={loading}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-sasi-red to-red-500 text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-lg shadow-sasi-red/20"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {t('reset.send')}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <button onClick={() => setSent(false)} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition">
        <ArrowLeft size={14} />
        {t('common.back')}
      </button>

      <div className="text-center">
        <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <Mail size={20} className="text-emerald-400" />
        </div>
        <div className="text-lg font-semibold text-white mt-3">{t('reset.title.reset')}</div>
        <div className="text-sm text-zinc-500 mt-1">{t('reset.subtitle.reset', { email })}</div>
      </div>

      <form onSubmit={handleReset} className="space-y-3">
        <div className="relative">
          <input
            className={`${inputClass} pr-10`}
            type={showPw ? 'text' : 'password'} autoComplete="new-password" placeholder={t('reset.newPassword')}
            value={password} onChange={e => setPassword(e.target.value)}
          />
          <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition" onClick={() => setShowPw(!showPw)}>
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <input
          className={inputClass}
          type="password" autoComplete="new-password" placeholder={t('reset.confirmPassword')}
          value={confirm} onChange={e => setConfirm(e.target.value)}
        />

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
          {t('reset.submit')}
        </button>
      </form>
    </div>
  )
}
