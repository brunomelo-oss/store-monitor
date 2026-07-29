'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useLang } from '@/contexts/LanguageContext'
import { ChangePasswordModal } from '@/components/ChangePasswordModal'
import { LogOut, Lock, ChevronDown, User } from 'lucide-react'

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

  const [local, domain] = user.email.split('@')
  const display = local.length > 14 ? local.slice(0, 12) + '…@' + domain : user.email

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl border border-border bg-inset/50 hover:bg-inset transition-all duration-200"
      >
        <div className="w-7 h-7 rounded-full bg-transparent flex items-center justify-center text-muted-foreground shrink-0">
          <User size={15} />
        </div>
        <span className="hidden sm:inline text-xs text-muted-foreground">{display}</span>
        <ChevronDown size={10} className={`text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-xl py-1.5 z-50">
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
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition"
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
