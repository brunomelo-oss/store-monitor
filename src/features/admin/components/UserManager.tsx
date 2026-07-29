'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useLang } from '@/contexts/LanguageContext'
import { useToast } from '@/components/Toast'
import { usersService } from '@/services/users.service'
import { validatePassword } from '@/lib/utils'
import { Mail, Trash2, Users, Loader2 } from 'lucide-react'
import { EmailPreviewModal } from '@/components/EmailPreviewModal'

interface UserRow {
  id: number
  username: string
  email: string
  role: string
  createdAt?: string
}

interface InviteRow {
  id?: number
  email: string
  createdAt?: string
}

const inputClass = 'w-full px-3 py-2 rounded-lg bg-surface border border-border text-foreground text-sm placeholder:text-muted-foreground outline-none focus:border-foreground/30 transition'

export function UserManager() {
  const { user: currentUser } = useAuth()
  const { show } = useToast()
  const { t } = useLang()

  const [users, setUsers] = useState<UserRow[]>([])
  const [invites, setInvites] = useState<InviteRow[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [previewEmail, setPreviewEmail] = useState('')
  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [shake, setShake] = useState(false)

  useEffect(() => {
    let cancel = false
    ;(async () => {
      try {
        const [u, i] = await Promise.all([
          usersService.list().catch(() => [] as UserRow[]),
          usersService.getInvites().catch(() => [] as InviteRow[]),
        ])
        if (!cancel) {
          setUsers(u ?? [])
          setInvites(i ?? [])
        }
      } catch {}
      if (!cancel) setLoading(false)
    })()
    return () => { cancel = true }
  }, [])

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 400)
  }

  const handleInvite = async () => {
    if (!inviteEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+/.test(inviteEmail)) {
      show(t('userManager.error.invalidEmail'), 'error')
      triggerShake()
      return
    }
    try {
      const invite = await usersService.createInvite(inviteEmail)
      setInvites(prev => [...prev, invite])
    } catch {
      setInvites(prev => [...prev, { id: Date.now(), email: inviteEmail, createdAt: new Date().toISOString() }])
    }
    setPreviewEmail(inviteEmail)
    setInviteEmail('')
  }

  const handleDeleteInvite = async (id: number | undefined) => {
    if (!id) return
    try {
      await usersService.deleteInvite(id)
    } catch {}
    setInvites(prev => prev.filter(i => i.id !== id))
    show(t('userManager.success.inviteRemoved'), 'success')
  }

  const handleUpdateRole = async (userId: number, newRole: string) => {
    try {
      await usersService.updateRole(userId, newRole)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
      show(t('userManager.success.roleChanged', { role: t(`userManager.role.${newRole.toLowerCase()}`) }), 'success')
    } catch {
      show(t('common.error'), 'error')
    }
  }

  const handlePasswordChange = async (userId: number) => {
    if (!validatePassword(newPassword)) {
      show(t('userManager.error.passwordReq'), 'error')
      return
    }
    try {
      await usersService.updatePassword(userId, newPassword)
      show(t('userManager.success.passwordChanged'), 'success')
    } catch {
      show(t('common.error'), 'error')
    }
    setEditingUserId(null)
    setNewPassword('')
  }

  const handleDeleteUser = async (id: number, email: string) => {
    if (!confirm(t('userManager.action.removeUser', { email }))) return
    try {
      await usersService.delete(id)
    } catch {}
    setUsers(prev => prev.filter(u => u.id !== id))
    show(t('userManager.success.userRemoved'), 'success')
  }

  const roleBadge = (role: string) => {
    const r = role.toUpperCase()
    const colors: Record<string, string> = {
      OWNER: 'bg-amber-500/10 text-amber-400',
      ADMIN: 'bg-sasi-red/10 text-red-500 dark:text-red-400',
      MANAGER: 'bg-blue-500/10 text-blue-400',
      VIEWER: 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400',
    }
    const labels: Record<string, string> = {
      OWNER: t('userManager.role.owner'),
      ADMIN: t('userManager.role.admin'),
      MANAGER: t('userManager.role.manager'),
      VIEWER: t('userManager.role.viewer'),
    }
    return { color: colors[r] || colors.VIEWER, label: labels[r] || r }
  }

  const ROLE_OPTIONS = ['OWNER', 'ADMIN', 'MANAGER', 'VIEWER'] as const

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      {/* Invite */}
      <div className="bg-card border border-border rounded-2xl p-6 card-glass shadow-sm">
        <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
          <Mail size={17} className="text-muted-foreground" />
          {t('userManager.title.invite')}
        </h3>
        <div className={`flex gap-3 ${shake ? 'animate-shake' : ''}`}>
          <input
            className={inputClass}
            placeholder={t('userManager.placeholder.email')}
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleInvite()}
          />
          <button
            onClick={handleInvite}
            className="px-4 py-2 rounded-lg bg-sasi-red text-white text-sm font-semibold hover:opacity-90 transition whitespace-nowrap shrink-0"
          >
            {t('userManager.button.invite')}
          </button>
        </div>
        {invites.length > 0 && (
          <div className="mt-3 space-y-1">
            {invites.map(inv => (
              <div key={inv.id || inv.email} className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface group">
                <span className="text-xs text-muted-foreground">{inv.email}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400">
                    {t('userManager.status.pending')}
                  </span>
                  <button
                    onClick={() => handleDeleteInvite(inv.id)}
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

      {/* Users */}
      <div className="bg-card border border-border rounded-2xl p-6 card-glass shadow-sm">
        <div className="mb-4">
          <h3 className="text-base font-bold text-foreground">{t('userManager.title.users')}</h3>
        </div>
        <div className="space-y-2">
          {loading && (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 size={18} className="animate-spin mr-2" />
              <span className="text-xs">{t('common.loading')}</span>
            </div>
          )}
          {!loading && users.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users size={36} className="text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">{t('userManager.empty')}</p>
            </div>
          )}
          {users.map(u => (
            <div key={u.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface hover:bg-inset border border-border transition-all duration-200">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm ${
                  u.role === 'OWNER' ? 'bg-gradient-to-br from-amber-500 to-yellow-600' :
                  u.role === 'ADMIN' ? 'bg-gradient-to-br from-sasi-red to-red-500' :
                  u.role === 'MANAGER' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                  'bg-zinc-500'
                }`}>
                  {(u.email || u.username || '?').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{u.email || u.username}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${roleBadge(u.role).color}`}>
                      {roleBadge(u.role).label}
                    </span>
                    {(currentUser?.email && u.email === currentUser.email) && (
                      <span className="text-[10px] text-muted-foreground">{t('userManager.you')}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {editingUserId === u.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      className="w-28 px-2 py-1 rounded bg-surface border border-border text-foreground text-xs outline-none focus:border-foreground/30"
                      type="password"
                      autoComplete="new-password"
                      placeholder={t('common.newPassword')}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handlePasswordChange(u.id)}
                    />
                    <button onClick={() => handlePasswordChange(u.id)} className="text-xs text-emerald-500 hover:underline">
                      {t('common.save')}
                    </button>
                    <button onClick={() => { setEditingUserId(null); setNewPassword('') }} className="text-xs text-muted-foreground hover:underline">
                      {t('common.cancel')}
                    </button>
                  </div>
                ) : (
                  <>
                    <select
                      value={u.role}
                      onChange={e => handleUpdateRole(u.id, e.target.value)}
                      className="px-1.5 py-0.5 rounded text-[10px] bg-surface border border-border text-muted-foreground outline-none cursor-pointer hover:border-foreground/30 transition"
                    >
                      {ROLE_OPTIONS.map(r => (
                        <option key={r} value={r}>{t(`userManager.role.${r.toLowerCase()}`)}</option>
                      ))}
                    </select>
                    <button onClick={() => setEditingUserId(u.id)} className="text-xs text-yellow-500 hover:underline">
                      {t('userManager.action.password')}
                    </button>
                    {u.email !== currentUser?.email && (
                      <button onClick={() => handleDeleteUser(u.id, u.email)} className="text-xs text-muted-foreground hover:text-red-400 transition">
                        {t('common.remove')}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {previewEmail && <EmailPreviewModal email={previewEmail} onClose={() => setPreviewEmail('')} />}
    </div>
  )
}
