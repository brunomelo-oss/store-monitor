import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSyncHistory } from '@/features/sync/hooks/useSyncHistory'

const mockListHistory = vi.hoisted(() => vi.fn())

vi.mock('@/services/sync.service', () => ({
  syncService: { listHistory: mockListHistory },
}))

let queryClient: QueryClient

function Wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

function TestComp({ appId }: { appId?: number }) {
  const { data } = useSyncHistory(appId)
  return <div data-testid="data">{JSON.stringify(data)}</div>
}

beforeEach(() => {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  vi.clearAllMocks()
})

describe('useSyncHistory', () => {
  it('returns initial empty array immediately', () => {
    render(<TestComp />, { wrapper: Wrapper })
    expect(screen.getByTestId('data').textContent).toBe('[]')
  })

  it('calls listHistory without appId', async () => {
    mockListHistory.mockResolvedValue([])
    render(<TestComp />, { wrapper: Wrapper })
    await queryClient.invalidateQueries({ queryKey: ['sync-history'] })
    await waitFor(() => {
      expect(mockListHistory).toHaveBeenCalledWith(undefined)
    })
  })

  it('calls listHistory with appId', async () => {
    mockListHistory.mockResolvedValue([])
    render(<TestComp appId={42} />, { wrapper: Wrapper })
    await queryClient.invalidateQueries({ queryKey: ['sync-history', 42] })
    await waitFor(() => {
      expect(mockListHistory).toHaveBeenCalledWith(42)
    })
  })

  it('returns fallback empty array on error', async () => {
    mockListHistory.mockRejectedValueOnce(new Error('fail'))
    render(<TestComp />, { wrapper: Wrapper })
    expect(JSON.parse(screen.getByTestId('data').textContent!)).toEqual([])
  })

  it('reads data from pre-populated cache', async () => {
    const items = [{ id: 1, appId: 10, status: 'SUCCESS' }]
    queryClient.setQueryData(['sync-history', 10], items)
    render(<TestComp appId={10} />, { wrapper: Wrapper })
    expect(JSON.parse(screen.getByTestId('data').textContent!)).toEqual(items)
  })
})
