'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { backendApi } from '@/lib/backend-api'
import { Loader2, MailQuestion, Eye, EyeOff, Lock } from 'lucide-react'

interface LoginFormProps {
  onSwitch: (step: string, data?: string) => void
  onSuccess: () => void
}

const inputClass = 'w-full px-4 py-3 rounded-lg bg-white/10 border border-white/10 text-white placeholder-zinc-500 text-sm outline-none focus:border-sasi-red/50 focus:bg-white/[0.12] transition'

export function LoginForm({ onSwitch, onSuccess }: LoginFormProps) {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [hasInvite, setHasInvite] = useState(false)
  const passRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try {
      const saved = parseInt(sessionStorage.getItem('sasi_loginAttempts') || '0', 10)
      setAttempts(saved)
    } catch {}
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
    if (!username) { setError('Digite seu usuário ou e-mail'); return }
    if (!password) { setError('Digite sua senha'); return }
    setLoading(true)
    const res = await login(username, password)
    setLoading(false)
    if (res.ok) {
      try { sessionStorage.removeItem('sasi_loginAttempts') } catch {}
      onSuccess()
    } else {
      const next = attempts + 1
      setAttempts(next)
      try { sessionStorage.setItem('sasi_loginAttempts', String(next)) } catch {}
      setError(res.error || 'Erro ao fazer login')
    }
  }

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-sasi-red to-red-500 flex items-center justify-center shadow-lg shadow-sasi-red/20">
          <span className="text-2xl font-bold text-white">S</span>
        </div>
        <div className="text-xl font-bold text-white mt-4 tracking-tight">SASI</div>
        <div className="text-sm text-zinc-500 mt-0.5">Monitoramento de Apps</div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <input
            className={inputClass}
            type="text"
            placeholder="Usuário ou e-mail"
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
            placeholder="Senha"
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
            <p className="text-red-400 text-xs">{error}</p>
          </div>
        )}

        {hasInvite && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <MailQuestion size={15} className="text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-300 leading-relaxed">
              Você tem um convite pendente.{' '}
              <button type="button" className="underline font-semibold hover:text-blue-200 transition" onClick={() => onSwitch('invite', username)}>
                Configurar conta
              </button>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-sasi-red to-red-500 text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-lg shadow-sasi-red/20"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          Entrar
        </button>
      </form>

      {attempts >= 2 && (
        <button
          className="w-full text-center text-xs text-zinc-500 hover:text-zinc-300 transition"
          onClick={() => onSwitch('email')}
        >
          Esqueci minha senha
        </button>
      )}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-black px-3 text-zinc-600">ou</span>
        </div>
      </div>

      <button
        className="w-full py-2.5 rounded-lg border border-border text-zinc-400 text-sm font-medium hover:border-zinc-500 hover:text-zinc-300 transition"
        onClick={() => onSwitch('register')}
      >
        Primeiro acesso
      </button>
    </div>
  )
}
