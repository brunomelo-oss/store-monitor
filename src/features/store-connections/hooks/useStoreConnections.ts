import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { storeConnectionsService } from '@/services/store-connections.service'

const CONNECTIONS_KEY = ['store-connections'] as const

interface StoreConnection {
  id: number
  store: 'GOOGLE' | 'APPLE'
  label: string
  credentials: Record<string, unknown>
  isActive: boolean
  lastSyncAt: string | null
  lastSyncStatus: string | null
  createdAt: string
  updatedAt: string
}

const MOCK_CONNECTIONS: StoreConnection[] = [
  {
    id: 1, store: 'GOOGLE', label: 'SAS TECH SOLUTIONS LLC',
    credentials: {}, isActive: true,
    lastSyncAt: '2026-06-22T12:00:00Z', lastSyncStatus: 'success',
    createdAt: '2026-01-15T10:00:00Z', updatedAt: '2026-06-22T12:00:00Z',
  },
  {
    id: 2, store: 'APPLE', label: 'SASI COMUNICACAO AGIL LTDA',
    credentials: {}, isActive: true,
    lastSyncAt: '2026-06-21T11:00:00Z', lastSyncStatus: 'success',
    createdAt: '2026-01-15T10:00:00Z', updatedAt: '2026-06-21T11:00:00Z',
  },
]

export function useStoreConnections() {
  return useQuery({
    queryKey: CONNECTIONS_KEY,
    queryFn: async () => {
      try {
        const data = await storeConnectionsService.list()
        if (data && data.length > 0) return data
      } catch {}
      return MOCK_CONNECTIONS
    },
    staleTime: 30_000,
  })
}

export function useTestConnection() {
  return useMutation({
    mutationFn: (id: number) => storeConnectionsService.test(id),
  })
}

export function useCreateConnection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { store: string; label: string; credentials: Record<string, unknown> }) =>
      storeConnectionsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONNECTIONS_KEY })
    },
  })
}

export function useDeleteConnection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => storeConnectionsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONNECTIONS_KEY })
    },
  })
}
