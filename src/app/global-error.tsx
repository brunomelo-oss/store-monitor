'use client'

import * as Sentry from '@sentry/nextjs'
import NextError from 'next/error'
import { useEffect } from 'react'
import { useLang } from '@/contexts/LanguageContext'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { t } = useLang()

  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body className="bg-black text-white flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">{t('globalError.title')}</h1>
          <p className="text-zinc-400 text-sm">{t('globalError.message')}</p>
          <button
            onClick={reset}
            className="px-6 py-2 bg-sasi-red text-white rounded-lg hover:opacity-90 transition"
          >
            {t('globalError.retry')}
          </button>
        </div>
      </body>
    </html>
  )
}
