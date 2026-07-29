'use client'

import { useState } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AppLayout } from '@/components/layout/AppLayout'
import { ConnectionWizard } from '@/components/ConnectionWizard'
import { useToast } from '@/components/Toast'
import type { StoreConnection } from '@/services/store-connections.service'
import { Globe, Apple, CheckCircle, XCircle, Trash2, RefreshCw } from 'lucide-react'
import { Spinner } from '@/components/LoadingSkeleton'
import { EmptyState } from '@/components/EmptyState'

const MOCK: StoreConnection[] = [
  { id: 1, store: 'GOOGLE', label: 'SAS TECH SOLUTIONS LLC', isActive: true, lastSyncAt: '2026-06-22T12:00:00Z' },
  { id: 2, store: 'APPLE', label: 'SASI COMUNICACAO AGIL LTDA', isActive: true, lastSyncAt: '2026-06-21T11:00:00Z' },
]

function ConnectionsPageInner() {
  const { show } = useToast()
  const [connections, setConnections] = useState<StoreConnection[]>(MOCK)
  const [wizard, setWizard] = useState<'GOOGLE' | 'APPLE' | null>(null)
  const [editing, setEditing] = useState<StoreConnection | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const hasGoogle = connections.some(c => c.store === 'GOOGLE')
  const hasApple = connections.some(c => c.store === 'APPLE')

  const handleCreate = async (store: 'GOOGLE' | 'APPLE', label: string, _credentials: Record<string, unknown>) => {
    const newConn: StoreConnection = {
      id: Date.now(),
      store,
      label,
      isActive: true,
      lastSyncAt: null,
    }
    setConnections(prev => [...prev, newConn])
    setWizard(null)
    show('Conexão criada com sucesso', 'success')
  }

  const handleUpdate = async (id: number, label: string, _credentials: Record<string, unknown>) => {
    setConnections(prev => prev.map(c => c.id === id ? { ...c, label } : c))
    setEditing(null)
    show('Conexão atualizada com sucesso', 'success')
  }

  const handleDelete = async (id: number) => {
    setConnections(prev => prev.filter(c => c.id !== id))
    setDeleteConfirm(null)
    show('Conexão excluída', 'success')
  }

  const handleTest = async (id: number) => {
    show('Conexão válida!', 'success')
  }

  const storeIcon = (store: string) => {
    if (store === 'GOOGLE') return <Globe size={24} className="text-green-500" />
    return <Apple size={24} className="text-zinc-400" />
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Conexões com Lojas</h1>
            <p className="text-muted-foreground mt-1">Configure as credenciais para conectar com Google Play Console e App Store Connect</p>
          </div>
          <button
            onClick={() => setConnections([...MOCK])}
            className="p-2 rounded-lg border hover:bg-muted/50 transition-colors"
            title="Restaurar dados mockados"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="border rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Globe size={24} className="text-green-500" />
              <div>
                <h3 className="font-semibold">Google Play Console</h3>
                <p className="text-sm text-muted-foreground">Service Account com permissão de acesso à API</p>
              </div>
            </div>
            {hasGoogle ? (
              <div className="flex items-center gap-2 text-sm text-green-500">
                <CheckCircle size={14} />
                Configurado
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Não configurado</p>
            )}
            <button
              onClick={() => setWizard('GOOGLE')}
              className="w-full px-4 py-2 text-sm rounded-lg border hover:bg-muted/50 transition-colors"
            >
              {hasGoogle ? 'Alterar Credenciais Google' : 'Configurar Google Play'}
            </button>
          </div>

          <div className="border rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Apple size={24} className="text-zinc-400" />
              <div>
                <h3 className="font-semibold">App Store Connect</h3>
                <p className="text-sm text-muted-foreground">API Key com permissão de acesso</p>
              </div>
            </div>
            {hasApple ? (
              <div className="flex items-center gap-2 text-sm text-green-500">
                <CheckCircle size={14} />
                Configurado
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Não configurado</p>
            )}
            <button
              onClick={() => setWizard('APPLE')}
              className="w-full px-4 py-2 text-sm rounded-lg border hover:bg-muted/50 transition-colors"
            >
              {hasApple ? 'Alterar Credenciais Apple' : 'Configurar App Store'}
            </button>
          </div>
        </div>

        {connections.length > 0 ? (
          <div>
            <h2 className="text-lg font-semibold mb-4">Conexões Existentes</h2>
            <div className="space-y-3">
              {connections.map(conn => (
                <div key={conn.id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    {storeIcon(conn.store)}
                    <div>
                      <h4 className="font-medium">{conn.label}</h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span>Último sync: {conn.lastSyncAt ? new Date(conn.lastSyncAt).toLocaleString('pt-BR') : 'Nunca'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {conn.isActive ? (
                      <CheckCircle size={14} className="text-green-500" />
                    ) : (
                      <XCircle size={14} className="text-red-500" />
                    )}
                    <button
                      onClick={() => handleTest(conn.id)}
                      className="px-3 py-1.5 text-xs rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      Testar
                    </button>
                    <button
                      onClick={() => setEditing(conn)}
                      className="px-3 py-1.5 text-xs rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      Editar
                    </button>
                    {deleteConfirm === conn.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(conn.id)}
                          className="px-2 py-1.5 text-xs rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-2 py-1.5 text-xs rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(conn.id)}
                        className="p-1.5 rounded-lg border hover:bg-red-500/10 hover:text-red-400 transition-colors text-muted-foreground"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Globe}
            title="Nenhuma conexão configurada"
            description="Configure as credenciais do Google Play Console e App Store Connect para começar a sincronizar automaticamente."
          />
        )}
      </div>

      {wizard && (
        <ConnectionWizard
          store={wizard}
          onClose={() => setWizard(null)}
          onSubmit={(label, credentials) => handleCreate(wizard, label, credentials)}
        />
      )}

      {editing && (
        <ConnectionWizard
          store={editing.store}
          onClose={() => setEditing(null)}
          initialLabel={editing.label}
          onSubmit={(label, credentials) => handleUpdate(editing.id, label, credentials)}
        />
      )}
    </AppLayout>
  )
}

export default function ConnectionsPage() {
  return (
    <AuthGuard>
      <ErrorBoundary>
        <ConnectionsPageInner />
      </ErrorBoundary>
    </AuthGuard>
  )
}
