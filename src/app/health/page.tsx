'use client'

import { AuthGuard } from '@/components/ui/AuthGuard'
import { AppLayout } from '@/components/layout/AppLayout'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { HealthView } from '@/features/health/HealthView'

export default function HealthPage() {
  return (
    <AuthGuard>
      <AppLayout>
        <ErrorBoundary>
          <HealthView />
        </ErrorBoundary>
      </AppLayout>
    </AuthGuard>
  )
}