import type { App, AppIssue, AppStatus } from './types'

const STATUS_ORDER: AppStatus[] = ['published', 'review', 'rejected', 'pending', 'unpublished']

export function safeDate(dateStr?: string | null): Date | null {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? null : d
}

export function formatLocaleDate(dateStr: string | undefined | null, locale = 'pt-BR', style: 'datetime' | 'date' | 'time' = 'datetime'): string {
  const d = safeDate(dateStr)
  if (!d) return '—'
  if (style === 'date') return d.toLocaleDateString(locale)
  if (style === 'time') return d.toLocaleTimeString(locale)
  return d.toLocaleString(locale)
}

export function daysSince(dateStr: string): number | null {
  if (!dateStr) return null
  const parts = dateStr.split('-')
  const d = new Date(+parts[0], +parts[1] - 1, +parts[2])
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export function overallStatus(app: App): AppStatus {
  let worst: AppStatus = 'published'
  let hasData = false
  for (const s of [app.playStore, app.appStore]) {
    if (s.version && s.version !== '-') {
      hasData = true
      if (STATUS_ORDER.indexOf(s.status) > STATUS_ORDER.indexOf(worst)) worst = s.status
    }
  }
  return hasData ? worst : 'unpublished'
}

export function latestVersion(app: App): string {
  const stores = [app.playStore, app.appStore].filter(s => s.version && s.version !== '-')
  if (stores.length === 0) return '--'
  return stores.reduce((best, s) => {
    const d = s.lastUpdate ? new Date(s.lastUpdate).getTime() : 0
    const bd = best.lastUpdate ? new Date(best.lastUpdate).getTime() : 0
    return d >= bd ? s : best
  }).version
}

function appImagePath(name: string): string {
  const map: Record<string, string> = {
    'IIN+': 'IIN +.png',
    'SASI': 'SASI-4.png',
    'SASI PRO': 'SASI PRO.png',
    'SASI Console': 'moni.png',
    'TCE': 'TCE - AM.png',
    'MEU PET AM': 'Meu Pet AM.png',
    'ACELERA LADÁRIO': 'Acelera Ladário.png',
    'BORBA AM': 'Borba - AM.png',
    'SEMED PVH': 'SEMED PVH.png',
    'URUCURITUBA AM': 'Urucurituba - AM.png',
    'Sebrae-RO': 'Sebrae - RO.png',
    'Emprega-AM': 'EmpregaAM.png',
    'SRG': 'SRG.png',
    'Right to Food': 'Right to Food.png',
    'SALGA': 'SALGA.png',
  }
  const file = map[name]
  return file ? `/assets/${file}` : ''
}

export function appIcon(app: App): string {
  if (app.icon) return app.icon
  return appImagePath(app.name)
}

export function nextId(rows: { id: number }[]): number {
  return rows.reduce((m, r) => Math.max(m, r.id), 0) + 1
}

export function daysLabel(app: App): string {
  const d1 = daysSince(app.playStore.lastUpdate)
  const d2 = daysSince(app.appStore.lastUpdate)
  const d = d1 !== null && d2 !== null ? Math.max(d1, d2) : (d1 !== null ? d1 : d2)
  return d !== null ? d + 'd' : '---'
}

export function getAccountName(store: 'google' | 'apple', id: string): string {
  const accounts: Record<string, { id: string; name: string }[]> = {
    google: [
      { id: 'sasTech', name: 'SAS TECH SOLUTIONS LLC' },
      { id: 'sasiHoldings', name: 'SASI Holdings Limited' },
    ],
    apple: [
      { id: 'sasTech', name: 'SAS TECH SOLUTIONS LLC' },
      { id: 'semedPvh', name: 'SEMED PVH' },
      { id: 'sebraeRo', name: 'SEBRAE - RO' },
      { id: 'sasiComunicacao', name: 'SASI COMUNICACAO AGIL LTDA' },
    ],
  }
  const found = accounts[store].find(a => a.id === id)
  return found ? found.name : '---'
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    published: 'text-emerald-500',
    review: 'text-yellow-500',
    rejected: 'text-red-500',
    pending: 'text-blue-500',
    unpublished: 'text-muted-foreground',
  }
  return map[status] ?? 'text-muted-foreground'
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    published: 'Publicado',
    review: 'Em revisão',
    rejected: 'Rejeitado',
    pending: 'Pendente',
    unpublished: 'Não publicado',
  }
  return map[status] ?? status
}

export function formatInstallCount(n: number): string {
  return n.toLocaleString('pt-BR')
}

export function validateVersion(v: string): boolean {
  return /^\d+\.\d+\.\d+$/.test(v)
}

export function appIssues(app: App): AppIssue[] {
  return app.issues ?? []
}

export function hasIssues(app: App): boolean {
  return appIssues(app).length > 0
}