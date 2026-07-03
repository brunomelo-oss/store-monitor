'use client'

import * as Sentry from '@sentry/nextjs'
import NextError from 'next/error'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body className="bg-black text-white flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Algo deu errado</h1>
          <p className="text-zinc-400 text-sm">Um erro inesperado ocorreu.</p>
          <button
            onClick={reset}
            className="px-6 py-2 bg-sasi-red text-white rounded-lg hover:opacity-90 transition"
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  )
}
