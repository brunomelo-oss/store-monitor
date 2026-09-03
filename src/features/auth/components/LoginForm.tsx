'use client'

import { useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useLang } from '@/contexts/LanguageContext'
import { useShake } from '@/hooks/useShake'
import { Loader2, Eye, EyeOff } from 'lucide-react'

interface LoginFormProps {
  onSwitch: (step: string, data?: string) => void
  onSuccess: () => void
}

const inputClass = 'w-full px-4 py-3 rounded-lg bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-foreground placeholder:text-muted-foreground text-sm outline-none focus:outline-none focus:border-sasi-red/50 focus:bg-slate-200 dark:focus:bg-white/[0.12] transition'

export function LoginForm({ onSwitch, onSuccess }: LoginFormProps) {
  const { login, setRememberSession } = useAuth()
  const { isDark } = useTheme()
  const { t } = useLang()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [attempts, setAttempts] = useState<number>(() => {
    try {
      return parseInt(sessionStorage.getItem('sasi_loginAttempts') || '0', 10)
    } catch {
      return 0
    }
  })
  const { shaking, trigger: triggerShake } = useShake()
  const [rememberMe, setRememberMe] = useState(false)
  const passRef = useRef<HTMLInputElement>(null)

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
      if (rememberMe) setRememberSession(true)
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
          <img src={isDark ? '/assets/logo-white.png' : '/assets/logo-black.png'} alt={t('login.altLogo')} className="w-full h-full object-contain" />
        </div>
        <div className="text-sm text-muted-foreground">{t('login.subtitle')}</div>
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
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
            onClick={() => setShowPw(!showPw)}
            aria-label="Mostrar senha"
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

        <label className="flex items-center gap-3 cursor-pointer select-none py-1">
          <div
            className={`relative w-[38px] h-[22px] rounded-full transition-colors duration-200 ${rememberMe ? 'bg-sasi-red' : 'bg-inset'}`}
            onClick={() => setRememberMe(!rememberMe)}
          >
            <div className={`absolute top-[2px] left-[2px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform duration-200 ${rememberMe ? 'translate-x-[16px]' : ''}`} />
          </div>
          <span className="text-xs text-muted-foreground">{t('login.remember')}</span>
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
    </div>
  )
}