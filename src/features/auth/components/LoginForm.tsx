'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useAuth, setRememberSession } from '@/contexts/AuthContext'
import { backendApi } from '@/lib/backend-api'
import { Loader2, Eye, EyeOff, MailQuestion } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'

interface LoginFormProps {
  onSwitch: (step: string, data?: string) => void
  onSuccess: () => void
}

const inputClass = 'w-full px-4 py-3 rounded-lg bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-foreground dark:text-white placeholder-zinc-500 text-sm outline-none focus:outline-none focus:border-sasi-red/50 focus:bg-slate-200 dark:focus:bg-white/[0.12] transition'

export function LoginForm({ onSwitch, onSuccess }: LoginFormProps) {
  const { login } = useAuth()
  const { t } = useLang()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [shaking, setShaking] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [hasInvite, setHasInvite] = useState(false)
  const passRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try {
      const saved = parseInt(sessionStorage.getItem('sasi_loginAttempts') || '0', 10)
      setAttempts(saved)
    } catch {}
  }, [])

  const triggerShake = useCallback(() => {
    setShaking(true)
    setTimeout(() => setShaking(false), 500)
  }, [])

  const checkInvite = async () => {
    const val = username.trim().toLowerCase()
    if (!val || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) { setHasInvite(false); return }
    try {
      const { invited } = await backendApi.checkInvite(val)
      setHasInvite(invited)
    } catch { setHasInvite(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!username) { setError(t('login.error.username')); triggerShake(); return }
    if (!password) { setError(t('login.error.password')); triggerShake(); return }
    setLoading(true)
    const res = await login(username, password)
    setLoading(false)
    if (res.ok) {
      try { sessionStorage.removeItem('sasi_loginAttempts') } catch {}
      if (rememberMe) {
        setRememberSession(true)
        try { localStorage.setItem('sasi_remember', 'true') } catch {}
      }
      onSuccess()
    } else {
      const next = attempts + 1
      setAttempts(next)
      try { sessionStorage.setItem('sasi_loginAttempts', String(next)) } catch {}
      if (next >= 5) {
        try { sessionStorage.removeItem('sasi_loginAttempts') } catch {}
        onSwitch('email')
        return
      }
      setError(res.error || t('login.error.default'))
      triggerShake()
    }
  }

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="w-[180px] h-[60px] mx-auto mb-4">
          <img src="/assets/logo-white.png" alt={t('login.altLogo')} className="w-full h-full object-contain" />
        </div>
        <div className="text-sm text-zinc-500">{t('login.subtitle')}</div>
      </div>

      <form onSubmit={handleSubmit} className={`space-y-3 ${shaking ? 'animate-shake' : ''}`}>
        <div className="relative">
          <input
            className={inputClass}
            type="text"
            autoComplete="username"
            placeholder={t('login.username')}
            value={username}
            onChange={e => setUsername(e.target.value)}
            onBlur={checkInvite}
            onKeyDown={e => e.key === 'Enter' && passRef.current?.focus()}
          />
        </div>

        <div className="relative">
          <input
            ref={passRef}
            className={`${inputClass} pr-10`}
            type={showPw ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder={t('login.password')}
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
            onClick={() => setShowPw(!showPw)}
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
            <p className="text-red-400 text-xs">{typeof error === 'string' ? error : 'Erro inesperado'}</p>
          </div>
        )}

        {hasInvite && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <MailQuestion size={15} className="text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-300 leading-relaxed">
              {t('login.invite.pending')}{' '}
              <button type="button" className="underline font-semibold hover:text-blue-200 transition" onClick={() => onSwitch('invite', username)}>
                {t('login.invite.setup')}
              </button>
            </div>
          </div>
        )}

        <label className="flex items-center gap-3 cursor-pointer select-none py-1">
          <div
            className={`relative w-[38px] h-[22px] rounded-full transition-colors duration-200 ${rememberMe ? 'bg-sasi-red' : 'bg-zinc-700'}`}
            onClick={() => setRememberMe(!rememberMe)}
          >
            <div className={`absolute top-[2px] left-[2px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform duration-200 ${rememberMe ? 'translate-x-[16px]' : ''}`} />
          </div>
          <span className="text-xs text-zinc-400">{t('login.remember')}</span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-sasi-red to-red-500 text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-lg shadow-sasi-red/20"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {t('login.signIn')}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-white/10" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-slate-100 dark:bg-white/5 backdrop-blur-sm px-4 py-1 text-[11px] text-zinc-500 rounded-full border border-slate-200 dark:border-white/10">{t('login.or')}</span>
        </div>
      </div>

      <button
        className="w-full py-2.5 rounded-lg border border-border text-zinc-400 text-sm font-medium hover:border-zinc-500 hover:text-zinc-300 transition"
        onClick={() => onSwitch('register')}
      >
        {t('login.firstAccess')}
      </button>
    </div>
  )
}
