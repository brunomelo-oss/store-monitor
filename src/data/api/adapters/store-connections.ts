import { apiClient } from '@/data/api-client'
import type { StoreConnectionsGateway, ConnectionInput } from '../../gateways'
import type { StoreConnection } from '@/lib/types'

export const apiStoreConnectionsGateway: StoreConnectionsGateway = {
  list() {
    return apiClient<StoreConnection[]>('/v1/store-connections')
  },
  create(input: ConnectionInput) {
    return apiClient<StoreConnection>('/v1/store-connections', { method: 'POST', body: JSON.stringify(input) })
  },
  update(id, input) {
    return apiClient<StoreConnection>(`/v1/store-connections/${id}`, { method: 'PUT', body: JSON.stringify(input) })
  },
  remove(id) {
    return apiClient<void>(`/v1/store-connections/${id}`, { method: 'DELETE' })
  },
  test(id) {
    return apiClient<{ ok: boolean; message: string }>(`/v1/store-connections/${id}/test`, { method: 'POST' })
  },
}