'use client'

import { useRouter } from 'next/navigation'
import { useLang } from '@/contexts/LanguageContext'
import type { App } from '@/lib/types'
import { useTogglePin, useMoveApp, useDeleteApp } from '@/hooks/useApps'
import { useToast } from '@/components/ui/Toast'
import { useTriggerSync } from '@/hooks/useSync'
import { Pin, Eye, ChevronUp, ChevronDown, RefreshCw } from 'lucide-react'

interface AppCardActionsProps {
  app: App
  isEdit: boolean
  onEdit: (app: App) => void
}

export function AppCardActions({ app, isEdit, onEdit }: AppCardActionsProps) {
  const { t } = useLang()
  const router = useRouter()
  const { show } = useToast()
  const togglePinMutation = useTogglePin()
  const moveAppMutation = useMoveApp()
  const deleteAppMutation = useDeleteApp()
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
      <div className="flex items-center gap-1">
        {isEdit ? (
          <>
            <button
              onClick={() => moveAppMutation.mutate({ id: app.id, direction: 'up' })}
              className="p-1.5 text-muted-foreground hover:text-foreground transition rounded-md hover:bg-surface"
              title={t('appCard.moveUp')}
            >
              <ChevronUp size={14} />
            </button>
            <button
              onClick={() => moveAppMutation.mutate({ id: app.id, direction: 'down' })}
              className="p-1.5 text-muted-foreground hover:text-foreground transition rounded-md hover:bg-surface"
              title={t('appCard.moveDown')}
            >
              <ChevronDown size={14} />
            </button>
            <button
              onClick={() => { togglePinMutation.mutate(app.id) }}
              className={`p-1.5 rounded-md transition ${app.pinned ? 'text-amber-400' : 'text-muted-foreground hover:text-amber-400 hover:bg-surface'}`}
              title={t('appCard.pinTooltip')}
            >
              <Pin size={13} />
            </button>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>

      {isEdit && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(app)}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 transition"
          >
            {t('appCard.edit')}
          </button>
          <button
            onClick={() => { if (confirm(t('appCard.removeConfirm', { name: app.name }))) deleteAppMutation.mutate(app.id) }}
            className="p-1.5 text-muted-foreground hover:text-red-400 transition rounded-md hover:bg-surface"
            aria-label="Remover"
          >
            <TrashIcon />
          </button>
        </div>
      )}
    </div>
  )
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}