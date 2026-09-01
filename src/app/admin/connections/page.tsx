'use client'

import { AuthGuard } from '@/components/ui/AuthGuard'
import { AppLayout } from '@/components/layout/AppLayout'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { ConnectionsView } from '@/features/admin/ConnectionsView'

export default function ConnectionsPage() {
  return (
    <AuthGuard>
      <AppLayout>
        <ErrorBoundary>
          <ConnectionsView />
        </ErrorBoundary>
      </AppLayout>
    </AuthGuard>
  )
}