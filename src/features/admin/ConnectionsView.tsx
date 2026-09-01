'use client'

import { useState } from 'react'
import { useLang } from '@/contexts/LanguageContext'
import { useToast } from '@/components/ui/Toast'
import { useConnections, useCreateConnection, useUpdateConnection, useDeleteConnection, useTestConnection } from '@/hooks/useStoreConnections'
import { useModal } from '@/contexts/ModalContext'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button, Input, Select } from '@/components/ui/primitives'
import { formatLocaleDate } from '@/lib/utils'
import type { StoreConnection, StoreKind } from '@/lib/types'
import { useShake } from '@/hooks/useShake'
import { Plus, Globe, Trash2, Zap, Smartphone } from 'lucide-react'

function ConnectionForm({ conn }: { conn: StoreConnection | null }) {
  const { t } = useLang()
  const { close } = useModal()
  const { show } = useToast()
  const { shaking, trigger: triggerShake } = useShake()
  const create = useCreateConnection()
  const update = useUpdateConnection()

  const [store, setStore] = useState<StoreKind>(conn?.store ?? 'GOOGLE')
  const [label, setLabel] = useState(conn?.label ?? '')

  const save = async () => {
    if (!label.trim()) { show('Informe um rótulo', 'error'); triggerShake(); return }
    try {
      if (conn) {
        await update.mutateAsync({ id: conn.id, input: { label } })
        show('Conexão atualizada', 'success')
      } else {
        await create.mutateAsync({ store, label: label.trim() })
        show('Conexão criada', 'success')
      }
      close()
    } catch {
      show('Falha ao salvar a conexão', 'error')
    }
  }

  return (
    <div className={`space-y-5 ${shaking ? 'animate-shake' : ''}`}>
      <Select value={store} onChange={e => setStore(e.target.value as StoreKind)} disabled={!!conn}>
        <option value="GOOGLE">Google Play</option>
        <option value="APPLE">App Store</option>
      </Select>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Rótulo da conta</label>
        <Input value={label} onChange={e => setLabel(e.target.value)} placeholder="Ex: SASI Holdings Limited" />
      </div>
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <Button variant="ghost" onClick={close}>{t('common.cancel')}</Button>
        <Button onClick={save}>{t('common.save')}</Button>
      </div>
    </div>
  )
}

export function ConnectionsView() {
  const { t, lang } = useLang()
  const locale = lang === 'pt' ? 'pt-BR' : lang === 'en' ? 'en-US' : 'ar-SA'
  const { open } = useModal()
  const { show } = useToast()
  const { data: connections = [], isLoading } = useConnections()
  const del = useDeleteConnection()
  const test = useTestConnection()

  const openForm = (conn: StoreConnection | null) =>
    open({
      title: conn ? 'Editar conexão' : 'Nova conexão',
      content: <ConnectionForm conn={conn} />,
    })

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('nav.connections')}</h1>
          <p className="text-sm text-muted-foreground mt-1">Contas de desenvolvedor conectadas às lojas.</p>
        </div>
        <Button onClick={() => openForm(null)}>
          <Plus size={14} /> Nova conexão
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : connections.length === 0 ? (
        <EmptyState icon={Globe} title="Nenhuma conexão" description="Conecte uma conta de desenvolvedor para monitorar seus apps." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {connections.map(c => {
            return (
              <div key={c.id} className="sasi-card rounded-xl p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.store === 'GOOGLE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                    <Smartphone size={18} />
                  </div>
                  <Badge variant={c.isActive ? 'success' : 'danger'} dot className="capitalize">
                    {c.isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{c.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.store}</p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border/60">
                  <span className="text-xs text-muted-foreground">
                    Sync: {c.lastSyncAt ? formatLocaleDate(c.lastSyncAt, locale, 'date') : '—'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={async () => {
                        try {
                          const r = await test.mutateAsync(c.id)
                          show(r.message, r.ok ? 'success' : 'warning')
                        } catch {
                          show('Falha no teste', 'error')
                        }
                      }}
                      disabled={test.isPending}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-emerald-400 transition hover:bg-surface"
                      title="Testar conexão"
                    >
                      <Zap size={13} />
                    </button>
                    <button onClick={() => openForm(c)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition hover:bg-surface" title="Editar">
                      <span className="text-xs">✎</span>
                    </button>
                    <button
                      onClick={() => { if (confirm('Excluir conexão?')) del.mutate(c.id) }}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-red-400 transition hover:bg-surface"
                      title="Excluir"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}