'use client'

import { AuthGuard } from '@/components/ui/AuthGuard'
import { AppLayout } from '@/components/layout/AppLayout'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { UsersManager } from '@/features/admin/UsersManager'

export default function AdminPage() {
  return (
    <AuthGuard>
      <AppLayout>
        <ErrorBoundary>
          <UsersManager />
        </ErrorBoundary>
      </AppLayout>
    </AuthGuard>
  )
}