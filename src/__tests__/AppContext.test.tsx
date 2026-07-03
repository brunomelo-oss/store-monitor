import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ReactNode } from 'react'

const mockGetApps = vi.hoisted(() => vi.fn())
const mockCreateApp = vi.hoisted(() => vi.fn())
const mockUpdateApp = vi.hoisted(() => vi.fn())
const mockDeleteApp = vi.hoisted(() => vi.fn())
const mockTogglePin = vi.hoisted(() => vi.fn())
const mockMoveApp = vi.hoisted(() => vi.fn())
const mockBulkReplace = vi.hoisted(() => vi.fn())

vi.mock('@/lib/backend-api', () => ({
  backendApi: {
    getApps: mockGetApps,
    createApp: mockCreateApp,
    updateApp: mockUpdateApp,
    deleteApp: mockDeleteApp,
    togglePin: mockTogglePin,
    moveApp: mockMoveApp,
    bulkReplace: mockBulkReplace,
  },
}))

vi.mock('@/lib/mock-data', () => ({
  MOCK_APPS: [
    { id: 1, name: 'Mock App', region: 'Brasil', playStore: { status: 'published', version: '1.0.0', lastUpdate: '2025-01-01' }, appStore: { status: 'unpublished', version: '', lastUpdate: '' }, installations: 100, rating: 4.0 },
  ],
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ isAdmin: true, loading: false }),
}))

import { AppProvider, useAppContext } from '@/contexts/AppContext'

function TestConsumer() {
  const ctx = useAppContext()
  return (
    <div>
      <div data-testid="loading">{String(ctx.loading)}</div>
      <div data-testid="error">{ctx.error || 'no-error'}</div>
      <div data-testid="apps-count">{ctx.apps.length}</div>
      <div data-testid="mode">{ctx.mode}</div>
      <div data-testid="hasRealData">{ctx.hasRealData.length}</div>
      <button data-testid="setEdit" onClick={() => ctx.setMode('edit')}>edit mode</button>
      <button data-testid="setView" onClick={() => ctx.setMode('view')}>view mode</button>
      <button data-testid="addApp" onClick={() => ctx.addApp({
        id: 99, name: 'New', region: 'Brasil', googleAccount: '', appleAccount: '',
        playStore: { status: 'unpublished', version: '', lastUpdate: '' },
        appStore: { status: 'unpublished', version: '', lastUpdate: '' },
        installations: 0, rating: 0,
      })}>add</button>
      <button data-testid="updateApp" onClick={() => ctx.updateApp(1, { name: 'Updated' })}>update</button>
      <button data-testid="removeApp" onClick={() => ctx.removeApp(1)}>remove</button>
      <button data-testid="togglePin" onClick={() => ctx.togglePin(1)}>pin</button>
      <button data-testid="moveApp" onClick={() => ctx.moveApp(1, 1)}>move</button>
      <button data-testid="resetData" onClick={() => ctx.resetData()}>reset</button>
    </div>
  )
}

function renderProvider() {
  return render(
    <AppProvider>
      <TestConsumer />
    </AppProvider>
  )
}

