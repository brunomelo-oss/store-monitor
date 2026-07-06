'use client'

import { useState, useEffect } from 'react'
import { Invite } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/Toast'
import { backendApi } from '@/lib/backend-api'
import { validatePassword } from '@/lib/utils'
import { X, Plus, Mail, Trash2, Shield, ShieldOff, UserPlus, Loader2 } from 'lucide-react'
import { EmailPreviewModal } from '@/components/EmailPreviewModal'

const inputClass = 'w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm placeholder-zinc-500 outline-none focus:border-zinc-500 transition'

export function UserManager() {
  const { isAdmin, user: currentUser } = useAuth()
  const { show } = useToast()
  const [users, setUsers] = useState<{ id: number; username: string; email: string; role: string; createdAt?: string }[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'user' as 'user' | 'admin' })
  const [previewEmail, setPreviewEmail] = useState('')
  const [shaking, setShaking] = useState(false)
  const [shakingAdd, setShakingAdd] = useState(false)

  const triggerShake = (setter: (v: boolean) => void) => {
    setter(true)
    setTimeout(() => setter(false), 500)
  }

  const load = async () => {
    try {
      const [u, i] = await Promise.all([backendApi.getUsers(), backendApi.getInvites()])
      setUsers(u); setInvites(i)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  if (!isAdmin) {
    return <div className="text-center text-muted-foreground py-12">Acesso restrito a administradores</div>
  }

  const handleInvite = async () => {
    if (!inviteEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) {
      show('E-mail inválido', 'error'); triggerShake(setShaking); return
    }
    try {
      const invite = await backendApi.createInvite(inviteEmail)
      setInvites(prev => [...prev, invite])
      setPreviewEmail(inviteEmail)
      setInviteEmail('')
    } catch (e) {
      show(e instanceof Error ? e.message : 'Erro ao convidar', 'error')
    }
  }

  const handleDeleteInvite = async (id: number) => {
    try {
      await backendApi.deleteInvite(id)
      setInvites(prev => prev.filter(i => i.id !== id))
      show('Convite removido', 'success')
    } catch (e) {
      show(e instanceof Error ? e.message : 'Erro ao remover convite', 'error')
    }
  }

  const handleDeleteUser = async (id: number, email: string) => {
    if (!confirm(`Remover usuário "${email}"?`)) return
    try {
      await backendApi.deleteUser(id)
      setUsers(prev => prev.filter(u => u.id !== id))
      show('Usuário removido', 'success')
    } catch (e) {
      show(e instanceof Error ? e.message : 'Erro ao remover usuário', 'error')
    }
  }

  const handleToggleRole = async (u: { id: number; role: string; email?: string }) => {
    const newRole = u.role === 'admin' ? 'user' : 'admin'
    try {
      const updated = await backendApi.updateUserRole(u.id, newRole)
      setUsers(prev => prev.map(x => x.id === u.id ? updated : x))
      show(`Agora é ${newRole === 'admin' ? 'Administrador' : 'Usuário'}`, 'success')
    } catch (e) {
      show(e instanceof Error ? e.message : 'Erro ao alterar papel', 'error')
    }
  }

  const handlePasswordChange = async (userId: number) => {
    if (!validatePassword(newPassword)) { show('Senha não atende aos requisitos', 'error'); return }
    try {
      await backendApi.updateUserPassword(userId, newPassword)
      setEditingUserId(null); setNewPassword('')
      show('Senha alterada', 'success')
    } catch (e) {
      show(e instanceof Error ? e.message : 'Erro ao alterar senha', 'error')
    }
  }

  const handleAddUser = async () => {
    if (!newUser.email) { show('Digite o e-mail', 'error'); triggerShake(setShakingAdd); return }
    if (!validatePassword(newUser.password)) { show('Senha não atende aos requisitos', 'error'); triggerShake(setShakingAdd); return }
    try {
      const u = await backendApi.createUser(newUser.email, newUser.password, newUser.role)
      setUsers(prev => [...prev, u])
      setShowAdd(false)
      setNewUser({ email: '', password: '', role: 'user' })
      show('Usuário criado', 'success')
    } catch (e) {
      show(e instanceof Error ? e.message : 'Erro ao criar usuário', 'error')
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Convite Section */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
          <Mail size={17} className="text-muted-foreground" />
          Convidar Usuário
        </h3>
        <div className={`flex gap-3 ${shaking ? 'animate-shake' : ''}`}>
          <input
            className={inputClass}
            placeholder="E-mail do usuário"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleInvite()}
          />
          <button onClick={handleInvite} className="px-4 py-2 rounded-lg bg-sasi-red text-white text-sm font-semibold hover:opacity-90 transition whitespace-nowrap shrink-0">
            Convidar
          </button>
        </div>
        {invites.length > 0 && (
          <div className="mt-3 space-y-1">
            {invites.map(inv => (
              <div key={inv.id || inv.email} className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface group">
                <span className="text-xs text-muted-foreground">{inv.email}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400">Pendente</span>
                  <button
                    onClick={() => inv.id && handleDeleteInvite(inv.id)}
                    className="p-1 rounded text-muted-foreground hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Usuários Section */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-foreground">Usuários</h3>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition"
          >
            <Plus size={14} />
            Novo
          </button>
        </div>

        {showAdd && (
          <div className={`mb-4 p-4 bg-zinc-800/40 rounded-xl border border-zinc-700/50 space-y-3 ${shakingAdd ? 'animate-shake' : ''}`}>
            <div className="flex items-center gap-2 mb-1">
              <UserPlus size={14} className="text-zinc-500" />
              <span className="text-xs text-zinc-500">Novo Usuário</span>
            </div>
            <input className={inputClass} placeholder="E-mail" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
            <input className={inputClass} type="password" placeholder="Senha" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
            <select className={inputClass} value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value as 'user' | 'admin' })}>
              <option value="user">Usuário</option>
              <option value="admin">Admin</option>
            </select>
            <div className="flex gap-2 pt-1">
              <button onClick={handleAddUser} className="px-4 py-2 rounded-lg bg-sasi-red text-white text-sm font-semibold hover:opacity-90 transition">
                Criar
              </button>
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition">
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {users.map(u => (
            <div key={u.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface hover:bg-zinc-200/50 dark:hover:bg-white/[0.03] border border-border hover:border-border transition-all duration-200">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm ${
                  u.role === 'admin' ? 'bg-gradient-to-br from-sasi-red to-red-500' : 'bg-zinc-500'
                }`}>
                  {u.email.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{u.email}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      u.role === 'admin' ? 'bg-sasi-red/10 text-red-500 dark:text-red-400' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
                    }`}>
                      {u.role === 'admin' ? 'Administrador' : 'Usuário'}
                    </span>
                    {u.email === currentUser?.email && (
                      <span className="text-[10px] text-muted-foreground">(você)</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {editingUserId === u.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      className="w-28 px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-white text-xs outline-none focus:border-zinc-500"
                      type="password" placeholder="Nova senha"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handlePasswordChange(u.id)}
                    />
                    <button onClick={() => handlePasswordChange(u.id)} className="text-xs text-emerald-500 hover:underline">Salvar</button>
                    <button onClick={() => { setEditingUserId(null); setNewPassword('') }} className="text-xs text-muted-foreground hover:underline">Cancelar</button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => handleToggleRole(u)}
                      className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:text-yellow-500 hover:bg-yellow-500/10 transition"
                      title={u.role === 'admin' ? 'Rebaixar para usuário' : 'Promover para admin'}
                    >
                      {u.role === 'admin' ? <ShieldOff size={12} /> : <Shield size={12} />}
                    </button>
                    <button onClick={() => setEditingUserId(u.id)} className="text-xs text-yellow-500 hover:underline">Senha</button>
                    {u.email !== currentUser?.email && (
                      <button onClick={() => handleDeleteUser(u.id, u.email)} className="text-xs text-muted-foreground hover:text-red-400 transition">Remover</button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 size={18} className="animate-spin mr-2" />
            <span className="text-xs">Carregando...</span>
          </div>
        )}
      </div>

      {previewEmail && <EmailPreviewModal email={previewEmail} onClose={() => setPreviewEmail('')} />}
    </div>
  )
}
