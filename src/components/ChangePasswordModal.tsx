'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useLang } from '@/contexts/LanguageContext'
import { useToast } from '@/components/Toast'
import { validatePassword } from '@/lib/utils'
import { backendApi } from '@/lib/backend-api'
import { X, Eye, EyeOff, Loader2 } from 'lucide-react'

interface Props {
  onClose: () => void
}

export function ChangePasswordModal({ onClose }: Props) {
  const { user } = useAuth()
  const { t } = useLang()
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
    if (!current) { setError(t('changePassword.error.current')); return }
    if (!pwOk) { setError(t('changePassword.error.password')); return }
    if (newPw !== confirm) { setError(t('changePassword.error.match')); return }

    setLoading(true)
    try {
      await backendApi.changePassword(current, newPw)
      setLoading(false)
      show(t('changePassword.success'), 'success')
      onClose()
    } catch (e: any) {
      setError(e.message)
      setLoading(false)
    }
  }

  const inputClass = 'w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm outline-none focus:border-zinc-500 transition'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-sm bg-zinc-900 border border-border rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-base font-semibold text-white">{t('changePassword.title')}</h3>
          <button onClick={onClose} className="p-1 text-zinc-500 hover:text-white transition">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <input className={inputClass} type={showPw ? 'text' : 'password'} placeholder={t('common.currentPassword')} value={current} onChange={e => setCurrent(e.target.value)} />
          <div className="relative">
            <input className={`${inputClass} pr-10`} type={showPw ? 'text' : 'password'} placeholder={t('common.newPassword')} value={newPw} onChange={e => setNewPw(e.target.value)} />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500" onClick={() => setShowPw(!showPw)}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <input className={inputClass} type="password" placeholder={t('common.confirmPassword')} value={confirm} onChange={e => setConfirm(e.target.value)} />
          <div className="space-y-1 text-xs">
            <div className={`${newPw.length >= 8 ? 'text-emerald-400' : 'text-zinc-500'}`}>✓ {t('changePassword.requirement.length')}</div>
            <div className={`${/[a-zA-Z]/.test(newPw) ? 'text-emerald-400' : 'text-zinc-500'}`}>✓ {t('changePassword.requirement.letter')}</div>
            <div className={`${/[!@#$%^&*()_+\-=\[\]{}|;':",.\/<>\?`~]/.test(newPw) ? 'text-emerald-400' : 'text-zinc-500'}`}>✓ {t('changePassword.requirement.special')}</div>
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-border">
          <button onClick={onClose} className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition">{t('common.cancel')}</button>
          <button onClick={handleSave} disabled={loading}
            className="px-5 py-2 rounded-lg bg-sasi-red text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition flex items-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  )
}
