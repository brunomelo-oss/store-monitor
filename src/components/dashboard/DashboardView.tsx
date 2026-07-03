'use client'

import { useState } from 'react'
import { Suspense } from 'react'
import { NavTabs } from '@/components/layout/NavTabs'
import { BentoMetrics } from './BentoMetrics'
import { InstallChart } from './InstallChart'
import { RatingsGrid } from './RatingsGrid'
import { Indicators } from './Indicators'
import { DashboardSkeleton } from './DashboardSkeleton'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AppsView } from '@/components/apps/AppsView'
import { UserManager } from '@/components/admin/UserManager'

export function DashboardView() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div>
      <NavTabs active={activeTab} onChange={setActiveTab} />

      <div className="mt-8">
        {activeTab === 'dashboard' && (
          <Suspense fallback={<DashboardSkeleton />}>
            <div className="space-y-10">
              <ErrorBoundary><BentoMetrics /></ErrorBoundary>
              <ErrorBoundary><InstallChart /></ErrorBoundary>
              <ErrorBoundary><RatingsGrid /></ErrorBoundary>
              <ErrorBoundary><Indicators /></ErrorBoundary>
            </div>
          </Suspense>
        )}

        {activeTab === 'apps' && <ErrorBoundary><AppsView /></ErrorBoundary>}

        {activeTab === 'users' && <ErrorBoundary><UserManager /></ErrorBoundary>}
      </div>
    </div>
  )
}
