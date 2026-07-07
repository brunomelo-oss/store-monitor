import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockLogin = vi.hoisted(() => vi.fn())
const mockCheckInvite = vi.hoisted(() => vi.fn())

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}))

vi.mock('@/lib/backend-api', () => ({
  backendApi: { checkInvite: mockCheckInvite },
}))

import { LoginForm } from '@/components/auth/LoginForm'

const onSwitch = vi.fn()
const onSuccess = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  sessionStorage.clear()
  localStorage.clear()
})

function renderLogin() {
  return render(<LoginForm onSwitch={onSwitch} onSuccess={onSuccess} />)
}

describe('LoginForm', () => {
  it('renders logo, inputs and submit button', () => {
    renderLogin()
    expect(screen.getByAltText('SASI')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Usuário ou e-mail')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Senha')).toBeInTheDocument()
    expect(screen.getByText('Entrar')).toBeInTheDocument()
  })

  it('shows error when submitting empty form', async () => {
    renderLogin()
    await userEvent.click(screen.getByText('Entrar'))
    expect(await screen.findByText('Digite seu usuário ou e-mail')).toBeInTheDocument()
  })

  it('shows error when password is empty', async () => {
    renderLogin()
    await userEvent.type(screen.getByPlaceholderText('Usuário ou e-mail'), 'admin')
    await userEvent.click(screen.getByText('Entrar'))
    expect(await screen.findByText('Digite sua senha')).toBeInTheDocument()
  })

  it('calls login on submit and succeeds', async () => {
    mockLogin.mockResolvedValueOnce({ ok: true })
    renderLogin()
    await userEvent.type(screen.getByPlaceholderText('Usuário ou e-mail'), 'bruno.melo@sasi.com.br')
    await userEvent.type(screen.getByPlaceholderText('Senha'), 'Admin123@')
    await userEvent.click(screen.getByText('Entrar'))
    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('bruno.melo@sasi.com.br', 'Admin123@'))
    expect(onSuccess).toHaveBeenCalled()
  })

  it('shows error message on login failure', async () => {
    mockLogin.mockResolvedValueOnce({ ok: false, error: 'Credenciais inválidas' })
    renderLogin()
    await userEvent.type(screen.getByPlaceholderText('Usuário ou e-mail'), 'admin')
    await userEvent.type(screen.getByPlaceholderText('Senha'), 'wrong')
    await userEvent.click(screen.getByText('Entrar'))
    expect(await screen.findByText('Credenciais inválidas')).toBeInTheDocument()
  })

  it('toggles password visibility', async () => {
    renderLogin()
    const pwInput = screen.getByPlaceholderText('Senha')
    expect(pwInput).toHaveAttribute('type', 'password')
    fireEvent.click(pwInput.nextElementSibling!)
    expect(pwInput).toHaveAttribute('type', 'text')
  })

  it('redirects to password reset after 5 failed attempts', async () => {
    mockLogin.mockResolvedValue({ ok: false, error: 'Credenciais inválidas' })
    const mockOnSwitch = vi.fn()
    render(<LoginForm onSwitch={mockOnSwitch} onSuccess={onSuccess} />)
    const usernameInput = screen.getByPlaceholderText('Usuário ou e-mail')
    const passwordInput = screen.getByPlaceholderText('Senha')

    for (let i = 0; i < 5; i++) {
      await userEvent.clear(usernameInput)
      await userEvent.clear(passwordInput)
      await userEvent.type(usernameInput, 'admin')
      await userEvent.type(passwordInput, 'wrong')
      await userEvent.click(screen.getByText('Entrar'))
    }

    expect(mockOnSwitch).toHaveBeenCalledWith('email')
  })

  it('checks invite on email blur', async () => {
    mockCheckInvite.mockResolvedValueOnce({ invited: true })
    renderLogin()
    const emailInput = screen.getByPlaceholderText('Usuário ou e-mail')
    await userEvent.type(emailInput, 'invited@test.com')
    fireEvent.blur(emailInput)
    expect(await screen.findByText(/convite pendente/)).toBeInTheDocument()
    expect(mockCheckInvite).toHaveBeenCalledWith('invited@test.com')
  })

  it('calls onSwitch for invite setup click', async () => {
    mockCheckInvite.mockResolvedValueOnce({ invited: true })
    renderLogin()
    const emailInput = screen.getByPlaceholderText('Usuário ou e-mail')
    await userEvent.type(emailInput, 'invited@test.com')
    fireEvent.blur(emailInput)
    await screen.findByText(/convite pendente/)
    await userEvent.click(screen.getByText('Configurar conta'))
    expect(onSwitch).toHaveBeenCalledWith('invite', 'invited@test.com')
  })

  it('calls onSwitch for register page', async () => {
    renderLogin()
    await userEvent.click(screen.getByText('Primeiro acesso'))
    expect(onSwitch).toHaveBeenCalledWith('register')
  })
})
