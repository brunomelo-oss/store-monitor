'use client'

import { AuthGuard } from '@/components/AuthGuard'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardView } from '@/features/dashboard/components/DashboardView'

export default function Home() {
  return (
    <AuthGuard>
      <AppLayout>
        <DashboardView />
      </AppLayout>
    </AuthGuard>
  )
}
