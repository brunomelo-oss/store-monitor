'use client'

import { use } from 'react'
import Link from 'next/link'
import { AuthGuard } from '@/components/ui/AuthGuard'
import { AppLayout } from '@/components/layout/AppLayout'
import { AppDetailView } from '@/features/apps/components/AppDetailView'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { useApp } from '@/hooks/useApps'
import { Spinner } from '@/components/ui/LoadingSkeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ArrowLeft, Smartphone } from 'lucide-react'

function AppDetailPageContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const appId = Number(id)
  const { data: app, isLoading, isError } = useApp(appId)

  return (
    <div>
      <Link href="/apps" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition mb-4">
        <ArrowLeft size={13} />
        Voltar para Apps
      </Link>
      {isLoading ? (
        <div className="py-16 flex justify-center"><Spinner size={28} /></div>
      ) : isError || !app ? (
        <EmptyState icon={Smartphone} title="App não encontrado" description="O aplicativo pode ter sido removido." />
      ) : (
        <AppDetailView app={app} />
      )}
    </div>
  )
}

export default function AppDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <AuthGuard>
      <AppLayout>
        <ErrorBoundary>
          <AppDetailPageContent params={params} />
        </ErrorBoundary>
      </AppLayout>
    </AuthGuard>
  )
}