const mockApps = [
  { id: 1, name: 'App One', region: 'Brasil', googleAccount: '', appleAccount: '', playStore: { status: 'published', version: '1.0.0', lastUpdate: '2025-01-01' }, appStore: { status: 'unpublished', version: '', lastUpdate: '' }, installations: 100, rating: 4.0, pinned: false, sortOrder: 1 },
]

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AppContext', () => {
  it('loads apps on mount', async () => {
    mockGetApps.mockResolvedValueOnce(mockApps)

    renderProvider()

    expect(screen.getByTestId('loading').textContent).toBe('true')
    await waitFor(() => {
      expect(screen.getByTestId('apps-count').textContent).toBe('1')
    })
    expect(screen.getByTestId('error').textContent).toBe('no-error')
  })

  it('shows error when loading fails', async () => {
    mockGetApps.mockRejectedValueOnce(new Error('network error'))

    renderProvider()

    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toBe('Não foi possível carregar os apps. Verifique a conexão com o servidor.')
    })
    expect(screen.getByTestId('loading').textContent).toBe('false')
  })

  it('setMode changes mode', async () => {
    mockGetApps.mockResolvedValueOnce(mockApps)

    renderProvider()
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))

    await screen.getByTestId('setEdit').click()
    expect(screen.getByTestId('mode').textContent).toBe('edit')

    await screen.getByTestId('setView').click()
    expect(screen.getByTestId('mode').textContent).toBe('view')
  })

  it('addApp calls backend and adds to list', async () => {
    const newApp = { id: 99, name: 'New', region: 'Brasil', googleAccount: '', appleAccount: '', playStore: { status: 'unpublished', version: '', lastUpdate: '' }, appStore: { status: 'unpublished', version: '', lastUpdate: '' }, installations: 0, rating: 0 }
    mockCreateApp.mockResolvedValueOnce(newApp)
    mockGetApps.mockResolvedValueOnce(mockApps)

    renderProvider()
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))

    await screen.getByTestId('addApp').click()
    await waitFor(() => {
      expect(mockCreateApp).toHaveBeenCalled()
    })
    expect(screen.getByTestId('apps-count').textContent).toBe('2')
  })

  it('updateApp calls backend and updates local state', async () => {
    mockGetApps.mockResolvedValueOnce(mockApps)
    mockUpdateApp.mockResolvedValueOnce(undefined)

    renderProvider()
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))

    await screen.getByTestId('updateApp').click()
    await waitFor(() => {
      expect(mockUpdateApp).toHaveBeenCalledWith(1, { name: 'Updated' })
    })
  })

  it('removeApp calls backend and removes from list', async () => {
    mockGetApps.mockResolvedValueOnce(mockApps)
    mockDeleteApp.mockResolvedValueOnce(undefined)

    renderProvider()
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))

    await screen.getByTestId('removeApp').click()
    await waitFor(() => {
      expect(mockDeleteApp).toHaveBeenCalledWith(1)
    })
    expect(screen.getByTestId('apps-count').textContent).toBe('0')
  })

  it('togglePin calls backend and updates app', async () => {
    const pinnedApp = { ...mockApps[0], pinned: true }
    mockGetApps.mockResolvedValueOnce(mockApps)
    mockTogglePin.mockResolvedValueOnce(pinnedApp)

    renderProvider()
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))

    await screen.getByTestId('togglePin').click()
    await waitFor(() => expect(mockTogglePin).toHaveBeenCalledWith(1))
  })

  it('moveApp calls backend and replaces list', async () => {
    mockGetApps.mockResolvedValueOnce(mockApps)
    mockMoveApp.mockResolvedValueOnce(mockApps.reverse())

    renderProvider()
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))

    await screen.getByTestId('moveApp').click()
    await waitFor(() => expect(mockMoveApp).toHaveBeenCalledWith(1, 1))
  })

  it('resetData calls bulkReplace with mock data', async () => {
    mockGetApps.mockResolvedValueOnce(mockApps)
    mockBulkReplace.mockResolvedValueOnce(undefined)

    renderProvider()
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))

    await screen.getByTestId('resetData').click()
    await waitFor(() => {
      expect(mockBulkReplace).toHaveBeenCalled()
      expect(mockBulkReplace.mock.calls[0][0][0].name).toBe('Mock App')
    })
  })

  it('hasRealData filters apps with versions', async () => {
    const mixed = [
      { ...mockApps[0], playStore: { status: 'published', version: '1.0.0', lastUpdate: '2025-01-01' }, appStore: { status: 'unpublished', version: '', lastUpdate: '' } },
      { id: 2, name: 'Empty', region: 'Brasil', googleAccount: '', appleAccount: '', playStore: { status: 'unpublished', version: '', lastUpdate: '' }, appStore: { status: 'unpublished', version: '-', lastUpdate: '' }, installations: 0, rating: 0 },
    ]
    mockGetApps.mockResolvedValueOnce(mixed)

    renderProvider()
    await waitFor(() => {
      expect(screen.getByTestId('hasRealData').textContent).toBe('1')
    })
  })
})
