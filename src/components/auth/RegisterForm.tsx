'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { PasswordChecklist } from './PasswordChecklist'

interface RegisterFormProps {
  onSuccess: () => void
  onBack: () => void
}

const inputClass = 'w-full px-4 py-3 rounded-lg bg-white/10 border border-white/10 text-white placeholder-zinc-500 text-sm outline-none focus:border-sasi-red/50 focus:bg-white/[0.12] transition'

export function RegisterForm({ onSuccess, onBack }: RegisterFormProps) {
  const { register } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const pwOk = password.length >= 8 && /[a-zA-Z]/.test(password) && /[!@#$%^&*()_+\-=\[\]{}|;':",.\/<>\?`~]/.test(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email) { setError('Digite seu e-mail'); return }
    if (!pwOk) { setError('Senha não atende aos requisitos'); return }
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
        Voltar
      </button>

      <div className="text-center">
        <div className="text-lg font-semibold text-white">Criar Conta</div>
        <div className="text-sm text-zinc-500 mt-1">Preencha os dados para se registrar</div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          className={inputClass}
          type="email" placeholder="Seu e-mail"
          value={email} onChange={e => setEmail(e.target.value)}
        />

        <div className="relative">
          <input
            className={`${inputClass} pr-10`}
            type={showPw ? 'text' : 'password'} placeholder="Crie uma senha"
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
          Cadastrar
        </button>
      </form>
    </div>
  )
}
