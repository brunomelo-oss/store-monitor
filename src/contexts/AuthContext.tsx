'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { User } from '@/types'
import { backendApi } from '@/lib/backend-api'

interface AuthState {
  user: { username: string; role: string; email: string } | null
  loading: boolean
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
  register: (email: string, password: string) => Promise<string | null>
  inviteSetup: (email: string, password: string) => Promise<string | null>
  sendResetEmail: (email: string) => Promise<string | null>
  doResetPassword: (email: string, code: string, password: string) => Promise<string | null>
  findUserByEmail: (email: string) => User | undefined
  isAdmin: boolean
}

const AuthContext = createContext<AuthState>(null!)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthState['user']>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    backendApi.me()
      .then(({ user }) => setUser(user))
      .catch(() => backendApi.refresh().then(({ user }) => setUser(user)).catch(() => {}))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    try {
      const u = await backendApi.login(username, password)
      setUser(u)
      return { ok: true }
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Erro ao fazer login' }
    }
  }, [])

  const logout = useCallback(async () => {
    try { await backendApi.logout() } catch {}
    setUser(null)
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    try {
      await backendApi.register(email, password)
      return null
    } catch (e) {
      return e instanceof Error ? e.message : 'Erro ao registrar'
    }
  }, [])

  const inviteSetup = useCallback(async (email: string, password: string) => {
    try {
      await backendApi.register(email, password)
      return null
    } catch (e) {
      return e instanceof Error ? e.message : 'Erro ao configurar conta'
    }
  }, [])

  const sendResetEmail = useCallback(async (email: string) => {
    try {
      const { registered } = await backendApi.checkEmail(email)
      if (!registered) return 'E-mail não encontrado'
      return null
    } catch (e) {
      return e instanceof Error ? e.message : 'Erro ao verificar e-mail'
    }
  }, [])

  const doResetPassword = useCallback(async (email: string, _code: string, password: string) => {
    try {
      await backendApi.resetPassword(email, password)
      return null
    } catch (e) {
      return e instanceof Error ? e.message : 'Erro ao redefinir senha'
    }
  }, [])

  const findUserByEmail = useCallback((_email: string) => {
    return undefined
  }, [])

  return (
    <AuthContext.Provider value={{
      user, loading,
      login, logout, register, inviteSetup, sendResetEmail, doResetPassword, findUserByEmail,
      isAdmin: user?.role === 'admin',
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
