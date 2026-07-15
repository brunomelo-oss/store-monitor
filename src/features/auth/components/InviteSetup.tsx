'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2, ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react'
import { PasswordChecklist } from './PasswordChecklist'
import { useLang } from '@/contexts/LanguageContext'

interface InviteSetupProps {
  email: string
  onSuccess: () => void
  onBack: () => void
}

const inputClass = 'w-full px-4 py-3 rounded-lg bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-foreground placeholder:text-muted-foreground text-sm outline-none focus:border-sasi-red/50 focus:bg-slate-200 dark:focus:bg-white/[0.12] transition'

export function InviteSetup({ email, onSuccess, onBack }: InviteSetupProps) {
  const { inviteSetup } = useAuth()
  const { t } = useLang()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const pwOk = password.length >= 8 && /[a-zA-Z]/.test(password) && /[!@#$%^&*()_+\-=\[\]{}|;':",.\/<>\?`~]/.test(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!pwOk) { setError(t('invite.error.password')); return }
    if (password !== confirm) { setError(t('invite.error.match')); return }
    setLoading(true)
    const err = await inviteSetup(email, password)
    setLoading(false)
    if (err) { setError(err); return }
    onSuccess()
  }

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition">
        <ArrowLeft size={14} />
        {t('common.back')}
      </button>

      <div className="text-center">
        <div className="w-12 h-12 mx-auto rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <Lock size={20} className="text-blue-400" />
        </div>
        <div className="text-lg font-semibold text-foreground mt-3">{t('invite.title')}</div>
        <div className="text-sm text-muted-foreground mt-1">{t('invite.subtitle')}</div>
      </div>

      <div className="p-3 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06]">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{t('invite.email')}</div>
        <div className="text-sm text-foreground font-medium">{email}</div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <input
            className={`${inputClass} pr-10`}
            type={showPw ? 'text' : 'password'} autoComplete="new-password" placeholder={t('invite.password')}
            value={password} onChange={e => setPassword(e.target.value)}
          />
          <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition" onClick={() => setShowPw(!showPw)}>
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <input
          className={inputClass}
          type="password" autoComplete="new-password" placeholder={t('invite.confirmPassword')}
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
          {t('invite.submit')}
        </button>
      </form>
    </div>
  )
}
