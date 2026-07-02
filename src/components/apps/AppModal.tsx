'use client'

import { useState, useEffect } from 'react'
import { App, AppStatus } from '@/types'
import { useAppContext } from '@/contexts/AppContext'
import { STATUS_LABELS, ACCOUNTS } from '@/lib/mock-data'
import { validateVersion } from '@/lib/utils'
import { X, Loader2 } from 'lucide-react'

interface AppModalProps {
  app: App | null
  mode: 'edit' | 'add' | 'details'
  region: string
  onClose: () => void
}

export function AppModal({ app, mode, region, onClose }: AppModalProps) {
  const { addApp, updateApp, apps } = useAppContext()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const isDetails = mode === 'details'
  const isAdd = mode === 'add'
  const title = isAdd ? `Novo App - ${region}` : (isDetails ? app?.name || '' : 'Editar App')

  // Form state
  const [name, setName] = useState('')
  const [appRegion, setAppRegion] = useState(region)
  const [playStatus, setPlayStatus] = useState<AppStatus>('unpublished')
  const [playVersion, setPlayVersion] = useState('')
  const [playDate, setPlayDate] = useState('')
  const [appStatus, setAppStatus] = useState<AppStatus>('unpublished')
  const [appVersion, setAppVersion] = useState('')
  const [appDate, setAppDate] = useState('')
  const [googleAccount, setGoogleAccount] = useState('sasiHoldings')
  const [appleAccount, setAppleAccount] = useState('sasTech')

  useEffect(() => {
    if (app) {
      setName(app.name)
      setAppRegion(app.region)
      setPlayStatus(app.playStore.status)
      setPlayVersion(app.playStore.version)
      setPlayDate(app.playStore.lastUpdate)
      setAppStatus(app.appStore.status)
      setAppVersion(app.appStore.version)
      setAppDate(app.appStore.lastUpdate)
      setGoogleAccount(app.googleAccount)
      setAppleAccount(app.appleAccount)
    } else if (isAdd) {
      setName('')
      setAppRegion(region)
      setPlayStatus('unpublished')
      setPlayVersion('')
      setPlayDate('')
      setAppStatus('unpublished')
      setAppVersion('')
      setAppDate('')
      setGoogleAccount('sasiHoldings')
      setAppleAccount('sasTech')
    }
  }, [app, isAdd, region])

  const handleSave = async () => {
    setError('')
    const n = name.trim()
    if (!n) { setError('O nome do app não pode ficar vazio'); return }
    if (playVersion && !validateVersion(playVersion)) { setError('Versão Play Store inválida (use x.y.z)'); return }
    if (appVersion && !validateVersion(appVersion)) { setError('Versão App Store inválida (use x.y.z)'); return }

    setSaving(true)
    const data = {
      name: n,
      region: appRegion as 'Brasil' | 'Internacional',
      googleAccount,
      appleAccount,
      playStore: { status: playStatus, version: playVersion, lastUpdate: playDate },
      appStore: { status: appStatus, version: appVersion, lastUpdate: appDate },
    }

    if (isAdd) {
      const maxOrder = apps.reduce((m, a) => Math.max(m, a.sortOrder || 0), 0)
      const newId = apps.reduce((m, a) => Math.max(m, a.id), 0) + 1
      await addApp({
        id: newId,
        ...data,
        installations: 0,
        rating: 0,
        pinned: false,
        sortOrder: maxOrder + 1,
      })
    } else if (app) {
      await updateApp(app.id, data)
    }
    setSaving(false)
    onClose()
  }

  const selectClass = 'w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm outline-none focus:border-zinc-500 transition'
  const inputClass = 'w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm placeholder-zinc-500 outline-none focus:border-zinc-500 transition'
  const labelClass = 'block text-xs text-zinc-500 mb-1'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="p-1 text-zinc-500 hover:text-white transition">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {isDetails ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className={labelClass}>Região</div>
                  <div className="text-sm text-white">{app?.region}</div>
                </div>
                <div>
                  <div className={labelClass}>Conta Google</div>
                  <div className="text-sm text-white">{ACCOUNTS.google.find(a => a.id === app?.googleAccount)?.name || '---'}</div>
                </div>
                <div>
                  <div className={labelClass}>Conta Apple</div>
                  <div className="text-sm text-white">{ACCOUNTS.apple.find(a => a.id === app?.appleAccount)?.name || '---'}</div>
                </div>
              </div>
              <div>
                <div className={labelClass}>Play Store</div>
                <div className="text-sm text-white">{STATUS_LABELS[app?.playStore.status || 'unpublished']} {app?.playStore.version ? `· v${app.playStore.version}` : ''}</div>
              </div>
              <div>
                <div className={labelClass}>App Store</div>
                <div className="text-sm text-white">{STATUS_LABELS[app?.appStore.status || 'unpublished']} {app?.appStore.version ? `· v${app.appStore.version}` : ''}</div>
              </div>
            </div>
          ) : (
            <>
              {/* Name */}
              <div>
                <label className={labelClass}>Nome do App</label>
                <input className={inputClass} value={name} onChange={e => setName(e.target.value)} />
              </div>

              {/* Region */}
              <div>
                <label className={labelClass}>Região</label>
                <select className={selectClass} value={appRegion} onChange={e => setAppRegion(e.target.value)}>
                  <option value="Brasil">Brasil</option>
                  <option value="Internacional">Internacional</option>
                </select>
              </div>

              {/* Play Store */}
              <div className="space-y-3 p-4 bg-zinc-800/40 rounded-xl border border-zinc-700/50">
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Google Play</div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass}>Status</label>
                    <select className={selectClass} value={playStatus} onChange={e => setPlayStatus(e.target.value as AppStatus)}>
                      {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Versão</label>
                    <input className={inputClass} placeholder="x.y.z" value={playVersion} onChange={e => setPlayVersion(e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Data</label>
                    <input className={inputClass} type="date" value={playDate} onChange={e => setPlayDate(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Conta</label>
                  <select className={selectClass} value={googleAccount} onChange={e => setGoogleAccount(e.target.value)}>
                    {ACCOUNTS.google.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>

              {/* App Store */}
              <div className="space-y-3 p-4 bg-zinc-800/40 rounded-xl border border-zinc-700/50">
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Apple Store</div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass}>Status</label>
                    <select className={selectClass} value={appStatus} onChange={e => setAppStatus(e.target.value as AppStatus)}>
                      {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Versão</label>
                    <input className={inputClass} placeholder="x.y.z" value={appVersion} onChange={e => setAppVersion(e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Data</label>
                    <input className={inputClass} type="date" value={appDate} onChange={e => setAppDate(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Conta</label>
                  <select className={selectClass} value={appleAccount} onChange={e => setAppleAccount(e.target.value)}>
                    {ACCOUNTS.apple.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-800">
          <button onClick={onClose} className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition">
            {isDetails ? 'Fechar' : 'Cancelar'}
          </button>
          {!isDetails && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-sasi-red text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition flex items-center gap-2"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              Salvar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
