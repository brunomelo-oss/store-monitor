'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-lg font-bold text-foreground mb-2">Algo deu errado</h2>
          <p className="text-sm text-zinc-500 mb-4 max-w-md">
            {this.state.error?.message || 'Ocorreu um erro inesperado ao carregar este componente.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 rounded-lg bg-sasi-red text-white text-sm font-semibold hover:opacity-90 transition"
          >
            Tentar novamente
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
