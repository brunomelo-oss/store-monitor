export interface StoreInfo {
  status: AppStatus
  version: string
  lastUpdate: string
}

export type AppStatus = 'published' | 'review' | 'rejected' | 'pending' | 'unpublished'

export interface App {
  id: number
  name: string
  region: 'Brasil' | 'Internacional'
  googleAccount: string
  appleAccount: string
  playStore: StoreInfo
  appStore: StoreInfo
  installations: number
  rating: number
  pinned?: boolean
  sortOrder?: number
}

export interface Account {
  id: string
  name: string
  label?: string
}

export interface Accounts {
  google: Account[]
  apple: Account[]
}

export interface User {
  username: string
  password: string
  email: string
  role: 'admin' | 'user'
}

export interface Invite {
  id?: number
  email: string
  invitedAt?: string
  createdAt?: string
}

export type ModalMode = 'edit' | 'add' | 'details' | 'password'

export type ToastType = 'success' | 'error' | 'warning' | 'info'
