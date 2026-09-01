import type { StoreConnection, StoreKind } from '@/lib/types'

export interface ConnectionInput {
  store: StoreKind
  label: string
  credentials?: Record<string, string>
}

export interface StoreConnectionsGateway {
  list(): Promise<StoreConnection[]>
  create(input: ConnectionInput): Promise<StoreConnection>
  update(id: number, input: Partial<ConnectionInput>): Promise<StoreConnection>
  remove(id: number): Promise<void>
  test(id: number): Promise<{ ok: boolean; message: string }>
}