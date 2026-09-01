import type { App, AppStatus, Accounts, Region } from '@/lib/types'

export interface AppInput {
  name: string
  region: Region
  googleAccount: string
  appleAccount: string
  playStatus: AppStatus
  playVersion: string
  playLastUpdate: string
  appStatus: AppStatus
  appVersion: string
  appLastUpdate: string
  installations?: number
  rating?: number
}

export interface AppsGateway {
  list(): Promise<App[]>
  getById(id: number): Promise<App>
  create(input: AppInput): Promise<App>
  update(id: number, input: Partial<AppInput>): Promise<App>
  remove(id: number): Promise<void>
  togglePin(id: number): Promise<App>
  move(id: number, direction: 'up' | 'down'): Promise<App[]>
  getAccounts(): Promise<Accounts>
}