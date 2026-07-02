'use client'

import { useState, useEffect } from 'react'
import { User, Invite } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/Toast'
import { localStorageApi } from '@/lib/storage'
import { validatePassword } from '@/lib/utils'
import { X, Plus, Loader2, Mail } from 'lucide-react'

export function UserManager() {
  const { isAdmin } = useAuth()
  const { show } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'user' as 'user' | 'admin' })

  const load = async () => {
    setUsers(await localStorageApi.getUsers())
    setInvites(await localStorageApi.getInvites())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  if (!isAdmin) {
    return <div className="text-center text-zinc-500 py-12">Acesso restrito a administradores</div>
  }

  const handleInvite = async () => {
    if (!inviteEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) {
      show('E-mail inválido', 'error')
      return
    }
    const existing = [...users, ...invites].find(i => i.email === inviteEmail)
    if (existing) { show('E-mail já possui convite ou conta', 'warning'); return }
    const newInvites = [...invites, { email: inviteEmail, invitedAt: new Date().toISOString() }]
    await localStorageApi.saveInvites(newInvites)
    setInvites(newInvites)
    setInviteEmail('')
    show('Convite enviado para ' + inviteEmail, 'success')
  }

  const handleDeleteUser = async (u: User) => {
    if (u.username === 'admin') { show('Não é possível remover o admin principal', 'error'); return }
    if (!confirm(`Remover usuário "${u.email}"?`)) return
    const next = users.filter(x => x.username !== u.username)
    await localStorageApi.saveUsers(next)
    setUsers(next)
    show('Usuário removido', 'success')
  }

  const handlePasswordChange = async (u: User) => {
    if (!validatePassword(newPassword)) { show('Senha não atende aos requisitos', 'error'); return }
    const next = users.map(x => x.username === u.username ? { ...x, password: newPassword } : x)
    await localStorageApi.saveUsers(next)
    setUsers(next)
    setEditingUser(null)
    setNewPassword('')
    show('Senha alterada', 'success')
  }

  const handleAddUser = async () => {
    if (!newUser.email) { show('Digite o e-mail', 'error'); return }
    if (!validatePassword(newUser.password)) { show('Senha não atende aos requisitos', 'error'); return }
    if (users.find(u => u.email === newUser.email)) { show('E-mail já cadastrado', 'error'); return }
    const u: User = { username: newUser.email.split('@')[0], password: newUser.password, email: newUser.email, role: newUser.role }
    const next = [...users, u]
    await localStorageApi.saveUsers(next)
    setUsers(next)
    setShowAdd(false)
    setNewUser({ email: '', password: '', role: 'user' })
    show('Usuário criado', 'success')
  }

  const inputClass = 'w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm outline-none focus:border-zinc-500 transition'
  const labelClass = 'block text-xs text-zinc-500 mb-1'

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Invite Section */}
      <div className="bg-surface border border-zinc-800 rounded-xl p-5">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Mail size={18} className="text-zinc-400" />
          Convidar Usuário
        </h3>
        <div className="flex gap-3">
          <input
            className={inputClass}
            placeholder="E-mail do usuário"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleInvite()}
          />
          <button onClick={handleInvite} className="px-4 py-2 rounded-lg bg-sasi-red text-white text-sm font-semibold hover:opacity-90 transition whitespace-nowrap">
            Convidar
          </button>
        </div>
        {invites.length > 0 && (
          <div className="mt-3 space-y-1">
            {invites.map((inv, i) => (
              <div key={i} className="flex items-center justify-between text-xs text-zinc-500 py-1">
                <span>{inv.email}</span>
                <span className="text-[10px] text-zinc-600">Pendente</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add User Section */}
      <div className="bg-surface border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">Usuários</h3>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition"
          >
            <Plus size={14} />
            Novo
          </button>
        </div>

        {showAdd && (
          <div className="mb-4 p-4 bg-zinc-800/40 rounded-xl border border-zinc-700/50 space-y-3">
            <input className={inputClass} placeholder="E-mail" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
            <input className={inputClass} type="password" placeholder="Senha" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
            <select className={inputClass} value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value as 'user' | 'admin' })}>
              <option value="user">Usuário</option>
              <option value="admin">Admin</option>
            </select>
            <div className="flex gap-2">
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
            <div key={u.username} className="flex items-center justify-between px-4 py-3 rounded-lg bg-zinc-800/30 border border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-white">
                  {u.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm text-white">{u.email}</div>
                  <div className="text-[10px] text-zinc-500">
                    {u.role === 'admin' ? 'Administrador' : 'Usuário'} {u.username === 'admin' && '· Principal'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {editingUser?.username === u.username ? (
                  <div className="flex items-center gap-2">
                    <input
                      className="w-32 px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-white text-xs outline-none"
                      type="password"
                      placeholder="Nova senha"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handlePasswordChange(u)}
                    />
                    <button onClick={() => handlePasswordChange(u)} className="text-xs text-emerald-400 hover:underline">Salvar</button>
                    <button onClick={() => { setEditingUser(null); setNewPassword('') }} className="text-xs text-zinc-500 hover:underline">Cancelar</button>
                  </div>
                ) : (
                  <>
                    <button onClick={() => setEditingUser(u)} className="text-xs text-yellow-400 hover:underline">Alterar senha</button>
                    <button onClick={() => handleDeleteUser(u)} className="text-xs text-red-400 hover:underline">Remover</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
