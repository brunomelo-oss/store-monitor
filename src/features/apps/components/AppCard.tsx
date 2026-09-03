'use client'

import { memo, useEffect, useMemo, useState } from 'react'
import { useLang } from '@/contexts/LanguageContext'
import type { App } from '@/lib/types'
import { daysLabel, statusColor, appIcon, getAccountName, hasIssues } from '@/lib/utils'
import { AppCardActions } from './AppCardActions'
import { Pin, Star, Download, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface AppCardProps {
  app: App
  index?: number
}

const storeIcons = {
  play: '/assets/google-play-icon.png',
  apple: '/assets/app-store-icon.png',
}

export const AppCard = memo(function AppCard({ app, index = 0 }: AppCardProps) {
  const { t } = useLang()
  const imgSrc = appIcon(app)
  const [visible, setVisible] = useState(false)
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

  const issues = hasIssues(app)

  return (
    <div
      className={`relative bg-card border border-border rounded-2xl overflow-hidden shadow-sm transition-all duration-300 group hover:shadow-md hover:-translate-y-0.5 ${app.pinned ? 'border-amber-400/50 shadow-md' : ''} ${issues ? 'border-red-500/40' : ''} ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="relative h-36 overflow-hidden" style={imgSrc ? {} : { background: `linear-gradient(135deg, ${placeholderColor.from}, ${placeholderColor.to})` }}>
        {imgSrc ? (
          <img src={imgSrc} alt={app.name} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl font-bold text-white/20 select-none">{app.name.charAt(0)}</span>
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
          {issues && (
            <div className="bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-medium px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-lg">
              <AlertTriangle size={10} />
              {t('appCard.issue')}
            </div>
          )}
        </div>

        <div className="absolute top-2 right-2 flex items-center gap-1.5">
          {issues && (
            <div className="bg-red-500/90 backdrop-blur-sm text-white p-1 rounded-full shadow-lg">
              <AlertTriangle size={11} />
            </div>
          )}
        </div>

        <div className="absolute bottom-2 right-2 bg-inset/80 backdrop-blur-sm text-muted-foreground text-[10px] font-medium px-2 py-0.5 rounded-md">
          {daysLabel(app)}
        </div>
      </div>

      <div className="p-5 space-y-3 relative z-[1] bg-card">
        <div className="flex items-center justify-between gap-2">
          <Link href={`/apps/${app.id}`} className="font-semibold text-foreground text-sm leading-tight truncate hover:underline">
            {app.name}
          </Link>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface">
            <img src={storeIcons.play} alt="" className="w-4 h-4 shrink-0 opacity-70" />
            <div className="flex-1 min-w-0 flex items-center gap-1.5">
              <span className={`text-xs font-medium ${statusColor(app.playStore.status)} capitalize`}>{t('status.' + app.playStore.status)}</span>
              <span className="text-xs text-muted-foreground">{app.playStore.version ? `v${app.playStore.version}` : '--'}</span>
            </div>
            <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">{getAccountName('google', app.googleAccount)}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface">
            <img src={storeIcons.apple} alt="" className="w-4 h-4 shrink-0 opacity-70" />
            <div className="flex-1 min-w-0 flex items-center gap-1.5">
              <span className={`text-xs font-medium ${statusColor(app.appStore.status)} capitalize`}>{t('status.' + app.appStore.status)}</span>
              <span className="text-xs text-muted-foreground">{app.appStore.version ? `v${app.appStore.version}` : '--'}</span>
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
        </div>

        <AppCardActions app={app} />
      </div>
    </div>
  )
})