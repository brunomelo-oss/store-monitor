'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

interface PasswordResetProps {
  onBack: () => void
  onSuccess: () => void
}

export function PasswordReset({ onBack, onSuccess }: PasswordResetProps) {
  const { sendResetEmail, doResetPassword } = useAuth()
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
    if (!email) { setError('Digite seu e-mail'); return }
    setLoading(true)
    const err = await sendResetEmail(email)
    setLoading(false)
    if (err) { setError(err); return }
    setSent(true)
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!pwOk) { setError('Senha não atende aos requisitos'); return }
    if (password !== confirm) { setError('Senhas não conferem'); return }
    setLoading(true)
    const err = await doResetPassword(email, code, password)
    setLoading(false)
    if (err) { setError(err); return }
    onSuccess()
  }

  if (!sent) {
    return (
      <div className="space-y-4">
        <div className="text-center text-lg font-semibold text-white">Recuperar Senha</div>
        <input
          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/10 text-white placeholder-zinc-500 text-sm outline-none focus:border-sasi-red/50 transition"
          type="email" placeholder="Seu e-mail"
          value={email} onChange={e => setEmail(e.target.value)}
        />
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button onClick={handleSend} disabled={loading}
          className="w-full py-3 rounded-lg bg-sasi-red text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          Enviar
        </button>
        <button className="text-xs text-zinc-500 hover:text-zinc-300 transition" onClick={onBack}>
          ← Voltar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center text-lg font-semibold text-white">Redefinir Senha</div>
      <form onSubmit={handleReset} className="space-y-3">
        <div className="relative">
          <input
            className="w-full px-4 py-3 pr-10 rounded-lg bg-white/10 border border-white/10 text-white placeholder-zinc-500 text-sm outline-none focus:border-sasi-red/50 transition"
            type={showPw ? 'text' : 'password'} placeholder="Nova senha"
            value={password} onChange={e => setPassword(e.target.value)}
          />
          <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500" onClick={() => setShowPw(!showPw)}>
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <input
          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/10 text-white placeholder-zinc-500 text-sm outline-none focus:border-sasi-red/50 transition"
          type="password" placeholder="Confirmar nova senha"
          value={confirm} onChange={e => setConfirm(e.target.value)}
        />
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
          Alterar senha
        </button>
      </form>
      <button className="text-xs text-zinc-500 hover:text-zinc-300 transition" onClick={() => setSent(false)}>
        ← Voltar
      </button>
    </div>
  )
}
