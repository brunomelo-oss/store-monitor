import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { App } from '@/types'

const mockAddApp = vi.hoisted(() => vi.fn())
const mockUpdateApp = vi.hoisted(() => vi.fn())

vi.mock('@/contexts/AppContext', () => ({
  useAppContext: () => ({
    addApp: mockAddApp,
    updateApp: mockUpdateApp,
    apps: [
      { id: 1, sortOrder: 1 },
      { id: 2, sortOrder: 3 },
    ],
  }),
}))

vi.mock('@/lib/mock-data', () => ({
  STATUS_LABELS: {
    published: 'Publicado',
    review: 'Em Revisão',
    rejected: 'Rejeitado',
    pending: 'Atualização Pendente',
    unpublished: 'Não Publicado',
  },
  ACCOUNTS: {
    google: [
      { id: 'sasTech', name: 'SAS TECH SOLUTIONS LLC' },
      { id: 'sasiHoldings', name: 'SASI Holdings Limited' },
    ],
    apple: [
      { id: 'sasTech', name: 'SAS TECH SOLUTIONS LLC' },
      { id: 'sasiComunicacao', name: 'SASI COMUNICACAO AGIL LTDA' },
    ],
  },
}))

import { AppModal } from '@/components/apps/AppModal'

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
  pinned: true,
}

const onClose = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AppModal', () => {
  describe('details mode', () => {
    it('renders app info in read-only mode', () => {
      render(<AppModal app={baseApp} mode="details" region="Brasil" onClose={onClose} />)
      expect(screen.getByText('SASI')).toBeInTheDocument()
      expect(screen.getByText('Brasil')).toBeInTheDocument()
      expect(screen.getByText('SASI Holdings Limited')).toBeInTheDocument()
      expect(screen.getByText('SASI COMUNICACAO AGIL LTDA')).toBeInTheDocument()
      expect(screen.getByText('3.12.6')).toBeInTheDocument()
      expect(screen.getByText('3.10.1')).toBeInTheDocument()
    })

    it('does not show save button', () => {
      render(<AppModal app={baseApp} mode="details" region="Brasil" onClose={onClose} />)
      expect(screen.queryByText('Salvar')).not.toBeInTheDocument()
    })

    it('shows Fechar button', () => {
      render(<AppModal app={baseApp} mode="details" region="Brasil" onClose={onClose} />)
      expect(screen.getByText('Fechar')).toBeInTheDocument()
    })
  })

  describe('add mode', () => {
    function renderAdd() {
      const utils = render(<AppModal app={null} mode="add" region="Brasil" onClose={onClose} />)
      const nameInput = utils.container.querySelector('input:not([type="date"])')!
      return { ...utils, nameInput }
    }

    it('renders form with region in title', () => {
      render(<AppModal app={null} mode="add" region="Internacional" onClose={onClose} />)
      expect(screen.getByText('Novo App - Internacional')).toBeInTheDocument()
      expect(screen.getAllByPlaceholderText('x.y.z').length).toBe(2)
      expect(screen.getByText('Salvar')).toBeInTheDocument()
    })

    it('validates empty name', async () => {
      render(<AppModal app={null} mode="add" region="Brasil" onClose={onClose} />)
      await userEvent.click(screen.getByText('Salvar'))
      expect(await screen.findByText('O nome do app não pode ficar vazio')).toBeInTheDocument()
      expect(mockAddApp).not.toHaveBeenCalled()
    })

    it('validates version format', async () => {
      const { nameInput } = renderAdd()
      await userEvent.type(nameInput, 'Test App')
      const versionInputs = screen.getAllByPlaceholderText('x.y.z')
      await userEvent.type(versionInputs[0], 'bad-version')
      await userEvent.click(screen.getByText('Salvar'))
      expect(await screen.findByText('Versão Play Store inválida (use x.y.z)')).toBeInTheDocument()
    })

    it('calls addApp and closes on valid submit', async () => {
      mockAddApp.mockResolvedValueOnce(null)
      const { nameInput } = renderAdd()

      await userEvent.type(nameInput, 'New App')
      await userEvent.click(screen.getByText('Salvar'))

      await waitFor(() => {
        expect(mockAddApp).toHaveBeenCalled()
        const arg = mockAddApp.mock.calls[0][0]
        expect(arg.name).toBe('New App')
        expect(arg.id).toBe(3)
        expect(arg.sortOrder).toBe(4)
      })
      expect(onClose).toHaveBeenCalled()
    })

    it('closes on backdrop click', async () => {
      render(<AppModal app={null} mode="add" region="Brasil" onClose={onClose} />)
      const backdrop = screen.getByText('Novo App - Brasil').closest('.fixed')!
      await userEvent.click(backdrop)
      expect(onClose).toHaveBeenCalled()
    })
  })

  describe('edit mode', () => {
    it('pre-fills form with app data', () => {
      render(<AppModal app={baseApp} mode="edit" region="Brasil" onClose={onClose} />)
      expect(screen.getByText('Editar App')).toBeInTheDocument()
      const nameInput = screen.getByDisplayValue('SASI')
      expect(nameInput).toBeInTheDocument()
    })

    it('calls updateApp on submit', async () => {
      mockUpdateApp.mockResolvedValueOnce(null)
      render(<AppModal app={baseApp} mode="edit" region="Brasil" onClose={onClose} />)

      const nameInput = screen.getByDisplayValue('SASI')
      await userEvent.clear(nameInput)
      await userEvent.type(nameInput, 'SASI Updated')
      await userEvent.click(screen.getByText('Salvar'))

      await waitFor(() => {
        expect(mockUpdateApp).toHaveBeenCalledWith(1, expect.objectContaining({ name: 'SASI Updated' }))
      })
      expect(onClose).toHaveBeenCalled()
    })
  })
})
