import { App, AppStatus } from '@/types'

const STATUS_ORDER: AppStatus[] = ['published', 'review', 'rejected', 'pending', 'unpublished']

export function daysSince(dateStr: string): number | null {
  if (!dateStr) return null
  const parts = dateStr.split('-')
  const d = new Date(+parts[0], +parts[1] - 1, +parts[2])
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export function parseLocalDate(dateStr: string): Date {
  const parts = dateStr.split('-')
  return new Date(+parts[0], +parts[1] - 1, +parts[2])
}

export function overallStatus(app: App): AppStatus {
  let worst: AppStatus = 'published'
  let hasData = false
  for (const s of [app.playStore, app.appStore]) {
    if (s.version && s.version !== '-') {
      hasData = true
      if (STATUS_ORDER.indexOf(s.status) > STATUS_ORDER.indexOf(worst)) {
        worst = s.status
      }
    }
  }
  return hasData ? worst : 'unpublished'
}

export function latestVersion(app: App): string {
  const stores = [app.playStore, app.appStore].filter(s => s.version && s.version !== '-')
  if (stores.length === 0) return '--'
  return stores.reduce((best, s) => {
    const d = s.lastUpdate ? parseLocalDate(s.lastUpdate) : new Date(0)
    const bd = best.lastUpdate ? parseLocalDate(best.lastUpdate) : new Date(0)
    return d >= bd ? s : best
  }).version
}

export function daysLabel(app: App): string {
  const d1 = daysSince(app.playStore.lastUpdate)
  const d2 = daysSince(app.appStore.lastUpdate)
  const d = d1 !== null && d2 !== null ? Math.max(d1, d2) : (d1 !== null ? d1 : d2)
  return d !== null ? d + 'd' : '---'
}

export function appImagePath(name: string): string {
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

export function formatDate(dateStr: string): string {
  if (!dateStr) return '--/--/----'
  const parts = dateStr.split('-')
  return `${parts[2]}/${parts[1]}/${parts[0]}`
}

export function validatePassword(pw: string): boolean {
  return pw.length >= 8 && /[a-zA-Z]/.test(pw) && /[!@#$%^&*()_+\-=\[\]{}|;':",.\/<>\?`~]/.test(pw)
}

export function validateVersion(v: string): boolean {
  return /^\d+\.\d+\.\d+$/.test(v)
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
    published: 'text-emerald-400',
    review: 'text-yellow-400',
    rejected: 'text-red-400',
    pending: 'text-blue-400',
    unpublished: 'text-zinc-500',
  }
  return map[status] || 'text-zinc-500'
}

export function statusBgColor(status: string): string {
  const map: Record<string, string> = {
    published: 'bg-emerald-500/10',
    review: 'bg-yellow-500/10',
    rejected: 'bg-red-500/10',
    pending: 'bg-blue-500/10',
    unpublished: 'bg-zinc-500/10',
  }
  return map[status] || 'bg-zinc-500/10'
}

export function ratingStars(rating: number): string[] {
  const stars: string[] = []
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) stars.push('full')
    else if (i - 0.5 <= rating) stars.push('half')
    else stars.push('empty')
  }
  return stars
}

export function formatInstallCount(n: number): string {
  return n.toLocaleString('pt-BR')
}

export function nextId(apps: App[]): number {
  return apps.reduce((m, a) => Math.max(m, a.id), 0) + 1
}
