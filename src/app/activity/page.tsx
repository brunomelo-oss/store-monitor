'use client'

import { AuthGuard } from '@/components/ui/AuthGuard'
import { AppLayout } from '@/components/layout/AppLayout'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { ActivityView } from '@/features/activity/ActivityView'

export default function ActivityPage() {
  return (
    <AuthGuard>
      <AppLayout>
        <ErrorBoundary>
          <ActivityView />
        </ErrorBoundary>
      </AppLayout>
    </AuthGuard>
  )
}