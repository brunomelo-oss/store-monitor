'use client'

import { useLang } from '@/contexts/LanguageContext'
import type { App } from '@/lib/types'
import { appIcon, getAccountName } from '@/lib/utils'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface InconformitiesStripProps {
  apps: App[]
}

const storeIcons = {
  play: '/assets/google-play-icon.png',
  apple: '/assets/app-store-icon.png',
}

export function InconformitiesStrip({ apps }: InconformitiesStripProps) {
  const { t } = useLang()
  if (apps.length === 0) return null

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 pb-3 mb-4 border-b border-border">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 uppercase">
          <AlertTriangle size={10} />
          {t('issues.title')}
        </span>
        <span className="text-xs text-muted-foreground">{t('issues.count', { count: apps.length })}</span>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:thin]">
        {apps.map(app => (
          <Link
            key={app.id}
            href={`/apps/${app.id}`}
            className="snap-start shrink-0 w-[240px] group relative bg-card border border-red-500/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="relative h-20 overflow-hidden bg-surface">
              {appIcon(app) ? (
                <img src={appIcon(app)} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-white/20 select-none">{app.name.charAt(0)}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              <div className="absolute top-2 left-2 bg-red-500/90 backdrop-blur-sm text-white p-1 rounded-full shadow-lg">
                <AlertTriangle size={12} />
              </div>
            </div>
            <div className="p-3 space-y-2">
              <div className="font-semibold text-foreground text-xs leading-tight truncate">{app.name}</div>
              <div className="space-y-1">
                {app.issues?.map((issue, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <img
                      src={issue.store === 'apple' ? storeIcons.apple : storeIcons.play}
                      alt=""
                      className="w-3 h-3 shrink-0 opacity-70"
                    />
                    <span className="capitalize truncate">{t('status.' + issue.status)}</span>
                    <span className="truncate ml-auto max-w-[70px]">
                      {getAccountName(issue.store, issue.store === 'apple' ? app.appleAccount : app.googleAccount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
