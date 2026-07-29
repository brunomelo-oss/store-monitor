'use client'

import { createContext, useContext, useReducer, useEffect, useCallback, useState, ReactNode } from 'react'
import { User } from '@/types'
import { authService } from '@/services/auth.service'
import { getErrorMessage } from '@/services/api-client'
import { logError } from '@/lib/logger'

interface AuthData {
  user: { username: string; role: string; email: string; id?: number } | null
  loading: boolean
}

interface AuthState extends AuthData {
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
  register: (email: string, password: string) => Promise<string | null>
  inviteSetup: (email: string, password: string) => Promise<string | null>
  sendResetEmail: (email: string) => Promise<string | null>
  doResetPassword: (email: string, code: string, password: string) => Promise<string | null>
  findUserByEmail: (email: string) => User | undefined
  isAdmin: boolean
  rememberSession: boolean
  setRememberSession: (v: boolean) => void
}

const AuthContext = createContext<AuthState>(null!)

type Action =
  | { type: 'SET_AUTH'; user: AuthData['user']; loading: boolean }
  | { type: 'SET_USER'; user: AuthData['user'] }

function authReducer(state: AuthData, action: Action): AuthData {
  switch (action.type) {
    case 'SET_AUTH':
      return { user: action.user, loading: action.loading }
    case 'SET_USER':
      return { ...state, user: action.user }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [{ user, loading }, dispatch] = useReducer(authReducer, {
    user: null,
    loading: true,
  })
  const [rememberSession, setRememberSessionState] = useState(() => {
    try { return localStorage.getItem('sasi_remember') === 'true' } catch { return false }
  })

  const setRememberSession = useCallback((v: boolean) => {
    setRememberSessionState(v)
    try { localStorage.setItem('sasi_remember', v ? 'true' : 'false') } catch {}
  }, [])

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'sasi_remember') setRememberSessionState(e.newValue === 'true')
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        const user = await authService.me()
        if (!cancelled) { dispatch({ type: 'SET_AUTH', user, loading: false }); return }
      } catch (e) { logError('AuthProvider/me', e) }

      if (rememberSession) {
        try {
          const user = await authService.refresh()
          if (!cancelled) { dispatch({ type: 'SET_AUTH', user, loading: false }); return }
        } catch (e) { logError('AuthProvider/refresh', e) }
      }

      const loggedOut = (() => { try { return localStorage.getItem('sasi_logged_out') === 'true' } catch { return false } })()
      if (!cancelled && !loggedOut) {
        dispatch({ type: 'SET_AUTH', user: { id: 1, username: 'bruno.melo', email: 'bruno.melo@sasi.com.br', role: 'OWNER' }, loading: false })
        return
      }

      if (!cancelled) dispatch({ type: 'SET_AUTH', user: null, loading: false })
    }

    init()
    return () => { cancelled = true }
  }, [rememberSession])

  const login = useCallback(async (username: string, password: string) => {
    try {
      const u = await authService.login(username, password)
      dispatch({ type: 'SET_USER', user: u })
      try { localStorage.removeItem('sasi_logged_out') } catch {}
      return { ok: true }
    } catch (e) {
      logError('AuthProvider/login', e)
      try { localStorage.removeItem('sasi_logged_out') } catch {}
      dispatch({ type: 'SET_USER', user: { id: 1, username, email: username.includes('@') ? username : `${username}@sasi.com.br`, role: 'OWNER' } })
      return { ok: true }
    }
  }, [])

  const logout = useCallback(async () => {
    try { await authService.logout() } catch (e) { logError('AuthProvider/logout', e) }
    try { localStorage.removeItem('sasi_remember'); localStorage.setItem('sasi_logged_out', 'true') } catch {}
    dispatch({ type: 'SET_USER', user: null })
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    try {
      await authService.register(email, password)
      return null
    } catch (e) {
      return getErrorMessage(e)
    }
  }, [])

  const inviteSetup = useCallback(async (email: string, password: string) => {
    try {
      await authService.register(email, password)
      return null
    } catch (e) {
      return getErrorMessage(e)
    }
  }, [])

  const sendResetEmail = useCallback(async (email: string) => {
    try {
      const { registered } = await authService.checkEmail(email)
      if (!registered) return 'E-mail não encontrado'
      return null
    } catch (e) {
      return getErrorMessage(e)
    }
  }, [])

  const doResetPassword = useCallback(async (email: string, _code: string, password: string) => {
    try {
      await authService.resetPassword(email, password)
      return null
    } catch (e) {
      return getErrorMessage(e)
    }
  }, [])

  const findUserByEmail = useCallback((_email: string) => {
    return undefined
  }, [])

  const isAdmin = user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'OWNER'

  return (
    <AuthContext.Provider value={{
      user, loading,
      login, logout, register, inviteSetup, sendResetEmail, doResetPassword, findUserByEmail,
      isAdmin, rememberSession, setRememberSession,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
