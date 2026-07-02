'use client'

import { X, Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface Props {
  email: string
  onClose: () => void
}

export function EmailPreviewModal({ email, onClose }: Props) {
  const [copied, setCopied] = useState(false)

  const subject = 'Convite - SASI Store Monitor'
  const body = `Olá,

Você foi convidado(a) para acessar o SASI Store Monitor.

Para configurar sua conta, siga os passos abaixo:

1. Acesse o sistema
2. Digite seu e-mail: ${email}
3. Clique em "Configurar conta" na mensagem que aparecerá
4. Defina sua senha

Atenciosamente,
Equipe SASI`

  const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

  const copyBody = () => {
    navigator.clipboard.writeText(`Assunto: ${subject}\n\n${body}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h3 className="text-base font-semibold text-white">Preview do E-mail</h3>
          <button onClick={onClose} className="p-1 text-zinc-500 hover:text-white transition">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-zinc-800/40 rounded-xl p-4 border border-zinc-700/50 space-y-3 text-sm">
            <div>
              <span className="text-xs text-zinc-500">Para: </span>
              <span className="text-white">{email}</span>
            </div>
            <div>
              <span className="text-xs text-zinc-500">Assunto: </span>
              <span className="text-white font-medium">{subject}</span>
            </div>
            <div className="h-px bg-zinc-700/50" />
            <div className="text-zinc-300 whitespace-pre-line leading-relaxed">{body}</div>
          </div>

          <div className="text-xs text-zinc-500 text-center">
            Nenhum e-mail real é enviado. O convite é processado internamente.
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-800">
          <a
            href={mailto}
            className="px-4 py-2 rounded-lg bg-sasi-blue/20 text-blue-400 text-sm font-medium hover:bg-sasi-blue/30 transition"
          >
            Abrir no e-mail
          </a>
          <button
            onClick={copyBody}
            className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-sm font-medium hover:bg-zinc-700 transition flex items-center gap-2"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-sasi-red text-white text-sm font-semibold hover:opacity-90 transition">
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
