'use client'

import { useState } from 'react'
import { useLang } from '@/contexts/LanguageContext'
import type { App, AppStatus, Region } from '@/lib/types'
import { useCreateApp, useUpdateApp } from '@/hooks/useApps'
import { useShake } from '@/hooks/useShake'
import { useModal } from '@/contexts/ModalContext'
import { useToast } from '@/components/ui/Toast'
import { validateVersion } from '@/lib/utils'
import { Input, Select, Field, Button } from '@/components/ui/primitives'
import { Loader2, Smartphone, Apple } from 'lucide-react'

export interface AppModalProps {
  app?: App | null
  mode: 'edit' | 'add'
  region: Region
}

const STATUSES: AppStatus[] = ['published', 'review', 'rejected', 'pending', 'unpublished']

export function AppModal({ app, mode, region }: AppModalProps) {
  const { t } = useLang()
  const { close } = useModal()
  const { show } = useToast()
  const createAppMutation = useCreateApp()
  const updateAppMutation = useUpdateApp()
  const { shaking, trigger: triggerShake } = useShake()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState(app?.name ?? '')
  const [appRegion, setAppRegion] = useState<Region>(app?.region ?? region)
  const [googleAccount, setGoogleAccount] = useState(app?.googleAccount ?? 'sasiHoldings')
  const [appleAccount, setAppleAccount] = useState(app?.appleAccount ?? 'sasTech')
  const [playStatus, setPlayStatus] = useState<AppStatus>(app?.playStore.status ?? 'unpublished')
  const [playVersion, setPlayVersion] = useState(app?.playStore.version || '')
  const [playDate, setPlayDate] = useState(app?.playStore.lastUpdate || '')
  const [appStatus, setAppStatus] = useState<AppStatus>(app?.appStore.status ?? 'unpublished')
  const [appVersion, setAppVersion] = useState(app?.appStore.version || '')
  const [appDate, setAppDate] = useState(app?.appStore.lastUpdate || '')

  const handleSave = async () => {
    setError('')
    const n = name.trim()
    if (!n) { setError(t('appModal.error.name')); triggerShake(); return }
    if (!appRegion) { setError(t('appModal.error.region')); triggerShake(); return }
    if (playVersion && !validateVersion(playVersion)) { setError(t('appModal.error.versionPlay')); triggerShake(); return }
    if (appVersion && !validateVersion(appVersion)) { setError(t('appModal.error.versionApp')); triggerShake(); return }

    setSaving(true)
    const input = {
      name: n,
      region: appRegion,
      googleAccount,
      appleAccount,
      playStatus,
      playVersion,
      playLastUpdate: playDate,
      appStatus,
      appVersion,
      appLastUpdate: appDate,
    }
    try {
      if (mode === 'add') {
        await createAppMutation.mutateAsync(input)
        show(t('appModal.success.created'), 'success')
      } else if (app) {
        await updateAppMutation.mutateAsync({ id: app.id, input })
        show(t('appModal.success.updated'), 'success')
      }
      close()
    } catch {
      show(t('appModal.success.error'), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className={shaking ? 'animate-shake' : 'space-y-5'}>
        <Field label={t('appModal.label.name')}>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder={t('appModal.placeholder.name')} />
        </Field>

        <Field label={t('appModal.label.region')}>
          <Select value={appRegion} onChange={e => setAppRegion(e.target.value as Region)}>
            <option value="Brasil">{t('appModal.option.brasil')}</option>
            <option value="Internacional">{t('appModal.option.internacional')}</option>
          </Select>
        </Field>

        <div className="space-y-3 p-4 bg-surface/60 rounded-xl border border-border">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Smartphone size={13} />
            {t('appModal.section.playStore')}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label={t('appModal.label.status')}>
              <Select value={playStatus} onChange={e => setPlayStatus(e.target.value as AppStatus)}>
                {STATUSES.map(k => <option key={k} value={k}>{t('status.' + k)}</option>)}
              </Select>
            </Field>
            <Field label={t('appModal.label.version')}>
              <Input placeholder={t('appModal.placeholder.version')} value={playVersion} onChange={e => setPlayVersion(e.target.value)} />
            </Field>
            <Field label={t('appModal.label.date')}>
              <Input type="date" value={playDate} onChange={e => setPlayDate(e.target.value)} />
            </Field>
          </div>
          <Field label={t('appModal.label.account')}>
            <Select value={googleAccount} onChange={e => setGoogleAccount(e.target.value)}>
              <option value="sasTech">SAS TECH SOLUTIONS LLC</option>
              <option value="sasiHoldings">SASI Holdings Limited</option>
            </Select>
          </Field>
        </div>

        <div className="space-y-3 p-4 bg-surface/60 rounded-xl border border-border">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Apple size={13} />
            {t('appModal.section.appStore')}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label={t('appModal.label.status')}>
              <Select value={appStatus} onChange={e => setAppStatus(e.target.value as AppStatus)}>
                {STATUSES.map(k => <option key={k} value={k}>{t('status.' + k)}</option>)}
              </Select>
            </Field>
            <Field label={t('appModal.label.version')}>
              <Input placeholder={t('appModal.placeholder.version')} value={appVersion} onChange={e => setAppVersion(e.target.value)} />
            </Field>
            <Field label={t('appModal.label.date')}>
              <Input type="date" value={appDate} onChange={e => setAppDate(e.target.value)} />
            </Field>
          </div>
          <Field label={t('appModal.label.account')}>
            <Select value={appleAccount} onChange={e => setAppleAccount(e.target.value)}>
              <option value="sasTech">SAS TECH SOLUTIONS LLC</option>
              <option value="semedPvh">SEMED PVH</option>
              <option value="sebraeRo">SEBRAE - RO</option>
              <option value="sasiComunicacao">SASI COMUNICACAO AGIL LTDA</option>
            </Select>
          </Field>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <Button variant="ghost" onClick={close}>{t('common.cancel')}</Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 size={14} className="animate-spin" />}
          {t('common.save')}
        </Button>
      </div>
    </div>
  )
}