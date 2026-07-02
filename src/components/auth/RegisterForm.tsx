'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

interface RegisterFormProps {
  onSuccess: () => void
  onBack: () => void
}

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
    <div className="space-y-4">
      <div className="text-center text-lg font-semibold text-white">Primeiro Acesso</div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/10 text-white placeholder-zinc-500 text-sm outline-none focus:border-sasi-red/50 transition"
          type="email" placeholder="Seu e-mail"
          value={email} onChange={e => setEmail(e.target.value)}
        />
        <div className="relative">
          <input
            className="w-full px-4 py-3 pr-10 rounded-lg bg-white/10 border border-white/10 text-white placeholder-zinc-500 text-sm outline-none focus:border-sasi-red/50 transition"
            type={showPw ? 'text' : 'password'} placeholder="Crie uma senha"
            value={password} onChange={e => setPassword(e.target.value)}
          />
          <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500" onClick={() => setShowPw(!showPw)}>
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <div className="space-y-1 text-xs">
          <div className={`${password.length >= 8 ? 'text-emerald-400' : 'text-zinc-500'}`}>✓ Mínimo 8 caracteres</div>
          <div className={`${/[a-zA-Z]/.test(password) ? 'text-emerald-400' : 'text-zinc-500'}`}>✓ Pelo menos 1 letra</div>
          <div className={`${/[!@#$%^&*()_+\-=\[\]{}|;':",.\/<>\?`~]/.test(password) ? 'text-emerald-400' : 'text-zinc-500'}`}>✓ Pelo menos 1 caractere especial</div>
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button type="submit" disabled={loading || !pwOk}
          className="w-full py-3 rounded-lg bg-sasi-red text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          Cadastrar
        </button>
      </form>
      <button className="text-xs text-zinc-500 hover:text-zinc-300 transition" onClick={onBack}>
        ← Voltar
      </button>
    </div>
  )
}
