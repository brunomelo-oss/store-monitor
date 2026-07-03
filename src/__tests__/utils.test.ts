import { describe, it, expect } from 'vitest'
import { overallStatus, validatePassword, formatDate, formatInstallCount, ratingStars, daysLabel } from '@/lib/utils'
import { App } from '@/types'

const mockApp = (overrides: Partial<App> = {}): App => ({
  id: 1,
  name: 'Test',
  region: 'Brasil',
  googleAccount: 'sasTech',
  appleAccount: 'sasTech',
  playStore: { status: 'published', version: '1.0.0', lastUpdate: '2025-01-01' },
  appStore: { status: 'published', version: '1.0.0', lastUpdate: '2025-01-01' },
  installations: 1000,
  rating: 4.0,
  ...overrides,
})

describe('overallStatus', () => {
  it('returns worst status when both stores have data', () => {
    const app = mockApp({
      playStore: { status: 'published', version: '1.0.0', lastUpdate: '2025-01-01' },
      appStore: { status: 'rejected', version: '2.0.0', lastUpdate: '2025-01-01' },
    })
    expect(overallStatus(app)).toBe('rejected')
  })

  it('returns unpublished when no store has data', () => {
    const app = mockApp({
      playStore: { status: 'unpublished', version: '', lastUpdate: '' },
      appStore: { status: 'unpublished', version: '', lastUpdate: '' },
    })
    expect(overallStatus(app)).toBe('unpublished')
  })

  it('returns the only available store status', () => {
    const app = mockApp({
      playStore: { status: 'review', version: '1.0.0', lastUpdate: '2025-01-01' },
      appStore: { status: 'unpublished', version: '', lastUpdate: '' },
    })
    expect(overallStatus(app)).toBe('review')
  })
})

describe('validatePassword', () => {
  it('accepts valid passwords', () => {
    expect(validatePassword('Admin123@')).toBe(true)
    expect(validatePassword('Abcdefg!1')).toBe(true)
    expect(validatePassword('1234567a!')).toBe(true)
  })

  it('rejects short passwords', () => {
    expect(validatePassword('Ab1!')).toBe(false)
    expect(validatePassword('1234567!')).toBe(false)
  })

  it('rejects passwords without special chars', () => {
    expect(validatePassword('Admin1234')).toBe(false)
  })

  it('rejects passwords without letters', () => {
    expect(validatePassword('12345678!')).toBe(false)
  })
})

describe('formatDate', () => {
  it('formats YYYY-MM-DD to DD/MM/YYYY', () => {
    expect(formatDate('2025-01-15')).toBe('15/01/2025')
  })

  it('returns fallback for empty string', () => {
    expect(formatDate('')).toBe('--/--/----')
  })
})

describe('formatInstallCount', () => {
  it('formats with pt-BR locale', () => {
    expect(formatInstallCount(128000)).toBe('128.000')
  })
})

describe('ratingStars', () => {
  it('returns 5 stars for 5.0', () => {
    expect(ratingStars(5.0)).toEqual(['full', 'full', 'full', 'full', 'full'])
  })

  it('returns half star for .5', () => {
    expect(ratingStars(3.5)).toEqual(['full', 'full', 'full', 'half', 'empty'])
  })
})
