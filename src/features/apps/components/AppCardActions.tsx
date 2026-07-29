'use client'

import { useLang } from '@/contexts/LanguageContext'
import { App } from '@/types'
import { useTogglePin, useMoveApp, useDeleteApp } from '@/hooks/useApps'
import { useToast } from '@/components/Toast'
import { logError } from '@/lib/logger'
import { useTriggerSync } from '@/features/sync/hooks/useTriggerSync'
import { Pin, Edit, Trash2, Eye, ChevronUp, ChevronDown, RefreshCw } from 'lucide-react'

interface AppCardActionsProps {
  app: App
  isEdit: boolean
  onEdit: (app: App) => void
  onDetails: (app: App) => void
}

export function AppCardActions({ app, isEdit, onEdit, onDetails }: AppCardActionsProps) {
  const { t } = useLang()
  const { show } = useToast()
  const togglePinMutation = useTogglePin()
  const moveAppMutation = useMoveApp()
  const deleteAppMutation = useDeleteApp()
  const triggerSync = useTriggerSync()

  return (
    <div className="flex items-center justify-between pt-3 border-t border-border/50">
      <div className="flex items-center gap-1">
        {isEdit ? (
          <>
            <button onClick={() => moveAppMutation.mutate({ id: app.id, direction: -1 })} className="p-1.5 text-muted-foreground hover:text-foreground transition rounded-md hover:bg-surface" title={t('appCard.moveUp')}>
              <ChevronUp size={14} />
            </button>
            <button onClick={() => moveAppMutation.mutate({ id: app.id, direction: 1 })} className="p-1.5 text-muted-foreground hover:text-foreground transition rounded-md hover:bg-surface" title={t('appCard.moveDown')}>
              <ChevronDown size={14} />
            </button>
            <button onClick={async () => { const err = await togglePinMutation.mutateAsync(app.id).catch(e => e.message); if (err) show(err, 'warning') }} className={`p-1.5 rounded-md transition ${app.pinned ? 'text-amber-400' : 'text-muted-foreground hover:text-amber-400 hover:bg-surface'}`} title={t('appCard.pinTooltip')}>
              <Pin size={13} />
            </button>
          </>
        ) : (
          <>
            <button onClick={() => onDetails(app)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition">
              <Eye size={13} />
              {t('appCard.details')}
            </button>
            <button
              onClick={async () => {
                const results = await Promise.allSettled([
                  triggerSync.mutateAsync({ appId: app.id, store: 'GOOGLE', types: ['APP_INFO', 'VERSIONS', 'BUILDS', 'REVIEWS', 'RATINGS', 'ANALYTICS', 'PUBLICATIONS'] }),
                  triggerSync.mutateAsync({ appId: app.id, store: 'APPLE', types: ['APP_INFO', 'VERSIONS', 'BUILDS', 'REVIEWS', 'RATINGS', 'ANALYTICS', 'PUBLICATIONS'] }),
                ])
                const failed = results.filter(r => r.status === 'rejected')
                if (failed.length === 2) {
                  show(t('appCard.syncFailed'), 'error')
                } else if (failed.length === 1) {
                  show(t('appCard.syncPartial'), 'warning')
                } else {
                  show(t('appCard.syncTriggered'))
                }
                failed.forEach(r => logError('AppCard sync', (r as PromiseRejectedResult).reason))
              }}
              disabled={triggerSync.isPending}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-sky-400 transition disabled:opacity-40"
              title={t('appCard.syncTooltip')}
            >
              <RefreshCw size={13} className={triggerSync.isPending ? 'animate-spin' : ''} />
            </button>
          </>
        )}
      </div>

      <div className="flex items-center gap-1">
        {isEdit && (
          <>
            <button
              onClick={() => onEdit(app)}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 transition"
            >
              <Edit size={11} />
              {t('appCard.edit')}
            </button>
            <button
              onClick={() => { if (confirm(t('appCard.removeConfirm', { name: app.name }))) deleteAppMutation.mutate(app.id) }}
              className="p-1.5 text-muted-foreground hover:text-red-400 transition rounded-md hover:bg-surface"
            >
              <Trash2 size={13} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
