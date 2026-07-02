'use client'

import { App } from '@/types'
import { useAppContext } from '@/contexts/AppContext'
import { useAuth } from '@/contexts/AuthContext'
import { overallStatus, latestVersion, daysLabel, statusColor, statusBgColor, formatDate, appImagePath, getAccountName } from '@/lib/utils'
import { STATUS_LABELS } from '@/lib/mock-data'
import { Pin, GripVertical, Edit, Trash2, StickyNote, Eye } from 'lucide-react'

interface AppCardProps {
  app: App
  onEdit: (app: App) => void
  onDetails: (app: App) => void
}

const storeIcons = {
  play: '/assets/google-play-icon.png',
  apple: '/assets/app-store-icon.png',
}

export function AppCard({ app, onEdit, onDetails }: AppCardProps) {
  const { mode, togglePin, moveApp, removeApp } = useAppContext()
  const { isAdmin } = useAuth()
  const isEdit = mode === 'edit' && isAdmin
  const imgSrc = appImagePath(app.name)

  return (
    <div className="bg-surface border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition group">
      {/* Image area */}
      <div className="relative h-36 bg-black overflow-hidden">
        {imgSrc && (
          <img
            src={imgSrc}
            alt={app.name}
            className="w-full h-full object-cover opacity-60 group-hover:opacity-70 transition"
          />
        )}
        {app.pinned && (
          <div className="absolute top-2 left-2 bg-purple-500/80 text-white text-xs px-2 py-0.5 rounded-md flex items-center gap-1">
            <Pin size={12} />
            Fixado
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-white text-sm leading-tight">{app.name}</h3>
          <div className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${statusBgColor(overallStatus(app))} ${statusColor(overallStatus(app))}`}>
            {STATUS_LABELS[overallStatus(app)]}
          </div>
        </div>

        {/* Play Store */}
        <div className="flex items-center gap-2">
          <img src={storeIcons.play} alt="" className="w-4 h-4" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-medium ${statusColor(app.playStore.status)}`}>
                {STATUS_LABELS[app.playStore.status]}
              </span>
              <span className="text-xs text-zinc-500">
                {app.playStore.version ? `v${app.playStore.version}` : '--'}
              </span>
            </div>
          </div>
          <span className="text-[10px] text-zinc-600">{getAccountName('google', app.googleAccount)}</span>
        </div>

        {/* App Store */}
        <div className="flex items-center gap-2">
          <img src={storeIcons.apple} alt="" className="w-4 h-4" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-medium ${statusColor(app.appStore.status)}`}>
                {STATUS_LABELS[app.appStore.status]}
              </span>
              <span className="text-xs text-zinc-500">
                {app.appStore.version ? `v${app.appStore.version}` : '--'}
              </span>
            </div>
          </div>
          <span className="text-[10px] text-zinc-600">{getAccountName('apple', app.appleAccount)}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1">
            {isEdit ? (
              <>
                <button onClick={() => moveApp(app.id, -1)} className="p-1 text-zinc-600 hover:text-white transition" title="Mover para cima">
                  <GripVertical size={14} />
                </button>
                <button onClick={() => moveApp(app.id, 1)} className="p-1 text-zinc-600 hover:text-white transition" title="Mover para baixo">
                  <GripVertical size={14} className="rotate-180" />
                </button>
                <button onClick={() => togglePin(app.id)} className={`p-1 transition ${app.pinned ? 'text-purple-400' : 'text-zinc-600 hover:text-purple-400'}`} title="Fixar/Desfixar">
                  <Pin size={14} />
                </button>
              </>
            ) : (
              <button onClick={() => onDetails(app)} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-white transition">
                <Eye size={14} />
                Detalhes
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isEdit && (
              <>
                <button
                  onClick={() => onEdit(app)}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition"
                >
                  <Edit size={12} />
                  Editar
                </button>
                <button
                  onClick={() => { if (confirm(`Remover "${app.name}" do dashboard?`)) removeApp(app.id) }}
                  className="p-1.5 text-zinc-600 hover:text-red-400 transition"
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
