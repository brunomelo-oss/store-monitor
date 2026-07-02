'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/Toast'
import { validatePassword } from '@/lib/utils'
import { localStorageApi } from '@/lib/storage'
import { X, Eye, EyeOff, Loader2 } from 'lucide-react'

interface Props {
  onClose: () => void
}

export function ChangePasswordModal({ onClose }: Props) {
  const { user } = useAuth()
  const { show } = useToast()
  const [current, setCurrent] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const pwOk = validatePassword(newPw)

  const handleSave = async () => {
    setError('')
    if (!current) { setError('Digite a senha atual'); return }
    if (!pwOk) { setError('Nova senha não atende aos requisitos'); return }
    if (newPw !== confirm) { setError('Senhas não conferem'); return }

    setLoading(true)
    const users = await localStorageApi.getUsers()
    const u = users.find(x => x.username === user?.username)
    if (!u) { setError('Usuário não encontrado'); setLoading(false); return }
    if (u.password !== current) { setError('Senha atual incorreta'); setLoading(false); return }
    u.password = newPw
    await localStorageApi.saveUsers(users)
    setLoading(false)
    show('Senha alterada com sucesso', 'success')
    onClose()
  }

  const inputClass = 'w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm outline-none focus:border-zinc-500 transition'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h3 className="text-base font-semibold text-white">Alterar Senha</h3>
          <button onClick={onClose} className="p-1 text-zinc-500 hover:text-white transition">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <input className={inputClass} type={showPw ? 'text' : 'password'} placeholder="Senha atual" value={current} onChange={e => setCurrent(e.target.value)} />
          <div className="relative">
            <input className={`${inputClass} pr-10`} type={showPw ? 'text' : 'password'} placeholder="Nova senha" value={newPw} onChange={e => setNewPw(e.target.value)} />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500" onClick={() => setShowPw(!showPw)}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <input className={inputClass} type="password" placeholder="Confirmar nova senha" value={confirm} onChange={e => setConfirm(e.target.value)} />
          <div className="space-y-1 text-xs">
            <div className={`${newPw.length >= 8 ? 'text-emerald-400' : 'text-zinc-500'}`}>✓ Mínimo 8 caracteres</div>
            <div className={`${/[a-zA-Z]/.test(newPw) ? 'text-emerald-400' : 'text-zinc-500'}`}>✓ Pelo menos 1 letra</div>
            <div className={`${/[!@#$%^&*()_+\-=\[\]{}|;':",.\/<>\?`~]/.test(newPw) ? 'text-emerald-400' : 'text-zinc-500'}`}>✓ Pelo menos 1 caractere especial</div>
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-zinc-800">
          <button onClick={onClose} className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition">Cancelar</button>
          <button onClick={handleSave} disabled={loading}
            className="px-5 py-2 rounded-lg bg-sasi-red text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition flex items-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}
