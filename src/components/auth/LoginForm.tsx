'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { localStorageApi } from '@/lib/storage'
import { Eye, EyeOff, Loader2, MailQuestion } from 'lucide-react'

interface LoginFormProps {
  onSwitch: (step: string, data?: string) => void
  onSuccess: () => void
}

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
    const invites = await localStorageApi.getInvites()
    setHasInvite(!!invites.find(i => i.email === val))
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
    <div className="space-y-4">
      <div className="text-center mb-6">
        <div className="text-3xl font-bold text-white tracking-tight">SASI</div>
        <div className="text-sm text-zinc-400 mt-1">Monitoramento de Apps</div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/10 text-white placeholder-zinc-500 text-sm outline-none focus:border-sasi-red/50 focus:bg-white/[0.12] transition"
          type="text"
          placeholder="Usuário ou e-mail"
          value={username}
          onChange={e => setUsername(e.target.value)}
          onBlur={checkInvite}
          onKeyDown={e => e.key === 'Enter' && passRef.current?.focus()}
        />
        <div className="relative">
          <input
            ref={passRef}
            className="w-full px-4 py-3 pr-10 rounded-lg bg-white/10 border border-white/10 text-white placeholder-zinc-500 text-sm outline-none focus:border-sasi-red/50 focus:bg-white/[0.12] transition"
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
        {error && <p className="text-red-400 text-xs">{error}</p>}
        {hasInvite && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <MailQuestion size={16} className="text-blue-400 shrink-0" />
            <div className="text-xs text-blue-300">
              Você tem um convite pendente.{' '}
              <button type="button" className="underline font-semibold" onClick={() => onSwitch('invite', username)}>
                Configurar conta
              </button>
            </div>
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-sasi-red text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2"
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
      <div className="text-center text-xs text-zinc-500">
        Não tem conta?{' '}
        <button className="text-sasi-red hover:underline" onClick={() => onSwitch('register')}>
          Primeiro acesso
        </button>
      </div>
    </div>
  )
}
