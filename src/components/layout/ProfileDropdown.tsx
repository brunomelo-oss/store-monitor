'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { ChangePasswordModal } from '@/components/ChangePasswordModal'
import { LogOut, Lock, ChevronDown } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'

export function ProfileDropdown() {
  const { user, logout } = useAuth()
  const { t } = useLang()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
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
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-700 to-emerald-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
          {initial}
        </div>
        <span className="hidden sm:inline text-xs text-zinc-400">{display}</span>
        <ChevronDown size={12} className={`text-zinc-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-4 py-2.5 text-xs text-muted-foreground border-b border-border mb-1">{user.email}</div>

          <button
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-inset transition"
            onClick={() => { setOpen(false); setShowPasswordModal(true) }}
          >
            <Lock size={15} className="text-muted-foreground" />
            {t('profile.changePassword')}
          </button>

          <div className="h-px bg-border mx-3 my-1" />

          <button
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
            onClick={() => { setOpen(false); logout(); router.push('/login') }}
          >
            <LogOut size={15} />
            {t('profile.logout')}
          </button>
        </div>
      )}

      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
    </div>
  )
}
