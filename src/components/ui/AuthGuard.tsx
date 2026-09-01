'use client'

import { useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Spinner } from '@/components/ui/LoadingSkeleton'

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading, ready } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (ready && !user) {
      router.replace('/login')
    }
  }, [ready, user, router])

  if (loading || (ready && !user)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner size={32} />
      </div>
    )
  }

  return <>{children}</>
}