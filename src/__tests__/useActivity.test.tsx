import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useActivity } from '@/features/activity/hooks/useActivity'

const mockList = vi.hoisted(() => vi.fn())

vi.mock('@/services/activity.service', () => ({
  activityService: { list: mockList },
}))

vi.mock('@/lib/mock-data', () => ({
  MOCK_ACTIVITIES: [{ id: 999, mock: true }],
}))

let queryClient: QueryClient

function Wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

function TestComp({ limit, filters }: { limit?: number; filters?: { entity?: string; entityId?: number } }) {
  const { data } = useActivity(limit, filters)
  return <div data-testid="data">{JSON.stringify(data)}</div>
}

beforeEach(() => {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  vi.clearAllMocks()
})

describe('useActivity', () => {
  it('returns initial mock data immediately', () => {
    render(<TestComp />, { wrapper: Wrapper })
    expect(JSON.parse(screen.getByTestId('data').textContent!)).toEqual([{ id: 999, mock: true }])
  })

  it('calls service with default limit and no filters', async () => {
    mockList.mockResolvedValue([])
    render(<TestComp />, { wrapper: Wrapper })
    await queryClient.invalidateQueries({ queryKey: ['activity'] })
    await waitFor(() => {
      expect(mockList).toHaveBeenCalledWith(50, 0, undefined)
    })
  })

  it('calls service with custom limit', async () => {
    mockList.mockResolvedValue([])
    render(<TestComp limit={10} />, { wrapper: Wrapper })
    await queryClient.invalidateQueries({ queryKey: ['activity'] })
    await waitFor(() => {
      expect(mockList).toHaveBeenCalledWith(10, 0, undefined)
    })
  })

  it('calls service with entity filter', async () => {
    mockList.mockResolvedValue([])
    render(<TestComp filters={{ entity: 'app', entityId: 5 }} />, { wrapper: Wrapper })
    await queryClient.invalidateQueries({ queryKey: ['activity'] })
    await waitFor(() => {
      expect(mockList).toHaveBeenCalledWith(50, 0, { entity: 'app', entityId: 5 })
    })
  })

  it('returns fallback mock data on error', async () => {
    mockList.mockRejectedValueOnce(new Error('fail'))
    render(<TestComp />, { wrapper: Wrapper })
    expect(JSON.parse(screen.getByTestId('data').textContent!)).toEqual([{ id: 999, mock: true }])
  })

  it('reads data from pre-populated cache', async () => {
    const items = [{ id: 1, action: 'Test activity' }]
    queryClient.setQueryData(['activity', { limit: 50 }], items)
    render(<TestComp />, { wrapper: Wrapper })
    expect(JSON.parse(screen.getByTestId('data').textContent!)).toEqual(items)
  })
})
