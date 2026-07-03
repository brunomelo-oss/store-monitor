'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { App } from '@/types'
import { backendApi } from '@/lib/backend-api'
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
  togglePin: (id: number) => Promise<string | null>
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
  const { isAdmin, loading: authLoading } = useAuth()

  const load = useCallback(async () => {
    const data = await backendApi.getApps()
    setApps(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!authLoading) load()
  }, [authLoading, load])

  const persist = useCallback(async (newApps: App[]) => {
    setApps(newApps)
  }, [])

  const addApp = useCallback(async (app: App) => {
    const created = await backendApi.createApp(app)
    setApps(prev => [...prev, created])
  }, [])

  const updateApp = useCallback(async (id: number, data: Partial<App>) => {
    await backendApi.updateApp(id, data)
    setApps(prev => prev.map(a => a.id === id ? { ...a, ...data } as App : a))
  }, [])

  const removeApp = useCallback(async (id: number) => {
    await backendApi.deleteApp(id)
    setApps(prev => prev.filter(a => a.id !== id))
  }, [])

  const togglePin = useCallback(async (id: number) => {
    try {
      const updated = await backendApi.togglePin(id)
      setApps(prev => prev.map(a => a.id === id ? updated : a))
      return null
    } catch (e: any) {
      return e.message
    }
  }, [])

  const moveApp = useCallback(async (id: number, dir: 1 | -1) => {
    const updated = await backendApi.moveApp(id, dir)
    setApps(updated)
  }, [])

  useEffect(() => {
    if (!isAdmin && mode === 'edit') setMode('view')
  }, [isAdmin, mode])

  const resetData = useCallback(async () => {
    const fresh = JSON.parse(JSON.stringify(MOCK_APPS))
    await backendApi.bulkReplace(fresh)
    setApps(fresh)
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
