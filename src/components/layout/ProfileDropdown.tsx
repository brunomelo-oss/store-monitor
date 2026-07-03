'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { ChangePasswordModal } from '@/components/ChangePasswordModal'
import { UserManager } from '@/components/admin/UserManager'
import { LogOut, Users, Lock, ChevronDown } from 'lucide-react'

export function ProfileDropdown() {
  const { user, logout, isAdmin } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showUserManager, setShowUserManager] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  if (!user) return null

  const initial = user.email.charAt(0).toUpperCase()
  const [local, domain] = user.email.split('@')
  const display = local.length > 14 ? local.slice(0, 12) + '…@' + domain : user.email

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-card text-foreground text-sm hover:shadow-sm transition-all duration-200"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sasi-red to-red-500 flex items-center justify-center text-xs font-bold shadow-sm">
          {initial}
        </div>
        <span className="hidden sm:inline text-xs text-zinc-400">{display}</span>
        <ChevronDown size={12} className={`text-zinc-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-4 py-2.5 text-xs text-muted-foreground border-b border-border/50">{user.email}</div>

          {isAdmin && (
            <button
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition"
              onClick={() => { setOpen(false); setShowUserManager(true) }}
            >
              <Users size={15} className="text-muted-foreground" />
              Gerenciar usuários
            </button>
          )}

          <button
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800/50 transition"
            onClick={() => { setOpen(false); setShowPasswordModal(true) }}
          >
            <Lock size={15} className="text-muted-foreground" />
            Alterar senha
          </button>

          <div className="h-px bg-border mx-3 my-1" />

          <button
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
            onClick={() => { setOpen(false); logout(); router.push('/login') }}
          >
            <LogOut size={15} />
            Sair
          </button>
        </div>
      )}

      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}

      {showUserManager && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-10 bg-black/60 overflow-y-auto animate-in fade-in duration-150" onClick={e => { if (e.target === e.currentTarget) setShowUserManager(false) }}>
          <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl p-6 m-4 animate-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-foreground">Gerenciar Usuários</h3>
              <button onClick={() => setShowUserManager(false)} className="text-sm text-muted-foreground hover:text-foreground transition">Fechar</button>
            </div>
            <UserManager />
          </div>
        </div>
      )}
    </div>
  )
}
