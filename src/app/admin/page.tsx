'use client'

import { AuthGuard } from '@/components/AuthGuard'
import { AppLayout } from '@/components/layout/AppLayout'
import { UserManager } from '@/features/admin/components/UserManager'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function AdminPage() {
  return (
    <AuthGuard>
      <AppLayout>
        <ErrorBoundary>
          <UserManager />
        </ErrorBoundary>
      </AppLayout>
    </AuthGuard>
  )
}
