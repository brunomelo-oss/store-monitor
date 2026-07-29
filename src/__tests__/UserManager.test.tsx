import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockList = vi.hoisted(() => vi.fn())
const mockGetInvites = vi.hoisted(() => vi.fn())
const mockCreateInvite = vi.hoisted(() => vi.fn())
const mockDeleteInvite = vi.hoisted(() => vi.fn())
const mockDeleteUser = vi.hoisted(() => vi.fn())
const mockUpdateRole = vi.hoisted(() => vi.fn())
vi.mock('@/services/users.service', () => ({
  usersService: {
    list: mockList,
    getInvites: mockGetInvites,
    createInvite: mockCreateInvite,
    deleteInvite: mockDeleteInvite,
    delete: mockDeleteUser,
    updateRole: mockUpdateRole,
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

import { UserManager } from '@/features/admin/components/UserManager'

const mockUsers: { id: number; username: string; email: string; role: string; createdAt: string }[] = []

const mockInvites = [
  { id: 1, email: 'invited@test.com', createdAt: '2025-01-03' },
]

beforeEach(() => {
  vi.clearAllMocks()
  mockList.mockResolvedValue(mockUsers)
  mockGetInvites.mockResolvedValue(mockInvites)
  mockAuthState.isAdmin = true
})

describe('UserManager', () => {
  it('loads and displays invites', async () => {
    render(<UserManager />)

    expect(await screen.findByText('invited@test.com')).toBeInTheDocument()
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

  it('shows empty state when no users', async () => {
    render(<UserManager />)

    expect(await screen.findByText('Nenhum usuário encontrado')).toBeInTheDocument()
  })

})
