'use client'

import { AuthGuard } from '@/components/ui/AuthGuard'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardView } from '@/features/dashboard/components/DashboardView'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

export default function Home() {
  return (
    <AuthGuard>
      <AppLayout>
        <ErrorBoundary>
          <DashboardView />
        </ErrorBoundary>
      </AppLayout>
    </AuthGuard>
  )
}