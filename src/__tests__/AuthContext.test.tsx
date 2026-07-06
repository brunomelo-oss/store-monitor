import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ReactNode } from 'react'

const mockLogin = vi.hoisted(() => vi.fn())
const mockLogout = vi.hoisted(() => vi.fn())
const mockRegister = vi.hoisted(() => vi.fn())
const mockRefresh = vi.hoisted(() => vi.fn())
const mockMe = vi.hoisted(() => vi.fn())
const mockCheckEmail = vi.hoisted(() => vi.fn())
const mockResetPassword = vi.hoisted(() => vi.fn())

vi.mock('@/lib/backend-api', () => ({
  backendApi: {
    login: mockLogin,
    logout: mockLogout,
    refresh: mockRefresh,
    me: mockMe,
    register: mockRegister,
    checkEmail: mockCheckEmail,
    resetPassword: mockResetPassword,
  },
}))

import { AuthProvider, useAuth, setRememberSession } from '@/contexts/AuthContext'

function TestConsumer() {
  const auth = useAuth()
  return (
    <div>
      <div data-testid="loading">{String(auth.loading)}</div>
      <div data-testid="user">{auth.user ? JSON.stringify(auth.user) : 'null'}</div>
      <div data-testid="isAdmin">{String(auth.isAdmin)}</div>
      <button data-testid="login" onClick={() => auth.login('test', 'pass')}>login</button>
      <button data-testid="logout" onClick={() => auth.logout()}>logout</button>
      <button data-testid="register" onClick={() => auth.register('test@test.com', 'pass123@')}>register</button>
      <button data-testid="checkEmail" onClick={() => auth.sendResetEmail('test@test.com')}>check</button>
      <button data-testid="resetPassword" onClick={() => auth.doResetPassword('test@test.com', 'code', 'newpass@1')}>reset</button>
    </div>
  )
}

function renderProvider() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  )
}

beforeEach(() => {
  setRememberSession(false)
  vi.clearAllMocks()
  mockMe.mockRejectedValue(new Error('no session'))
  mockRefresh.mockRejectedValue(new Error('no refresh'))
})

describe('AuthContext', () => {
  it('shows loading initially, then resolves', async () => {
    mockMe.mockRejectedValueOnce(new Error('no session'))
    mockRefresh.mockRejectedValueOnce(new Error('no refresh'))

    renderProvider()

    expect(screen.getByTestId('loading').textContent).toBe('true')
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))
  })

  it('sets user on successful me()', async () => {
    mockMe.mockResolvedValueOnce({ user: { username: 'bruno', role: 'admin', email: 'b@b.com' } })

    renderProvider()

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toContain('bruno')
    })
    expect(screen.getByTestId('isAdmin').textContent).toBe('true')
  })

  it('does not call refresh when remember is not set', async () => {
    renderProvider()
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))
    expect(mockRefresh).not.toHaveBeenCalled()
    expect(screen.getByTestId('user').textContent).toBe('null')
  })

  it('calls refresh when remember is set and me fails', async () => {
    setRememberSession(true)
    mockRefresh.mockReset()
    mockRefresh.mockResolvedValue({ user: { username: 'refreshed', role: 'user', email: 'r@b.com' } })

    renderProvider()

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toContain('refreshed')
    })
    expect(screen.getByTestId('isAdmin').textContent).toBe('false')
  })

  it('login sets user on success', async () => {
    mockMe.mockRejectedValueOnce(new Error('no session'))
    mockRefresh.mockRejectedValueOnce(new Error('no session'))
    mockLogin.mockResolvedValueOnce({ username: 'logged', role: 'admin', email: 'l@b.com' })

    renderProvider()
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))

    await screen.getByTestId('login').click()
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toContain('logged')
    })
  })

  it('logout clears user', async () => {
    mockMe.mockResolvedValueOnce({ user: { username: 'bruno', role: 'admin', email: 'b@b.com' } })

    renderProvider()
    await waitFor(() => expect(screen.getByTestId('user').textContent).toContain('bruno'))

    await screen.getByTestId('logout').click()
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('null')
    })
  })

  it('register calls backend and returns null on success', async () => {
    mockRegister.mockResolvedValueOnce(undefined)
    renderProvider()

    await screen.getByTestId('register').click()
    expect(mockRegister).toHaveBeenCalledWith('test@test.com', 'pass123@')
  })

  it('sendResetEmail returns error if email not registered', async () => {
    mockCheckEmail.mockResolvedValueOnce({ registered: false })
    renderProvider()

    await screen.getByTestId('checkEmail').click()
    expect(mockCheckEmail).toHaveBeenCalledWith('test@test.com')
  })

  it('sendResetEmail returns null if email registered', async () => {
    mockCheckEmail.mockResolvedValueOnce({ registered: true })
    renderProvider()

    await screen.getByTestId('checkEmail').click()
    expect(mockCheckEmail).toHaveBeenCalledWith('test@test.com')
  })

  it('doResetPassword calls backend', async () => {
    mockResetPassword.mockResolvedValueOnce(undefined)
    renderProvider()

    await screen.getByTestId('resetPassword').click()
    expect(mockResetPassword).toHaveBeenCalledWith('test@test.com', 'newpass@1')
  })
})
