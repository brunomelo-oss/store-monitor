'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { Loader2, FileCode } from 'lucide-react'

export default function EditorPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FileCode size={48} className="text-muted-foreground/30 mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Editor</h1>
        <p className="text-muted-foreground max-w-md">
          Área de edição de conteúdo dos aplicativos. Selecione um aplicativo para começar.
        </p>
      </div>
    </AppLayout>
  )
}
