import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useNotifications } from '@/features/notifications/hooks/useNotifications'

const mockList = vi.hoisted(() => vi.fn())

vi.mock('@/services/notifications.service', () => ({
  notificationsService: { list: mockList },
}))

vi.mock('@/lib/mock-data', () => ({
  MOCK_NOTIFICATIONS: [{ id: 999, mock: true }],
  MOCK_UNREAD_COUNT: 5,
}))

let queryClient: QueryClient

function Wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

function TestComp({ take, appId }: { take?: number; appId?: number }) {
  const { data } = useNotifications(take, appId)
  return <div data-testid="data">{JSON.stringify(data)}</div>
}

beforeEach(() => {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  vi.clearAllMocks()
})

describe('useNotifications', () => {
  it('returns initial mock data immediately', () => {
    render(<TestComp />, { wrapper: Wrapper })
    expect(JSON.parse(screen.getByTestId('data').textContent!)).toEqual([{ id: 999, mock: true }])
  })

  it('calls service with default take and no appId', async () => {
    mockList.mockResolvedValue([])
    render(<TestComp />, { wrapper: Wrapper })
    await queryClient.invalidateQueries({ queryKey: ['notifications'] })
    await waitFor(() => {
      expect(mockList).toHaveBeenCalledWith(0, 20, undefined)
    })
  })

  it('calls service with custom take', async () => {
    mockList.mockResolvedValue([])
    render(<TestComp take={50} />, { wrapper: Wrapper })
    await queryClient.invalidateQueries({ queryKey: ['notifications'] })
    await waitFor(() => {
      expect(mockList).toHaveBeenCalledWith(0, 50, undefined)
    })
  })

  it('calls service with appId filter', async () => {
    mockList.mockResolvedValue([])
    render(<TestComp appId={7} />, { wrapper: Wrapper })
    await queryClient.invalidateQueries({ queryKey: ['notifications'] })
    await waitFor(() => {
      expect(mockList).toHaveBeenCalledWith(0, 20, 7)
    })
  })

  it('returns fallback mock data on error', async () => {
    mockList.mockRejectedValueOnce(new Error('fail'))
    render(<TestComp />, { wrapper: Wrapper })
    expect(JSON.parse(screen.getByTestId('data').textContent!)).toEqual([{ id: 999, mock: true }])
  })

  it('reads data from pre-populated cache', async () => {
    const items = [{ id: 1, message: 'Test notification' }]
    queryClient.setQueryData(['notifications', { take: 20 }], items)
    render(<TestComp />, { wrapper: Wrapper })
    expect(JSON.parse(screen.getByTestId('data').textContent!)).toEqual(items)
  })
})
