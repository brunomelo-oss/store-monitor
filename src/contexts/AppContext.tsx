'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { App } from '@/types'
import { backendApi } from '@/lib/backend-api'
import { MOCK_APPS } from '@/lib/mock-data'
import { useAuth } from './AuthContext'

interface AppState {
  apps: App[]
  loading: boolean
  error: string | null
  mode: 'view' | 'edit'
  setMode: (m: 'view' | 'edit') => void
  addApp: (app: App) => Promise<string | null>
  updateApp: (id: number, data: Partial<App>) => Promise<string | null>
  removeApp: (id: number) => Promise<string | null>
  togglePin: (id: number) => Promise<string | null>
  moveApp: (id: number, dir: 1 | -1) => Promise<string | null>
  totalApps: number
  hasRealData: App[]
  resetData: () => Promise<string | null>
}

const AppContext = createContext<AppState>(null!)

export function AppProvider({ children }: { children: ReactNode }) {
  const [apps, setApps] = useState<App[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const { isAdmin, loading: authLoading } = useAuth()

  const load = useCallback(async () => {
    try {
      setError(null)
      const data = await backendApi.getApps()
      setApps(data)
    } catch {
      setError('Não foi possível carregar os apps. Verifique a conexão com o servidor.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading) load()
  }, [authLoading, load])

  const addApp = useCallback(async (app: App) => {
    try {
      const created = await backendApi.createApp(app)
      setApps(prev => [...prev, created])
      return null
    } catch (e: any) {
      return e.message
    }
  }, [])

  const updateApp = useCallback(async (id: number, data: Partial<App>) => {
    try {
      await backendApi.updateApp(id, data)
      setApps(prev => prev.map(a => a.id === id ? { ...a, ...data } as App : a))
      return null
    } catch (e: any) {
      return e.message
    }
  }, [])

  const removeApp = useCallback(async (id: number) => {
    try {
      await backendApi.deleteApp(id)
      setApps(prev => prev.filter(a => a.id !== id))
      return null
    } catch (e: any) {
      return e.message
    }
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
    try {
      const updated = await backendApi.moveApp(id, dir)
      setApps(updated)
      return null
    } catch (e: any) {
      return e.message
    }
  }, [])

  useEffect(() => {
    if (!isAdmin && mode === 'edit') setMode('view')
  }, [isAdmin, mode])

  const resetData = useCallback(async () => {
    try {
      const fresh = JSON.parse(JSON.stringify(MOCK_APPS))
      await backendApi.bulkReplace(fresh)
      setApps(fresh)
      return null
    } catch (e: any) {
      return e.message
    }
  }, [])

  const hasRealData = apps.filter(a =>
    (a.playStore.version && a.playStore.version !== '-') ||
    (a.appStore.version && a.appStore.version !== '-')
  )

  return (
    <AppContext.Provider value={{
      apps, loading, error, mode, setMode,
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
