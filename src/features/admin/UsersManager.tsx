'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useLang } from '@/contexts/LanguageContext'
import { useToast } from '@/components/ui/Toast'
import { useUsers, useInvites, useCreateInvite, useDeleteInvite, useUpdateRole, useUpdatePassword, useDeleteUser } from '@/hooks/useUsers'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { useShake } from '@/hooks/useShake'
import type { Role, User } from '@/lib/types'
import { Mail, Trash2, Users, Loader2, KeyRound } from 'lucide-react'

const inputClass = 'w-full px-3 py-2 rounded-lg bg-surface border border-border text-foreground text-sm placeholder:text-muted-foreground outline-none focus:border-sasi-red/40 focus:ring-2 focus:ring-sasi-red/10 transition'

const ROLE_BADGE: Record<Role, 'default' | 'success' | 'warning' | 'info' | 'danger' | 'neutral'> = {
  OWNER: 'warning',
  ADMIN: 'danger',
  MANAGER: 'info',
  VIEWER: 'neutral',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function UsersManager() {
  const { user: currentUser } = useAuth()
  const { show } = useToast()
  const { t } = useLang()
  const { shaking, trigger: triggerShake } = useShake()

  const { data: users = [], isLoading } = useUsers()
  const { data: invites = [] } = useInvites()
  const createInviteMutation = useCreateInvite()
  const deleteInviteMutation = useDeleteInvite()
  const updateRoleMutation = useUpdateRole()
  const updatePasswordMutation = useUpdatePassword()
  const deleteUserMutation = useDeleteUser()

  const [inviteEmail, setInviteEmail] = useState('')
  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [newPassword, setNewPassword] = useState('')

  const handleInvite = async () => {
    if (!inviteEmail || !EMAIL_RE.test(inviteEmail)) {
      show(t('userManager.error.invalidEmail'), 'error')
      triggerShake()
      return
    }
    try {
      await createInviteMutation.mutateAsync(inviteEmail)
      show(t('userManager.success.userCreated'), 'success')
      setInviteEmail('')
    } catch {
      show(t('userManager.error.invite'), 'error')
    }
  }

  const handleUpdateRole = async (u: User, role: Role) => {
    try {
      await updateRoleMutation.mutateAsync({ id: u.id, role })
      show(t('userManager.success.roleChanged', { role: t(`userManager.role.${role.toLowerCase()}`) }), 'success')
    } catch {
      show(t('userManager.error.roleChanged'), 'error')
    }
  }

  const handlePasswordChange = async (userId: number) => {
    if (newPassword.length < 8) {
      show(t('userManager.error.passwordReq'), 'error')
      return
    }
    try {
      await updatePasswordMutation.mutateAsync({ id: userId, password: newPassword })
      show(t('userManager.success.passwordChanged'), 'success')
    } catch {
      show(t('userManager.error.passwordChanged'), 'error')
    }
    setEditingUserId(null)
    setNewPassword('')
  }

  const handleDeleteUser = async (u: User) => {
    if (!confirm(t('userManager.action.removeUser', { email: u.email }))) return
    try {
      await deleteUserMutation.mutateAsync(u.id)
      show(t('userManager.success.userRemoved'), 'success')
    } catch {
      show(t('userManager.error.userRemoved'), 'error')
    }
  }

  const handleDeleteInvite = async (id: number) => {
    try {
      await deleteInviteMutation.mutateAsync(id)
      show(t('userManager.success.inviteRemoved'), 'success')
    } catch {
      show(t('userManager.error.inviteRemoved'), 'error')
    }
  }

  const ROLE_OPTIONS: Role[] = ['OWNER', 'ADMIN', 'MANAGER', 'VIEWER']

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
          <Mail size={17} className="text-muted-foreground" />
          {t('userManager.title.invite')}
        </h3>
        <div className={`flex gap-3 ${shaking ? 'animate-shake' : ''}`}>
          <input
            className={inputClass}
            placeholder={t('userManager.placeholder.email')}
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleInvite()}
          />
          <button
            onClick={handleInvite}
            disabled={createInviteMutation.isPending}
            className="px-4 py-2 rounded-lg bg-sasi-red text-white text-sm font-semibold hover:opacity-90 transition whitespace-nowrap shrink-0 flex items-center gap-2 disabled:opacity-50"
          >
            {createInviteMutation.isPending && <Loader2 size={13} className="animate-spin" />}
            {t('userManager.button.invite')}
          </button>
        </div>
        {invites.length > 0 && (
          <div className="mt-3 space-y-1">
            {invites.map(inv => (
              <div key={inv.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface group">
                <span className="text-xs text-muted-foreground">{inv.email}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="warning" size="sm">{t('userManager.status.pending')}</Badge>
                  <button
                    onClick={() => handleDeleteInvite(inv.id)}
                    className="p-1 rounded text-muted-foreground hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition"
                    aria-label="Remover convite"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-base font-bold text-foreground">{t('userManager.title.users')}</h3>
        </div>
        <div className="space-y-2">
          {isLoading && (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 size={18} className="animate-spin mr-2" />
              <span className="text-xs">{t('common.loading')}</span>
            </div>
          )}
          {!isLoading && users.length === 0 && (
            <EmptyState icon={Users} title={t('userManager.empty')} />
          )}
          {users.map(u => {
            const isMe = u.email === currentUser?.email
            return (
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
                      <Badge variant={ROLE_BADGE[u.role]} size="sm">{t(`userManager.role.${u.role.toLowerCase()}`)}</Badge>
                      {isMe && <span className="text-[10px] text-muted-foreground">{t('userManager.you')}</span>}
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
                      <button onClick={() => handlePasswordChange(u.id)} className="text-xs text-emerald-500 hover:underline">{t('common.save')}</button>
                      <button onClick={() => { setEditingUserId(null); setNewPassword('') }} className="text-xs text-muted-foreground hover:underline">{t('common.cancel')}</button>
                    </div>
                  ) : (
                    <>
                      <select
                        value={u.role}
                        onChange={e => handleUpdateRole(u, e.target.value as Role)}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-surface border border-border text-muted-foreground outline-none cursor-pointer hover:border-foreground/30 transition"
                      >
                        {ROLE_OPTIONS.map(r => (
                          <option key={r} value={r}>{t(`userManager.role.${r.toLowerCase()}`)}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => { setEditingUserId(u.id); setNewPassword('') }}
                        className="flex items-center gap-1 text-xs text-yellow-500 hover:underline"
                        aria-label={t('userManager.action.password')}
                      >
                        <KeyRound size={11} />
                      </button>
                      {!isMe && (
                        <button onClick={() => handleDeleteUser(u)} className="text-xs text-muted-foreground hover:text-red-400 transition">
                          {t('common.remove')}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}