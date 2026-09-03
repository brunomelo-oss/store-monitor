'use client'

import { useRouter } from 'next/navigation'
import { useLang } from '@/contexts/LanguageContext'
import type { App } from '@/lib/types'
import { useToast } from '@/components/ui/Toast'
import { useTriggerSync } from '@/hooks/useSync'
import { Eye, RefreshCw } from 'lucide-react'

interface AppCardActionsProps {
  app: App
}

export function AppCardActions({ app }: AppCardActionsProps) {
  const { t } = useLang()
  const router = useRouter()
  const { show } = useToast()
  const triggerSync = useTriggerSync()

  const handleSync = async () => {
    const results = await Promise.allSettled([
      triggerSync.mutateAsync({ appId: app.id, store: 'GOOGLE' }),
      triggerSync.mutateAsync({ appId: app.id, store: 'APPLE' }),
    ])
    const failed = results.filter(r => r.status === 'rejected')
    if (failed.length === 2) show(t('appCard.syncFailed'), 'error')
    else if (failed.length === 1) show(t('appCard.syncPartial'), 'warning')
    else show(t('appCard.syncTriggered'), 'success')
  }

  return (
    <div className="flex items-center justify-between pt-3 border-t border-border/50">
      <button
        onClick={() => router.push(`/apps/${app.id}`)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition"
      >
        <Eye size={13} />
        {t('appCard.details')}
      </button>
      <button
        onClick={handleSync}
        disabled={triggerSync.isPending}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-sky-400 transition disabled:opacity-40"
        title={t('appCard.syncTooltip')}
      >
        <RefreshCw size={13} className={triggerSync.isPending ? 'animate-spin' : ''} />
      </button>
    </div>
  )
}
