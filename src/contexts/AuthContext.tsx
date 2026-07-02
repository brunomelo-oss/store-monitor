'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { User } from '@/types'
import { localStorageApi } from '@/lib/storage'
import { getSession, setSession, clearSession } from '@/lib/storage'

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
    const s = getSession()
    if (s) setUser(s)
    setLoading(false)
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const users = await localStorageApi.getUsers()
    const found = users.find(u => (u.username === username || u.email === username) && u.password === password)
    if (!found) return { ok: false, error: 'Usuário ou senha inválidos' }
    const u = { username: found.username, role: found.role, email: found.email }
    setUser(u)
    setSession(u)
    return { ok: true }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    clearSession()
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    const users = await localStorageApi.getUsers()
    if (users.find(u => u.email === email)) return 'E-mail já cadastrado'
    const newUser: User = { username: email.split('@')[0], password, email, role: 'user' }
    users.push(newUser)
    await localStorageApi.saveUsers(users)
    return null
  }, [])

  const inviteSetup = useCallback(async (email: string, password: string) => {
    const invites = await localStorageApi.getInvites()
    const idx = invites.findIndex(i => i.email === email)
    if (idx === -1) return 'Convite não encontrado para este e-mail'
    const users = await localStorageApi.getUsers()
    if (users.find(u => u.email === email)) return 'Usuário já existe'
    const newUser: User = { username: email.split('@')[0], password, email, role: 'user' }
    users.push(newUser)
    await localStorageApi.saveUsers(users)
    invites.splice(idx, 1)
    await localStorageApi.saveInvites(invites)
    return null
  }, [])

  const sendResetEmail = useCallback(async (email: string) => {
    const users = await localStorageApi.getUsers()
    if (!users.find(u => u.email === email)) return 'E-mail não encontrado'
    return null
  }, [])

  const doResetPassword = useCallback(async (email: string, _code: string, password: string) => {
    const users = await localStorageApi.getUsers()
    const u = users.find(u => u.email === email)
    if (!u) return 'Usuário não encontrado'
    u.password = password
    await localStorageApi.saveUsers(users)
    return null
  }, [])

  const findUserByEmail = useCallback((email: string) => {
    // sync lookup; users are already loaded in admin flow
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
