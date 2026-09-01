'use client'

import { Component, type ReactNode } from 'react'
import { useLang } from '@/contexts/LanguageContext'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

function DefaultFallback() {
  const { t } = useLang()
  return (
    <div className="min-h-[200px] flex flex-col items-center justify-center gap-4 p-8">
      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 text-2xl font-bold">!</div>
      <div className="text-center space-y-1">
        <p className="font-semibold text-foreground">{t('errorBoundary.title')}</p>
        <p className="text-sm text-muted-foreground">{t('errorBoundary.message')}</p>
      </div>
    </div>
  )
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    if (typeof console !== 'undefined') console.error('[ErrorBoundary]', error)
  }

  render() {
    if (this.state.hasError) return this.props.fallback ?? <DefaultFallback />
    return this.props.children
  }
}