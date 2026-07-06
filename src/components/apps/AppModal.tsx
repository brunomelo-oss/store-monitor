'use client'

import { useState, useEffect } from 'react'
import { useLang } from '@/contexts/LanguageContext'
import { App, AppStatus } from '@/types'
import { useAppContext } from '@/contexts/AppContext'
import { ACCOUNTS } from '@/lib/mock-data'
import { validateVersion, overallStatus, formatDate } from '@/lib/utils'
import { X, Loader2, Smartphone, Apple, Globe, Tag } from 'lucide-react'

interface AppModalProps {
  app: App | null
  mode: 'edit' | 'add' | 'details'
  region: string
  onClose: () => void
}

const inputClass = 'w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm placeholder-zinc-500 outline-none focus:border-zinc-500 transition'
const selectClass = inputClass
const labelClass = 'block text-xs text-zinc-500 mb-1.5'

export function AppModal({ app, mode, region, onClose }: AppModalProps) {
  const { t } = useLang()
  const { addApp, updateApp, apps } = useAppContext()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [animIn, setAnimIn] = useState(false)
  const [shaking, setShaking] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setAnimIn(true), 10)
    return () => clearTimeout(timer)
  }, [])

  const isDetails = mode === 'details'
  const isAdd = mode === 'add'

  const [name, setName] = useState('')
  const [appRegion, setAppRegion] = useState('')
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
      setName(app.name); setAppRegion(app.region)
      setPlayStatus(app.playStore.status); setPlayVersion(app.playStore.version); setPlayDate(app.playStore.lastUpdate)
      setAppStatus(app.appStore.status); setAppVersion(app.appStore.version); setAppDate(app.appStore.lastUpdate)
      setGoogleAccount(app.googleAccount); setAppleAccount(app.appleAccount)
    } else if (isAdd) {
      setName(''); setAppRegion('')
      setPlayStatus('unpublished'); setPlayVersion(''); setPlayDate('')
      setAppStatus('unpublished'); setAppVersion(''); setAppDate('')
      setGoogleAccount('sasiHoldings'); setAppleAccount('sasTech')
    }
  }, [app, isAdd, region])

  const triggerShake = () => {
    setShaking(true)
    setTimeout(() => setShaking(false), 500)
  }

  const handleSave = async () => {
    setError('')
    const n = name.trim()
    if (!n) { setError(t('appModal.error.name')); triggerShake(); return }
    if (isAdd && !appRegion) { setError(t('appModal.error.region')); triggerShake(); return }
    if (playVersion && !validateVersion(playVersion)) { setError(t('appModal.error.versionPlay')); triggerShake(); return }
    if (appVersion && !validateVersion(appVersion)) { setError(t('appModal.error.versionApp')); triggerShake(); return }

    setSaving(true)
    const data = {
      name: n, region: appRegion as 'Brasil' | 'Internacional',
      googleAccount, appleAccount,
      playStore: { status: playStatus, version: playVersion, lastUpdate: playDate },
      appStore: { status: appStatus, version: appVersion, lastUpdate: appDate },
    }

    if (isAdd) {
      const maxOrder = apps.reduce((m, a) => Math.max(m, a.sortOrder || 0), 0)
      const newId = apps.reduce((m, a) => Math.max(m, a.id), 0) + 1
      await addApp({ id: newId, ...data, installations: 0, rating: 0, pinned: false, sortOrder: maxOrder + 1 })
    } else if (app) {
      await updateApp(app.id, data)
    }
    setSaving(false)
    onClose()
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${animIn ? 'bg-black/60' : 'bg-transparent'}`}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className={`w-full max-w-lg bg-zinc-900 border border-border rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto transition-all duration-200 ${animIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-base font-semibold text-white">{isAdd ? (appRegion ? t('appModal.title.addRegion', { region: appRegion }) : t('appModal.title.add')) : (isDetails ? app?.name || '' : t('appModal.title.edit'))}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition">
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
              <p className="text-xs text-red-400">{error}</p>
            </div>
          </div>
        )}

        <div className="p-6 space-y-5">
          {isDetails ? (
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

              <div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-2">
                  <Smartphone size={13} />
                  {t('appModal.label.accounts')}
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
                    <span className="text-white font-medium">{t('status.' + (app?.playStore.status || 'unpublished'))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">{t('appModal.label.version')}</span>
                    <span className="text-white">{app?.playStore.version || '--'}</span>
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
                    <span className="text-white font-medium">{t('status.' + (app?.appStore.status || 'unpublished'))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">{t('appModal.label.version')}</span>
                    <span className="text-white">{app?.appStore.version || '--'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">{t('appModal.label.date')}</span>
                    <span className="text-white">{app ? formatDate(app.appStore.lastUpdate) : '--'}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className={labelClass}>{t('appModal.label.name')}</label>
                <input className={inputClass} value={name} onChange={e => setName(e.target.value)} placeholder={t('appModal.placeholder.name')} />
              </div>

              <div className={shaking ? 'animate-shake' : ''}>
                <label className={labelClass}>{t('appModal.label.region')} <span className="text-red-500">*</span></label>
                <select className={selectClass} value={appRegion} onChange={e => setAppRegion(e.target.value)}>
                  {isAdd && <option value="">{t('appModal.placeholder.region')}</option>}
                  <option value="Brasil">{t('appModal.option.brasil')}</option>
                  <option value="Internacional">{t('appModal.option.internacional')}</option>
                </select>
              </div>

              <div className="space-y-3 p-4 bg-zinc-800/40 rounded-xl border border-zinc-700/50">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  <Smartphone size={13} />
                  {t('appModal.section.playStore')}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass}>{t('appModal.label.status')}</label>
                    <select className={selectClass} value={playStatus} onChange={e => setPlayStatus(e.target.value as AppStatus)}>
                      {['published', 'review', 'rejected', 'pending', 'unpublished'].map(k => <option key={k} value={k}>{t('status.' + k)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('appModal.label.version')}</label>
                    <input className={inputClass} placeholder={t('appModal.placeholder.version')} value={playVersion} onChange={e => setPlayVersion(e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('appModal.label.date')}</label>
                    <input className={inputClass} type="date" value={playDate} onChange={e => setPlayDate(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{t('appModal.label.account')}</label>
                  <select className={selectClass} value={googleAccount} onChange={e => setGoogleAccount(e.target.value)}>
                    {ACCOUNTS.google.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-3 p-4 bg-zinc-800/40 rounded-xl border border-zinc-700/50">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  <Apple size={13} />
                  {t('appModal.section.appStore')}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass}>{t('appModal.label.status')}</label>
                    <select className={selectClass} value={appStatus} onChange={e => setAppStatus(e.target.value as AppStatus)}>
                      {['published', 'review', 'rejected', 'pending', 'unpublished'].map(k => <option key={k} value={k}>{t('status.' + k)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('appModal.label.version')}</label>
                    <input className={inputClass} placeholder={t('appModal.placeholder.version')} value={appVersion} onChange={e => setAppVersion(e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('appModal.label.date')}</label>
                    <input className={inputClass} type="date" value={appDate} onChange={e => setAppDate(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{t('appModal.label.account')}</label>
                  <select className={selectClass} value={appleAccount} onChange={e => setAppleAccount(e.target.value)}>
                    {ACCOUNTS.apple.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button onClick={onClose} className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition">
            {isDetails ? t('common.close') : t('common.cancel')}
          </button>
          {!isDetails && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-sasi-red text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition flex items-center gap-2"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {t('common.save')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
