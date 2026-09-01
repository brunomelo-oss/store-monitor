'use client'

import { createContext, useContext, useReducer, useEffect, useCallback, useState, type ReactNode } from 'react'
import { gateways } from '@/data'
import { getErrorMessage } from '@/data/api-client'
import type { AuthUser, Role } from '@/lib/types'

interface AuthData {
  user: AuthUser | null
  loading: boolean
  ready: boolean
}

interface AuthState extends AuthData {
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
  inviteSetup: (email: string, password: string) => Promise<string | null>
  resetPassword: (email: string, password: string) => Promise<string | null>
  sendResetEmail: (email: string) => Promise<string | null>
  doResetPassword: (email: string, password: string) => Promise<string | null>
  isAdmin: boolean
  rememberSession: boolean
  setRememberSession: (v: boolean) => void
}

const AuthContext = createContext<AuthState>(null!)

type Action =
  | { type: 'SET_AUTH'; user: AuthUser | null; ready: boolean }
  | { type: 'SET_USER'; user: AuthUser | null }

function authReducer(state: AuthData, action: Action): AuthData {
  switch (action.type) {
    case 'SET_AUTH':
      return { user: action.user, loading: false, ready: action.ready }
    case 'SET_USER':
      return { ...state, user: action.user }
  }
}

const STORAGE_REMEMBER = 'sasi_remember'
const STORAGE_LOGGED_OUT = 'sasi_logged_out'

function readLocal(key: string, fallback: boolean): boolean {
  try { return localStorage.getItem(key) === 'true' } catch { return fallback }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [{ user, loading, ready }, dispatch] = useReducer(authReducer, {
    user: null,
    loading: true,
    ready: false,
  })
  const [rememberSession, setRememberSessionState] = useState<boolean>(() => readLocal(STORAGE_REMEMBER, false))

  const setRememberSession = useCallback((v: boolean) => {
    setRememberSessionState(v)
    try { localStorage.setItem(STORAGE_REMEMBER, v ? 'true' : 'false') } catch {}
  }, [])

  useEffect(() => {
    let cancelled = false

    async function init() {
      const loggedOut = readLocal(STORAGE_LOGGED_OUT, false)
      if (loggedOut) {
        if (!cancelled) dispatch({ type: 'SET_AUTH', user: null, ready: true })
        return
      }
      try {
        const user = await gateways.auth.me()
        if (!cancelled) { dispatch({ type: 'SET_AUTH', user, ready: true }); return }
      } catch {
        /* fallthrough: no session */
      }
      if (!cancelled) dispatch({ type: 'SET_AUTH', user: null, ready: true })
    }

    init()
    return () => { cancelled = true }
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    try {
      const u = await gateways.auth.login(username, password)
      try { localStorage.removeItem(STORAGE_LOGGED_OUT) } catch {}
      dispatch({ type: 'SET_USER', user: u })
      return { ok: true }
    } catch (e) {
      return { ok: false, error: getErrorMessage(e) }
    }
  }, [])

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_REMEMBER)
      localStorage.setItem(STORAGE_LOGGED_OUT, 'true')
    } catch {}
    dispatch({ type: 'SET_USER', user: null })
  }, [])

  const inviteSetup = useCallback(async (email: string, password: string) => {
    try {
      await gateways.auth.setupAccount(email, password)
      return null
    } catch (e) {
      return getErrorMessage(e)
    }
  }, [])

  const resetPassword = useCallback(async (email: string, password: string) => {
    try {
      await gateways.auth.resetPassword(email, password)
      return null
    } catch (e) {
      return getErrorMessage(e)
    }
  }, [])

  const sendResetEmail = useCallback(async (email: string) => {
    try {
      const { registered } = await gateways.auth.checkEmail(email)
      if (!registered) return 'Email não registrado'
      return null
    } catch (e) {
      return getErrorMessage(e)
    }
  }, [])

  const doResetPassword = useCallback(async (email: string, password: string) => {
    try {
      await gateways.auth.resetPassword(email, password)
      return null
    } catch (e) {
      return getErrorMessage(e)
    }
  }, [])

  const isAdmin = user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'OWNER'

  return (
    <AuthContext.Provider value={{
      user, loading, ready,
      login, logout, inviteSetup, resetPassword, sendResetEmail, doResetPassword, isAdmin, rememberSession, setRememberSession,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export type { Role }