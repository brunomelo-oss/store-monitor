'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect, useState } from 'react'

const I18N: Record<string, { title: string; message: string; retry: string }> = {
  pt: { title: 'Algo deu errado', message: 'Ocorreu um erro inesperado. Tente recarregar a página.', retry: 'Tentar novamente' },
  en: { title: 'Something went wrong', message: 'An unexpected error occurred. Try reloading the page.', retry: 'Try again' },
  ar: { title: 'حدث خطأ ما', message: 'حدث خطأ غير متوقع. حاول إعادة تحميل الصفحة.', retry: 'حاول مرة أخرى' },
}

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [lang, setLang] = useState('pt')

  useEffect(() => {
    Sentry.captureException(error)
    const saved = localStorage.getItem('sasi_lang')
    if (saved && I18N[saved]) setLang(saved)
  }, [error])

  const m = I18N[lang] || I18N.pt

  return (
    <html>
      <body style={{ fontFamily: 'system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', margin: 0, background: '#020617', color: '#e2e8f0' }}>
        <div style={{ textAlign: 'center', maxWidth: 400, padding: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>{m.title}</h1>
          <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 24, lineHeight: 1.5 }}>
            {m.message}
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: '10px 24px', borderRadius: 8, border: 'none',
              background: '#DC2626', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {m.retry}
          </button>
        </div>
      </body>
    </html>
  )
}
