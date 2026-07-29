'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const initDone = useRef(false)

  useEffect(() => {
    if (!loading) initDone.current = true
    if (initDone.current && !user) router.replace('/login')
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-muted-foreground" />
      </div>
    )
  }

  return <>{children}</>
}
