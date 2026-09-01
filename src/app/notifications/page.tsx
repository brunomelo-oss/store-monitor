'use client'

import { AuthGuard } from '@/components/ui/AuthGuard'
import { AppLayout } from '@/components/layout/AppLayout'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { NotificationsView } from '@/features/notifications/NotificationsView'

export default function NotificationsPage() {
  return (
    <AuthGuard>
      <AppLayout>
        <ErrorBoundary>
          <NotificationsView />
        </ErrorBoundary>
      </AppLayout>
    </AuthGuard>
  )
}