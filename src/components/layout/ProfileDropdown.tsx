'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { ChangePasswordModal } from '@/components/ChangePasswordModal'
import { UserManager } from '@/components/admin/UserManager'
import { LogOut, Users, Lock } from 'lucide-react'

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
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.08] border border-white/[0.12] text-white text-sm hover:bg-white/[0.12] transition"
      >
        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
          {initial}
        </div>
        <span className="hidden sm:inline text-xs opacity-80">{display}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-2 z-50">
          <div className="px-4 py-2 text-xs text-zinc-400 border-b border-zinc-800">{user.email}</div>
          {isAdmin && (
            <>
              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 transition"
                onClick={() => { setOpen(false); setShowUserManager(true) }}
              >
                <Users size={16} />
                Gerenciar usuários
              </button>
              <div className="h-px bg-zinc-800 mx-3" />
            </>
          )}
          <button
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 transition"
            onClick={() => { setOpen(false); setShowPasswordModal(true) }}
          >
            <Lock size={16} />
            Alterar senha
          </button>
          <div className="h-px bg-zinc-800 mx-3" />
          <button
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 transition"
            onClick={() => { setOpen(false); logout(); router.push('/login') }}
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      )}

      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}

      {showUserManager && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-10 bg-black/60 overflow-y-auto" onClick={e => { if (e.target === e.currentTarget) setShowUserManager(false) }}>
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 m-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white">Gerenciar Usuários</h3>
              <button onClick={() => setShowUserManager(false)} className="text-sm text-zinc-400 hover:text-white transition">Fechar</button>
            </div>
            <UserManager />
          </div>
        </div>
      )}
    </div>
  )
}
