'use client'

import { useLang } from '@/contexts/LanguageContext'
import type { App, AppStatus } from '@/types'
import type { StoreConnection } from '@/services/store-connections.service'
import { ACCOUNTS } from '@/lib/mock-data'
import { validateVersion, overallStatus, formatDate } from '@/lib/utils'
import { Smartphone, Globe, Apple, Tag } from 'lucide-react'

interface AppDetailViewProps {
  app: App
  connections: StoreConnection[]
}

export function AppDetailView({ app, connections }: AppDetailViewProps) {
  const { t } = useLang()

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 rounded-lg bg-zinc-800/40">
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 uppercase tracking-wider mb-1">
            <Globe size={11} />
            {t('appModal.label.region')}
          </div>
          <div className="text-sm font-medium text-white">{app?.region}</div>
        </div>
        <div className="p-3 rounded-lg bg-zinc-800/40">
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 uppercase tracking-wider mb-1">
            <Tag size={11} />
            {t('appModal.label.status')}
          </div>
          <div className="text-sm font-medium text-white">{app ? t('status.' + overallStatus(app)) : '---'}</div>
        </div>
      </div>

      {(app?.packageName || app?.bundleId) && (
        <div className="p-3 rounded-lg bg-zinc-800/40 space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 uppercase tracking-wider mb-1">
            <Smartphone size={13} />
            {t('appModal.label.accounts')}
          </div>
          {app?.packageName && <div className="flex justify-between text-sm"><span className="text-zinc-500">Package</span><span className="font-mono text-xs text-white">{app.packageName}</span></div>}
          {app?.bundleId && <div className="flex justify-between text-sm"><span className="text-zinc-500">Bundle ID</span><span className="font-mono text-xs text-white">{app.bundleId}</span></div>}
          {app?.googleStoreConnectionId != null && <div className="flex justify-between text-sm"><span className="text-zinc-500">Conexão Google</span><span className="text-white">{connections.find(c => c.id === app.googleStoreConnectionId)?.label || `#${app.googleStoreConnectionId}`}</span></div>}
          {app?.appleStoreConnectionId != null && <div className="flex justify-between text-sm"><span className="text-zinc-500">Conexão Apple</span><span className="text-white">{connections.find(c => c.id === app.appleStoreConnectionId)?.label || `#${app.appleStoreConnectionId}`}</span></div>}
        </div>
      )}

      <div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-2">
          <Smartphone size={13} />
          Contas
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">{t('appModal.label.google')}</span>
            <span className="text-white">{ACCOUNTS.google.find(a => a.id === app?.googleAccount)?.name || '---'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">{t('appModal.label.apple')}</span>
            <span className="text-white">{ACCOUNTS.apple.find(a => a.id === app?.appleAccount)?.name || '---'}</span>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-2">
          <Smartphone size={13} />
          {t('appModal.section.playStore')}
        </div>
        <div className="p-3 rounded-lg bg-zinc-800/40 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">{t('appModal.label.status')}</span>
            <span className="text-white font-medium">{t('status.' + (app?.playStore?.status || 'unpublished'))}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">{t('appModal.label.version')}</span>
            <span className="text-white">{app?.playStore?.version || '--'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">{t('appModal.label.date')}</span>
            <span className="text-white">{app ? formatDate(app.playStore.lastUpdate) : '--'}</span>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-2">
          <Apple size={13} />
          {t('appModal.section.appStore')}
        </div>
        <div className="p-3 rounded-lg bg-zinc-800/40 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">{t('appModal.label.status')}</span>
            <span className="text-white font-medium">{t('status.' + (app?.appStore?.status || 'unpublished'))}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">{t('appModal.label.version')}</span>
            <span className="text-white">{app?.appStore?.version || '--'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">{t('appModal.label.date')}</span>
            <span className="text-white">{app ? formatDate(app.appStore.lastUpdate) : '--'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
