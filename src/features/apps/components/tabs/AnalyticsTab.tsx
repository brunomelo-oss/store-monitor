'use client'

import type { AppDetail } from '@/features/apps/hooks/useAppDetail'
import { MetricCard } from '@/components/MetricCard'
import { EmptyState } from '@/components/EmptyState'
import { BarChart3, Smartphone, AlertTriangle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function AnalyticsTab({ app }: { app: AppDetail }) {
  const analytics = app.analytics || []
  const chartData = analytics.slice(0, 30).reverse()

  return (
    <div className="space-y-6">
      {chartData.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <MetricCard title="Downloads" value={chartData.reduce((s, a) => s + (a.downloads || 0), 0).toLocaleString()} icon={<BarChart3 size={16} />} />
            <MetricCard title="Instalações" value={chartData.reduce((s, a) => s + (a.installs || 0), 0).toLocaleString()} icon={<Smartphone size={16} />} />
            <MetricCard title="Page Views" value={chartData.reduce((s, a) => s + (a.pageViews || 0), 0).toLocaleString()} icon={<BarChart3 size={16} />} />
            <MetricCard title="Crashes" value={chartData.reduce((s, a) => s + (a.crashes || 0), 0).toLocaleString()} variant={chartData.some((a) => a.crashes > 0) ? 'warning' : 'default'} icon={<AlertTriangle size={16} />} />
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-4">Downloads nos últimos 30 dias</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" tickFormatter={(v: string) => new Date(v).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} />
                <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="downloads" stroke="#22c55e" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="installs" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <EmptyState icon={BarChart3} title="Sem dados analíticos" description="Nenhum dado de analytics disponível para este aplicativo" />
      )}
    </div>
  )
}
