import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { useShake } from '@/hooks/useShake'

function TestComp() {
  const { shaking, trigger } = useShake()
  return (
    <div>
      <span data-testid="shaking">{shaking ? 'true' : 'false'}</span>
      <button data-testid="trigger" onClick={trigger}>shake</button>
    </div>
  )
}

afterEach(() => { vi.restoreAllMocks() })

describe('useShake', () => {
  it('starts with shaking false', () => {
    render(<TestComp />)
    expect(screen.getByTestId('shaking').textContent).toBe('false')
  })

  it('sets shaking true on trigger', () => {
    render(<TestComp />)
    act(() => screen.getByTestId('trigger').click())
    expect(screen.getByTestId('shaking').textContent).toBe('true')
  })

  it('resets shaking after 500ms', async () => {
    vi.useFakeTimers()
    render(<TestComp />)
    act(() => screen.getByTestId('trigger').click())
    expect(screen.getByTestId('shaking').textContent).toBe('true')
    act(() => { vi.advanceTimersByTime(500) })
    expect(screen.getByTestId('shaking').textContent).toBe('false')
    vi.useRealTimers()
  })
})
