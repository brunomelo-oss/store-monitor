import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUsers = vi.hoisted(() => vi.fn())
const mockGetInvites = vi.hoisted(() => vi.fn())
const mockCreateInvite = vi.hoisted(() => vi.fn())
const mockDeleteInvite = vi.hoisted(() => vi.fn())
const mockDeleteUser = vi.hoisted(() => vi.fn())
const mockUpdateUserRole = vi.hoisted(() => vi.fn())
const mockUpdateUserPassword = vi.hoisted(() => vi.fn())
const mockCreateUser = vi.hoisted(() => vi.fn())

vi.mock('@/lib/backend-api', () => ({
  backendApi: {
    getUsers: mockGetUsers,
    getInvites: mockGetInvites,
    createInvite: mockCreateInvite,
    deleteInvite: mockDeleteInvite,
    deleteUser: mockDeleteUser,
    updateUserRole: mockUpdateUserRole,
    updateUserPassword: mockUpdateUserPassword,
    createUser: mockCreateUser,
  },
}))

const mockAuthState = vi.hoisted(() => ({ isAdmin: true }))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    isAdmin: mockAuthState.isAdmin,
    user: { username: 'admin', role: 'admin', email: 'admin@test.com' },
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    inviteSetup: vi.fn(),
    sendResetEmail: vi.fn(),
    doResetPassword: vi.fn(),
    findUserByEmail: vi.fn(),
  }),
}))

const mockShow = vi.hoisted(() => vi.fn())
vi.mock('@/components/Toast', () => ({
  useToast: () => ({ show: mockShow }),
}))

import { UserManager } from '@/components/admin/UserManager'

const mockUsers = [
  { id: 1, username: 'bruno', email: 'bruno@sasi.com.br', role: 'admin', createdAt: '2025-01-01' },
  { id: 2, username: 'user', email: 'user@sasi.com.br', role: 'user', createdAt: '2025-01-02' },
]

const mockInvites = [
  { id: 1, email: 'invited@test.com', createdAt: '2025-01-03' },
]

beforeEach(() => {
  vi.clearAllMocks()
  mockGetUsers.mockResolvedValue(mockUsers)
  mockGetInvites.mockResolvedValue(mockInvites)
  mockAuthState.isAdmin = true
})

describe('UserManager', () => {
  describe('non-admin access', () => {
    it('shows restricted message for non-admins', async () => {
      mockAuthState.isAdmin = false
      render(<UserManager />)
      expect(await screen.findByText('Acesso restrito a administradores')).toBeInTheDocument()
    })
  })

  describe('admin access', () => {
    it('loads and displays users and invites', async () => {
      render(<UserManager />)

      expect(await screen.findByText('bruno@sasi.com.br')).toBeInTheDocument()
      expect(screen.getByText('user@sasi.com.br')).toBeInTheDocument()
      expect(screen.getByText('invited@test.com')).toBeInTheDocument()
    })

    it('sends invite on valid email', async () => {
      mockCreateInvite.mockResolvedValueOnce({ id: 2, email: 'new@test.com' })
      render(<UserManager />)

      await screen.findByText('Convidar')
      const input = screen.getByPlaceholderText('E-mail do usuário')
      await userEvent.type(input, 'new@test.com')
      await userEvent.click(screen.getByText('Convidar'))

      await waitFor(() => expect(mockCreateInvite).toHaveBeenCalledWith('new@test.com'))
    })

    it('rejects empty invite email', async () => {
      render(<UserManager />)
      await screen.findByText('Convidar')
      await userEvent.click(screen.getByText('Convidar'))
      expect(mockShow).toHaveBeenCalledWith('E-mail inválido', 'error')
    })

    it('deletes invite', async () => {
      mockDeleteInvite.mockResolvedValueOnce(undefined)
      render(<UserManager />)

      await screen.findByText('invited@test.com')
      const deleteBtn = screen.getByText('Pendente').closest('div')!.querySelector('button')
      expect(deleteBtn).toBeInTheDocument()
      await userEvent.click(deleteBtn!)
      await waitFor(() => expect(mockDeleteInvite).toHaveBeenCalledWith(1))
    })

    it('toggles user role', async () => {
      const updatedUser = { id: 2, username: 'user', email: 'user@sasi.com.br', role: 'admin' }
      mockUpdateUserRole.mockResolvedValueOnce(updatedUser)
      render(<UserManager />)

      await screen.findByText('user@sasi.com.br')
      const toggleBtns = screen.getAllByTitle('Promover para admin')
      await userEvent.click(toggleBtns[0])

      await waitFor(() => expect(mockUpdateUserRole).toHaveBeenCalledWith(2, 'admin'))
      expect(mockShow).toHaveBeenCalledWith('Agora é Administrador', 'success')
    })

    it('shows create user form when clicking Novo', async () => {
      render(<UserManager />)
      await screen.findByText('Novo')

      await userEvent.click(screen.getByText('Novo'))
      expect(screen.getByPlaceholderText('E-mail')).toBeInTheDocument()
      expect(screen.getByText('Criar')).toBeInTheDocument()
    })

    it('creates a new user', async () => {
      const newUser = { id: 3, username: 'newguy', email: 'newguy@test.com', role: 'user' }
      mockCreateUser.mockResolvedValueOnce(newUser)
      render(<UserManager />)

      await screen.findByText('Novo')
      await userEvent.click(screen.getByText('Novo'))

      await userEvent.type(screen.getByPlaceholderText('E-mail'), 'newguy@test.com')
      const passwordInput = screen.getByPlaceholderText('Senha')
      await userEvent.type(passwordInput, 'Admin123@')
      await userEvent.click(screen.getByText('Criar'))

      await waitFor(() => expect(mockCreateUser).toHaveBeenCalledWith('newguy@test.com', 'Admin123@', 'user'))
    })
  })
})
