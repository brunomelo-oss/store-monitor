'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useApps } from '@/hooks/useApps'
import { useLang } from '@/contexts/LanguageContext'
import { GlobalSearch } from './GlobalSearch'
import { Sidebar } from './Sidebar'
import { NotificationsDropdown } from './NotificationsDropdown'
import { ProfileDropdown } from './ProfileDropdown'
import { useModal } from '@/contexts/ModalContext'
import { AppModal } from '@/features/apps/components/AppModal'
import { Smartphone } from 'lucide-react'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth()
  const { data: apps = [] } = useApps()
  const { t } = useLang()
  const { modal, closeModal } = useModal()
  if (!user) return <>{children}</>

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-md ml-48">
        <div className="flex items-center justify-between h-14 px-4 sm:px-6 gap-1 sm:gap-1.5">
          <div className="hidden sm:flex items-center">
            <GlobalSearch />
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface text-xs text-muted-foreground whitespace-nowrap">
              <Smartphone size={12} />
              <span className="font-semibold text-foreground">{apps.length}</span>
            </div>

            <NotificationsDropdown />
            <ProfileDropdown />
          </div>
        </div>
      </header>

      <main className="ml-48">
        <div className="max-w-[1440px] px-4 sm:px-6 py-6">
          {children}
        </div>
      </main>

      {modal && (
        <AppModal
          app={modal.app}
          mode={modal.mode}
          region={modal.region}
          onClose={closeModal}
        />
      )}
    </div>
  )
}
