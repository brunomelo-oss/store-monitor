'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { User } from '@/types'
import { authService } from '@/services/auth.service'

interface AuthState {
  user: { username: string; role: string; email: string; id?: number } | null
  loading: boolean
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
  register: (email: string, password: string) => Promise<string | null>
  inviteSetup: (email: string, password: string) => Promise<string | null>
  sendResetEmail: (email: string) => Promise<string | null>
  doResetPassword: (email: string, code: string, password: string) => Promise<string | null>
  findUserByEmail: (email: string) => User | undefined
  isAdmin: boolean
  isOwner: boolean
  isManager: boolean
}

const AuthContext = createContext<AuthState>(null!)

let _rememberSession = false

export function setRememberSession(v: boolean) {
  _rememberSession = v
  try { localStorage.setItem('sasi_remember', v ? 'true' : 'false') } catch {}
}

function getRememberSession(): boolean {
  if (_rememberSession) return true
  try { return localStorage.getItem('sasi_remember') === 'true' } catch { return false }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthState['user']>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        const { user } = await authService.me()
        if (!cancelled) setUser(user)
        return
      } catch {}

      if (!getRememberSession()) return

      try {
        const { user } = await authService.refresh()
        if (!cancelled) setUser(user)
      } catch {}
    }

    init().finally(() => {
      if (!cancelled) setLoading(false)
    })

    return () => { cancelled = true }
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    try {
      const u = await authService.login(username, password)
      setUser(u)
      return { ok: true }
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Erro ao fazer login' }
    }
  }, [])

  const logout = useCallback(async () => {
    try { await authService.logout() } catch {}
    try { localStorage.removeItem('sasi_remember') } catch {}
    setUser(null)
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    try {
      await authService.register(email, password)
      return null
    } catch (e) {
      return e instanceof Error ? e.message : 'Erro ao registrar'
    }
  }, [])

  const inviteSetup = useCallback(async (email: string, password: string) => {
    try {
      await authService.register(email, password)
      return null
    } catch (e) {
      return e instanceof Error ? e.message : 'Erro ao configurar conta'
    }
  }, [])

  const sendResetEmail = useCallback(async (email: string) => {
    try {
      const { registered } = await authService.checkEmail(email)
      if (!registered) return 'E-mail não encontrado'
      return null
    } catch (e) {
      return e instanceof Error ? e.message : 'Erro ao verificar e-mail'
    }
  }, [])

  const doResetPassword = useCallback(async (email: string, _code: string, password: string) => {
    try {
      await authService.resetPassword(email, password)
      return null
    } catch (e) {
      return e instanceof Error ? e.message : 'Erro ao redefinir senha'
    }
  }, [])

  const findUserByEmail = useCallback((_email: string) => {
    return undefined
  }, [])

  const role = user?.role?.toUpperCase()
  const isAdmin = role === 'ADMIN' || role === 'OWNER'
  const isOwner = role === 'OWNER'
  const isManager = role === 'MANAGER' || isAdmin

  return (
    <AuthContext.Provider value={{
      user, loading,
      login, logout, register, inviteSetup, sendResetEmail, doResetPassword, findUserByEmail,
      isAdmin, isOwner, isManager,
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
