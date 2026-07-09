'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body style={{ fontFamily: 'system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', margin: 0, background: '#020617', color: '#e2e8f0' }}>
        <div style={{ textAlign: 'center', maxWidth: 400, padding: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>Algo deu errado</h1>
          <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 24, lineHeight: 1.5 }}>
            Ocorreu um erro inesperado. Tente recarregar a página.
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: '10px 24px', borderRadius: 8, border: 'none',
              background: '#DC2626', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  )
}
