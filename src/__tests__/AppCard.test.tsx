import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { App } from '@/types'

const mockTogglePin = vi.fn()
const mockMoveApp = vi.fn()
const mockDeleteApp = vi.fn()
const mockShow = vi.fn()
const mockUseAuth = vi.fn()

vi.mock('@/hooks/useApps', () => ({
  useTogglePin: () => ({ mutateAsync: mockTogglePin }),
  useMoveApp: () => ({ mutate: mockMoveApp }),
  useDeleteApp: () => ({ mutate: mockDeleteApp }),
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ show: mockShow }),
}))

import { AppCard } from '@/features/apps/components/AppCard'

const baseApp: App = {
  id: 1,
  name: 'SASI',
  region: 'Brasil',
  googleAccount: 'sasiHoldings',
  appleAccount: 'sasiComunicacao',
  playStore: { status: 'published', version: '3.12.6', lastUpdate: '2024-10-21' },
  appStore: { status: 'published', version: '3.10.1', lastUpdate: '' },
  installations: 128000,
  rating: 4.5,
}

const onEdit = vi.fn()
const onDetails = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  mockUseAuth.mockReturnValue({ isAdmin: true })
})

function renderCard(app = baseApp, mode: 'view' | 'edit' = 'view') {
  return render(<AppCard app={app} mode={mode} onEdit={onEdit} onDetails={onDetails} />)
}

describe('AppCard', () => {
  it('renders app name and stores info', () => {
    renderCard()
    expect(screen.getByText('SASI')).toBeInTheDocument()
    expect(screen.getAllByText('Publicado')).toHaveLength(3)
  })

  it('shows edit button when in edit mode', () => {
    renderCard(baseApp, 'edit')
    expect(screen.getByText('Editar')).toBeInTheDocument()
  })

  it('shows detail button in view mode', () => {
    renderCard()
    expect(screen.getByText('Detalhes')).toBeInTheDocument()
  })

  it('shows pinned badge when pinned', () => {
    renderCard({ ...baseApp, pinned: true })
    expect(screen.getByText('Fixado')).toBeInTheDocument()
  })

  it('calls onDetails when clicking Detalhes', async () => {
    renderCard()
    await userEvent.click(screen.getByText('Detalhes'))
    expect(onDetails).toHaveBeenCalledWith(baseApp)
  })

  it('calls onEdit when clicking Editar in edit mode', async () => {
    renderCard(baseApp, 'edit')
    await userEvent.click(screen.getByText('Editar'))
    expect(onEdit).toHaveBeenCalledWith(baseApp)
  })
})
