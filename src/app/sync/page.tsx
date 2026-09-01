'use client'

import { AuthGuard } from '@/components/ui/AuthGuard'
import { AppLayout } from '@/components/layout/AppLayout'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { SyncView } from '@/features/sync/SyncView'

export default function SyncPage() {
  return (
    <AuthGuard>
      <AppLayout>
        <ErrorBoundary>
          <SyncView />
        </ErrorBoundary>
      </AppLayout>
    </AuthGuard>
  )
}