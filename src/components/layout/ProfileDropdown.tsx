'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useLang } from '@/contexts/LanguageContext'
import { useToast } from '@/components/ui/Toast'
import { useModal } from '@/contexts/ModalContext'
import { LogOut, ChevronDown, User, Lock, Eye, EyeOff } from 'lucide-react'
import { Input, Button } from '@/components/ui/primitives'

function ChangePasswordForm() {
  const { doResetPassword } = useAuth()
  const { t } = useLang()
  const toast = useToast()
  const { close } = useModal()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const pwOk = next.length >= 8 && /[a-zA-Z]/.test(next) && /[^A-Za-z0-9]/.test(next)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!current) { setError(t('profile.currentPasswordRequired')); return }
    if (!pwOk) { setError(t('reset.error.password')); return }
    if (next !== confirm) { setError(t('reset.error.match')); return }
    setLoading(true)
    const err = await doResetPassword('', next)
    setLoading(false)
    if (err) { setError(err); return }
    toast.show(t('profile.passwordChanged'), 'success')
    close()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <Input type={show ? 'text' : 'password'} placeholder={t('profile.currentPassword')} value={current} onChange={e => setCurrent(e.target.value)} />
        <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Mostrar senha">
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      <Input type="password" placeholder={t('invite.password')} value={next} onChange={e => setNext(e.target.value)} autoComplete="new-password" />
      <Input type="password" placeholder={t('invite.confirmPassword')} value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <Button type="submit" disabled={loading || !pwOk} className="w-full">
        {t('profile.changePassword')}
      </Button>
    </form>
  )
}

export function ProfileDropdown() {
  const { user, logout } = useAuth()
  const { t } = useLang()
  const { open } = useModal()
  const [openDropdown, setOpenDropdown] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpenDropdown(false)
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  if (!user) return null

  const [local, domain] = user.email.split('@')
  const display = local.length > 14 ? local.slice(0, 12) + '…@' + domain : user.email

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpenDropdown(!openDropdown)} className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl border border-border bg-inset/50 hover:bg-inset transition-all duration-200">
        <div className="w-7 h-7 rounded-full bg-transparent flex items-center justify-center text-muted-foreground shrink-0">
          <User size={15} />
        </div>
        <span className="hidden sm:inline text-xs text-muted-foreground">{display}</span>
        <ChevronDown size={10} className={`text-muted-foreground transition-transform duration-200 ${openDropdown ? 'rotate-180' : ''}`} />
      </button>

      {openDropdown && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-xl py-1.5 z-50 animate-dropdownIn">
          <div className="px-4 py-2.5 text-xs text-muted-foreground border-b border-border mb-1">{user.email}</div>
          <button
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-inset transition"
            onClick={() => { setOpenDropdown(false); open({ title: t('profile.changePassword'), content: <ChangePasswordForm /> }) }}
          >
            <Lock size={15} className="text-muted-foreground" />
            {t('profile.changePassword')}
          </button>
          <div className="h-px bg-border mx-3 my-1" />
          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition" onClick={() => { setOpenDropdown(false); logout() }}>
            <LogOut size={15} />
            {t('profile.logout')}
          </button>
        </div>
      )}
    </div>
  )
}