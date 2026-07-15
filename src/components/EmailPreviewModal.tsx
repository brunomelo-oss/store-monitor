'use client'

import { X, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { useLang } from '@/contexts/LanguageContext'

interface Props {
  email: string
  onClose: () => void
}

export function EmailPreviewModal({ email, onClose }: Props) {
  const { t } = useLang()
  const [copied, setCopied] = useState(false)

  const subject = t('emailPreview.subjectText')
  const body = t('emailPreview.body', {
    email,
    appName: 'SASI - Comunicação Ágil - Store Monitor',
    teamName: 'SASI - Comunicação Ágil'
  })

  const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

  const copyBody = () => {
    navigator.clipboard.writeText(`Assunto: ${subject}\n\n${body}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-lg bg-card dark:bg-zinc-900 border border-border rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-base font-semibold text-foreground dark:text-white">{t('emailPreview.title')}</h3>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground dark:hover:text-white transition">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-surface dark:bg-zinc-800/40 rounded-xl p-4 border border-border dark:border-zinc-700/50 space-y-3 text-sm">
            <div>
              <span className="text-xs text-muted-foreground">{t('emailPreview.to')}</span>
              <span className="text-foreground dark:text-white">{email}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">{t('emailPreview.subject')}</span>
              <span className="text-foreground dark:text-white font-medium">{subject}</span>
            </div>
            <div className="h-px bg-border dark:bg-zinc-700/50" />
            <div className="text-secondary dark:text-zinc-300 whitespace-pre-line leading-relaxed">{body}</div>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            {t('emailPreview.disclaimer')}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <a
            href={mailto}
            className="px-4 py-2 rounded-lg bg-sasi-blue/20 text-blue-400 text-sm font-medium hover:bg-sasi-blue/30 transition"
          >
            {t('emailPreview.openEmail')}
          </a>
          <button
            onClick={copyBody}
            className="px-4 py-2 rounded-lg bg-surface dark:bg-zinc-800 text-secondary dark:text-zinc-300 text-sm font-medium hover:bg-inset dark:hover:bg-zinc-700 transition flex items-center gap-2"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? t('common.copied') : t('common.copy')}
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-sasi-red text-white text-sm font-semibold hover:opacity-90 transition">
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  )
}
