'use client'

import { useLang } from '@/contexts/LanguageContext'
import { App } from '@/types'
import { useTogglePin, useMoveApp, useDeleteApp } from '@/hooks/useApps'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/Toast'
import { overallStatus, daysLabel, statusColor, statusBgColor, formatDate, appImagePath, getAccountName } from '@/lib/utils'
import { StatusBadge } from '@/components/StatusBadge'
import { useTriggerSync } from '@/features/sync/hooks/useTriggerSync'
import { Pin, Edit, Trash2, Eye, ChevronUp, ChevronDown, Star, Download, RefreshCw } from 'lucide-react'
import { useEffect, useRef, useState, useMemo } from 'react'

interface AppCardProps {
  app: App
  mode: 'view' | 'edit'
  onEdit: (app: App) => void
  onDetails: (app: App) => void
  index?: number
}

const storeIcons = {
  play: '/assets/google-play-icon.png',
  apple: '/assets/app-store-icon.png',
}

export function AppCard({ app, mode, onEdit, onDetails, index = 0 }: AppCardProps) {
  const { t } = useLang()
  const { isAdmin } = useAuth()
  const { show } = useToast()
  const togglePinMutation = useTogglePin()
  const moveAppMutation = useMoveApp()
  const deleteAppMutation = useDeleteApp()
  const triggerSync = useTriggerSync()
  const isEdit = mode === 'edit' && isAdmin
  const imgSrc = appImagePath(app.name)
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const placeholderColor = useMemo(() => {
    let hash = 0
    for (let i = 0; i < app.name.length; i++) {
      hash = app.name.charCodeAt(i) + ((hash << 5) - hash)
    }
    const h = Math.abs(hash) % 360
    return { from: `hsl(${h}, 45%, 35%)`, to: `hsl(${(h + 40) % 360}, 40%, 25%)` }
  }, [app.name])

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), Math.min(index * 60, 300))
    return () => clearTimeout(timer)
  }, [index])

  return (
    <div
      ref={ref}
      className={`relative bg-card border border-border rounded-2xl overflow-hidden card-glass shadow-sm transition-all duration-300 group hover:shadow-md hover:-translate-y-0.5 ${app.pinned ? 'border-amber-400/50 shadow-amber-400/10 shadow-md' : ''} ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className="app-card-bg"
        style={imgSrc ? { backgroundImage: `url('${imgSrc}')` } : {
          background: `linear-gradient(135deg, ${placeholderColor.from}, ${placeholderColor.to})`
        }}
      />

      <div className="relative h-36 overflow-hidden" style={imgSrc ? {} : {
        background: `linear-gradient(135deg, ${placeholderColor.from}, ${placeholderColor.to})`
      }}>
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={app.name}
            className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl font-bold text-white/20 select-none">
              {app.name.charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          {app.pinned && (
            <div className="bg-amber-400/80 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1 shadow-lg">
              <Pin size={10} />
              {t('appCard.pinned')}
            </div>
          )}
          <div className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md shadow-lg backdrop-blur-sm ${statusBgColor(overallStatus(app))} ${statusColor(overallStatus(app))}`}>
            {t('status.' + overallStatus(app))}
          </div>
        </div>

        <div className="absolute bottom-2 right-2 bg-inset/80 backdrop-blur-sm text-muted-foreground text-[10px] font-medium px-2 py-0.5 rounded-md">
          {daysLabel(app)}
        </div>
      </div>

      <div className="p-5 space-y-3 relative z-[1] bg-card">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-foreground text-sm leading-tight truncate">{app.name}</h3>
          {isEdit && (
            <button onClick={async () => { const err = await togglePinMutation.mutateAsync(app.id).catch(e => e.message); if (err) show(err, 'warning') }} className={`p-1.5 rounded-md transition shrink-0 ${app.pinned ? 'text-amber-400' : 'text-muted-foreground hover:text-amber-400 hover:bg-surface'}`} title={t('appCard.pinTooltip')}>
              <Pin size={13} />
            </button>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface">
            <img src={storeIcons.play} alt="" className="w-4 h-4 shrink-0 opacity-70" />
            <div className="flex-1 min-w-0 flex items-center gap-1.5">
              <span className={`text-xs font-medium ${statusColor(app.playStore.status)}`}>
                {t('status.' + app.playStore.status)}
              </span>
              <span className="text-xs text-muted-foreground">
                {app.playStore.version ? `v${app.playStore.version}` : '--'}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">{getAccountName('google', app.googleAccount)}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface">
            <img src={storeIcons.apple} alt="" className="w-4 h-4 shrink-0 opacity-70" />
            <div className="flex-1 min-w-0 flex items-center gap-1.5">
              <span className={`text-xs font-medium ${statusColor(app.appStore.status)}`}>
                {t('status.' + app.appStore.status)}
              </span>
              <span className="text-xs text-muted-foreground">
                {app.appStore.version ? `v${app.appStore.version}` : '--'}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">{getAccountName('apple', app.appleAccount)}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {app.rating > 0 && (
            <span className="flex items-center gap-1">
              <Star size={12} className="text-yellow-500" />
              {app.rating.toFixed(1)}
            </span>
          )}
          {app.installations > 0 && (
            <span className="flex items-center gap-1">
              <Download size={12} />
              {app.installations.toLocaleString('pt-BR')}
            </span>
          )}
          {app.lastSyncStatus && (
            <span className="flex items-center gap-1 ml-auto">
              <StatusBadge status={app.lastSyncStatus} />
            </span>
          )}
        </div>

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
                    await triggerSync.mutateAsync({
                      appId: app.id,
                      store: 'GOOGLE',
                      types: ['APP_INFO', 'VERSIONS', 'BUILDS', 'REVIEWS', 'RATINGS', 'ANALYTICS', 'PUBLICATIONS'],
                    }).catch(() => {})
                    await triggerSync.mutateAsync({
                      appId: app.id,
                      store: 'APPLE',
                      types: ['APP_INFO', 'VERSIONS', 'BUILDS', 'REVIEWS', 'RATINGS', 'ANALYTICS', 'PUBLICATIONS'],
                    }).catch(() => {})
                    show(t('appCard.syncTriggered'))
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
      </div>
    </div>
  )
}
