'use client'

import { AuthGuard } from '@/components/ui/AuthGuard'
import { AppLayout } from '@/components/layout/AppLayout'
import { AppsView } from '@/features/apps/components/AppsView'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

export default function AppsPage() {
  return (
    <AuthGuard>
      <AppLayout>
        <ErrorBoundary>
          <AppsView />
        </ErrorBoundary>
      </AppLayout>
    </AuthGuard>
  )
}