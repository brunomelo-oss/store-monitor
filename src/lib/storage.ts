import { App, User, Invite } from '@/types'
import { MOCK_APPS, DEFAULT_USERS } from './mock-data'

const LS_APPS = 'sasi_dashboard_apps'
const LS_USERS = 'sasi_users'
const LS_INVITES = 'sasi_invites'
const LS_THEME = 'sasi_theme'
const LS_SESSION = 'sasi_session'

export const localStorageApi = {
  async getApps() {
    const saved = localStorage.getItem(LS_APPS)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed && parsed._v === 1) {
          return parsed.apps.map(normalizeApp)
        }
      } catch { /* fallback */ }
    }
    return JSON.parse(JSON.stringify(MOCK_APPS))
  },

  async saveApps(apps: App[]) {
    localStorage.setItem(LS_APPS, JSON.stringify({ _v: 1, apps }))
  },

  async getUsers() {
    const saved = localStorage.getItem(LS_USERS)
    if (saved) {
      try { return JSON.parse(saved) }
      catch { return JSON.parse(JSON.stringify(DEFAULT_USERS)) }
    }
    localStorage.setItem(LS_USERS, JSON.stringify(DEFAULT_USERS))
    return JSON.parse(JSON.stringify(DEFAULT_USERS))
  },

  async saveUsers(users: User[]) {
    localStorage.setItem(LS_USERS, JSON.stringify(users))
  },

  async getInvites(): Promise<Invite[]> {
    const saved = localStorage.getItem(LS_INVITES)
    return saved ? JSON.parse(saved) : []
  },

  async saveInvites(invites: Invite[]) {
    localStorage.setItem(LS_INVITES, JSON.stringify(invites))
  },

  async getTheme() {
    return localStorage.getItem(LS_THEME)
  },

  async saveTheme(theme: string) {
    localStorage.setItem(LS_THEME, theme)
  },
}

export function getSession(): { username: string; role: string; email: string } | null {
  const raw = sessionStorage.getItem(LS_SESSION)
  if (!raw) return null
  try {
    const s = JSON.parse(raw)
    if (s && s.username) return s
  } catch { /* ignore */ }
  return null
}

export function setSession(user: { username: string; role: string; email: string }) {
  sessionStorage.setItem(LS_SESSION, JSON.stringify(user))
}

export function clearSession() {
  sessionStorage.removeItem(LS_SESSION)
  sessionStorage.removeItem('sasi_loginAttempts')
}

function normalizeApp(a: App, i: number): App {
  return {
    ...a,
    pinned: a.pinned === undefined ? false : a.pinned,
    sortOrder: a.sortOrder === undefined ? i : a.sortOrder,
    installations: a.installations || 0,
    rating: a.rating || 0,
  }
}

// Future: Backend API implementation
// export const backendApi: AppApi = { ... }
