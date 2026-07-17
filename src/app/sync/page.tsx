'use client'

import { useAuth } from '@/contexts/AuthContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { useSyncHistory } from '@/features/sync/hooks/useSyncHistory'
import { useSyncJobs } from '@/features/sync/hooks/useSyncJobs'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ErrorState } from '@/components/ErrorState'
import { Loader2, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'

const statusIcon: Record<string, React.ReactNode> = {
  SUCCESS: <CheckCircle size={16} className="text-green-500" />,
  FAILED: <XCircle size={16} className="text-red-500" />,
  PENDING: <Clock size={16} className="text-yellow-500" />,
  RUNNING: <Loader2 size={16} className="animate-spin text-blue-500" />,
  PARTIAL: <AlertTriangle size={16} className="text-orange-500" />,
}

export default function SyncPage() {
  const { user, loading } = useAuth()
  const { data: history, isLoading: historyLoading, error: historyError } = useSyncHistory()
  const { data: jobs, isLoading: jobsLoading, error: jobsError } = useSyncJobs()

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <ErrorBoundary>
        <div>
          <h1 className="text-2xl font-bold mb-2">Sincronização</h1>
          <p className="text-muted-foreground">Histórico e monitoramento de sincronização com as lojas</p>
        </div>

        <section>
          <h2 className="text-lg font-semibold mb-4">Histórico de Sincronização</h2>
          {historyError ? <ErrorState onRetry={() => window.location.reload()} /> : historyLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 size={16} className="animate-spin" />
              <span>Carregando...</span>
            </div>
          ) : (
            <div className="border rounded-lg overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">App</th>
                    <th className="text-left px-4 py-3 font-medium">Loja</th>
                    <th className="text-left px-4 py-3 font-medium">Tipo</th>
                    <th className="text-left px-4 py-3 font-medium">Disparo</th>
                    <th className="text-right px-4 py-3 font-medium">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {history?.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">{statusIcon[item.status] || <Clock size={16} />}</td>
                      <td className="px-4 py-3 font-medium">{item.appId}</td>
                      <td className="px-4 py-3">{item.store}</td>
                      <td className="px-4 py-3 text-muted-foreground">{item.type}</td>
                      <td className="px-4 py-3 text-muted-foreground">{item.triggerType}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {new Date(item.startedAt).toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                  {(!history || history.length === 0) && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                        Nenhuma sincronização realizada ainda
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Jobs</h2>
          {jobsError ? <ErrorState onRetry={() => window.location.reload()} /> : jobsLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 size={16} className="animate-spin" />
              <span>Carregando...</span>
            </div>
          ) : (
            <div className="border rounded-lg overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Tipo</th>
                    <th className="text-left px-4 py-3 font-medium">Tentativas</th>
                    <th className="text-left px-4 py-3 font-medium">Erro</th>
                    <th className="text-right px-4 py-3 font-medium">Criado em</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {jobs?.map((job) => (
                    <tr key={job.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">{statusIcon[job.status] || <Clock size={16} />}</td>
                      <td className="px-4 py-3 font-medium">{job.type}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {job.retryCount}/{job.maxRetries}
                      </td>
                      <td className="px-4 py-3 text-red-500 max-w-[300px] truncate">
                        {job.lastError || '-'}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {new Date(job.createdAt).toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                  {(!jobs || jobs.length === 0) && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        Nenhum job encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
        </ErrorBoundary>
      </div>
    </AppLayout>
  )
}
