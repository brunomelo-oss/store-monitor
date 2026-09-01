import { mockConnections } from '../mock-data'
import { withLatency, clone, nextId } from '../helpers'
import type { ConnectionInput, StoreConnectionsGateway } from '../../gateways'
import type { StoreConnection } from '@/lib/types'

let connections: StoreConnection[] = clone(mockConnections)

export const mockStoreConnectionsGateway: StoreConnectionsGateway = {
  async list() {
    return withLatency(clone(connections))
  },
  async create(input) {
    const connection: StoreConnection = {
      id: nextId(connections),
      store: input.store,
      label: input.label,
      isActive: true,
      lastSyncAt: null,
    }
    connections = [...connections, connection]
    return withLatency(clone(connection))
  },
  async update(id, input) {
    connections = connections.map(c => c.id === id ? { ...c, ...(input.label !== undefined ? { label: input.label } : {}) } : c)
    const connection = connections.find(c => c.id === id)
    return withLatency(clone(connection!))
  },
  async remove(id) {
    connections = connections.filter(c => c.id !== id)
    return withLatency(undefined as unknown as void)
  },
  async test() {
    return withLatency({ ok: true, message: 'Conexão válida' })
  },
}

export function setMockConnections(next: StoreConnection[]) {
  connections = clone(next)
}
export function getMockConnections(): StoreConnection[] {
  return clone(connections)
}