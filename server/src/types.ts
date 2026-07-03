export interface DbApp {
  id: number
  name: string
  region: string
  googleAccount: string
  appleAccount: string
  playStatus: string
  playVersion: string
  playLastUpdate: string
  appStatus: string
  appVersion: string
  appLastUpdate: string
  installations: number
  rating: number
  pinned: boolean
  sortOrder: number
}

export interface FrontendApp {
  id: number
  name: string
  region: string
  googleAccount: string
  appleAccount: string
  playStore: { status: string; version: string; lastUpdate: string }
  appStore: { status: string; version: string; lastUpdate: string }
  installations: number
  rating: number
  pinned: boolean
  sortOrder: number
}
