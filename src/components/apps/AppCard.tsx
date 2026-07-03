'use client'

import { App } from '@/types'
import { useAppContext } from '@/contexts/AppContext'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/Toast'
import { overallStatus, latestVersion, daysLabel, statusColor, statusBgColor, formatDate, appImagePath, getAccountName } from '@/lib/utils'
import { STATUS_LABELS } from '@/lib/mock-data'
import { Pin, GripVertical, Edit, Trash2, Eye, ChevronUp, ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface AppCardProps {
  app: App
  onEdit: (app: App) => void
  onDetails: (app: App) => void
  index?: number
}

const storeIcons = {
  play: '/assets/google-play-icon.png',
  apple: '/assets/app-store-icon.png',
}

export function AppCard({ app, onEdit, onDetails, index = 0 }: AppCardProps) {
  const { mode, togglePin, moveApp, removeApp } = useAppContext()
  const { isAdmin } = useAuth()
  const { show } = useToast()
  const isEdit = mode === 'edit' && isAdmin
  const imgSrc = appImagePath(app.name)
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 60)
    return () => clearTimeout(t)
  }, [index])

  return (
    <div
      ref={ref}
      className={`bg-surface border border-border rounded-xl overflow-hidden hover:border-zinc-500 transition-all duration-300 group ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      }`}
    >
      {/* Image area */}
      <div className="relative h-36 bg-gradient-to-b from-zinc-900 to-black overflow-hidden">
        {imgSrc && (
          <img
            src={imgSrc}
            alt={app.name}
            className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition duration-500"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

        {app.pinned && (
          <div className="absolute top-2 left-2 bg-purple-500/80 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1 shadow-lg">
            <Pin size={10} />
            Fixado
          </div>
        )}

        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-zinc-300 text-[10px] font-medium px-2 py-0.5 rounded-md">
          {daysLabel(app)}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title + Status */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground text-sm leading-tight truncate">{app.name}</h3>
          <div className={`text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0 ${statusBgColor(overallStatus(app))} ${statusColor(overallStatus(app))}`}>
            {STATUS_LABELS[overallStatus(app)]}
          </div>
        </div>

        {/* Stores */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <img src={storeIcons.play} alt="" className="w-4 h-4 shrink-0 opacity-70" />
            <div className="flex-1 min-w-0 flex items-center gap-1.5">
              <span className={`text-xs font-medium ${statusColor(app.playStore.status)}`}>
                {STATUS_LABELS[app.playStore.status]}
              </span>
              <span className="text-xs text-zinc-600">
                {app.playStore.version ? `v${app.playStore.version}` : '--'}
              </span>
            </div>
            <span className="text-[10px] text-zinc-600 truncate max-w-[80px]">{getAccountName('google', app.googleAccount)}</span>
          </div>

          <div className="flex items-center gap-2">
            <img src={storeIcons.apple} alt="" className="w-4 h-4 shrink-0 opacity-70" />
            <div className="flex-1 min-w-0 flex items-center gap-1.5">
              <span className={`text-xs font-medium ${statusColor(app.appStore.status)}`}>
                {STATUS_LABELS[app.appStore.status]}
              </span>
              <span className="text-xs text-zinc-600">
                {app.appStore.version ? `v${app.appStore.version}` : '--'}
              </span>
            </div>
            <span className="text-[10px] text-zinc-600 truncate max-w-[80px]">{getAccountName('apple', app.appleAccount)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-1 border-t border-border/50">
          <div className="flex items-center gap-1">
            {isEdit ? (
              <>
                <button onClick={() => moveApp(app.id, -1)} className="p-1.5 text-zinc-600 hover:text-foreground transition rounded-md hover:bg-zinc-800" title="Mover para cima">
                  <ChevronUp size={14} />
                </button>
                <button onClick={() => moveApp(app.id, 1)} className="p-1.5 text-zinc-600 hover:text-foreground transition rounded-md hover:bg-zinc-800" title="Mover para baixo">
                  <ChevronDown size={14} />
                </button>
                <button onClick={async () => { const err = await togglePin(app.id); if (err) show(err, 'warning') }} className={`p-1.5 rounded-md transition ${app.pinned ? 'text-purple-400' : 'text-zinc-600 hover:text-purple-400 hover:bg-zinc-800'}`} title="Fixar/Desfixar">
                  <Pin size={13} />
                </button>
              </>
            ) : (
              <button onClick={() => onDetails(app)} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-foreground transition">
                <Eye size={13} />
                Detalhes
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            {isEdit && (
              <>
                <button
                  onClick={() => onEdit(app)}
                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition"
                >
                  <Edit size={11} />
                  Editar
                </button>
                <button
                  onClick={() => { if (confirm(`Remover "${app.name}" do dashboard?`)) removeApp(app.id) }}
                  className="p-1.5 text-zinc-600 hover:text-red-400 transition rounded-md hover:bg-zinc-800"
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
