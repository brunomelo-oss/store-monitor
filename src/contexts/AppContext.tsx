'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { App } from '@/types'
import { localStorageApi } from '@/lib/storage'
import { MOCK_APPS } from '@/lib/mock-data'
import { useAuth } from './AuthContext'

interface AppState {
  apps: App[]
  loading: boolean
  mode: 'view' | 'edit'
  setMode: (m: 'view' | 'edit') => void
  addApp: (app: App) => Promise<void>
  updateApp: (id: number, data: Partial<App>) => Promise<void>
  removeApp: (id: number) => Promise<void>
  togglePin: (id: number) => Promise<void>
  moveApp: (id: number, dir: 1 | -1) => Promise<void>
  totalApps: number
  hasRealData: App[]
  resetData: () => Promise<void>
}

const AppContext = createContext<AppState>(null!)

export function AppProvider({ children }: { children: ReactNode }) {
  const [apps, setApps] = useState<App[]>([])
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const { isAdmin } = useAuth()

  const load = useCallback(async () => {
    const data = await localStorageApi.getApps()
    setApps(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const persist = useCallback(async (newApps: App[]) => {
    setApps(newApps)
    await localStorageApi.saveApps(newApps)
  }, [])

  const addApp = useCallback(async (app: App) => {
    const next = [...apps, app]
    await persist(next)
  }, [apps, persist])

  const updateApp = useCallback(async (id: number, data: Partial<App>) => {
    const next = apps.map(a => a.id === id ? { ...a, ...data } as App : a)
    await persist(next)
  }, [apps, persist])

  const removeApp = useCallback(async (id: number) => {
    const next = apps.filter(a => a.id !== id)
    await persist(next)
  }, [apps, persist])

  const togglePin = useCallback(async (id: number) => {
    const app = apps.find(a => a.id === id)
    if (!app) return
    const pinnedCount = apps.filter(a => a.pinned).length
    if (!app.pinned && pinnedCount >= 3) return
    const next = apps.map(a => a.id === id ? { ...a, pinned: !a.pinned } as App : a)
    await persist(next)
  }, [apps, persist])

  const moveApp = useCallback(async (id: number, dir: 1 | -1) => {
    const sorted = [...apps].filter(a => !a.pinned).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    const idx = sorted.findIndex(a => a.id === id)
    if (idx === -1) return
    const target = idx + dir
    if (target < 0 || target >= sorted.length) return
    const tmp = sorted[idx].sortOrder
    sorted[idx].sortOrder = sorted[target].sortOrder
    sorted[target].sortOrder = tmp
    const updatedIds = new Set(sorted.map(a => a.id))
    const next = apps.map(a => updatedIds.has(a.id) ? (sorted.find(s => s.id === a.id) || a) : a)
    await persist(next)
  }, [apps, persist])

  // Non-admin users are locked to view mode
  useEffect(() => {
    if (!isAdmin && mode === 'edit') setMode('view')
  }, [isAdmin, mode])

  const resetData = useCallback(async () => {
    const fresh = JSON.parse(JSON.stringify(MOCK_APPS))
    setApps(fresh)
    await localStorageApi.saveApps(fresh)
  }, [])

  const hasRealData = apps.filter(a =>
    (a.playStore.version && a.playStore.version !== '-') ||
    (a.appStore.version && a.appStore.version !== '-')
  )

  return (
    <AppContext.Provider value={{
      apps, loading, mode, setMode,
      addApp, updateApp, removeApp, togglePin, moveApp, resetData,
      totalApps: apps.length, hasRealData,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be inside AppProvider')
  return ctx
}
