import { describe, it, expect } from 'vitest'
import { overallStatus, validateVersion, safeDate, formatLocaleDate, statusColor, nextId } from './utils'
import type { App } from './types'

function makeApp(play: Partial<App['playStore']> = {}, app: Partial<App['appStore']> = {}): App {
  return {
    id: 1,
    name: 'Teste',
    region: 'Brasil',
    googleAccount: 'sasTech',
    appleAccount: 'sasTech',
    playStore: { status: 'published', version: '1.0.0', lastUpdate: '2026-08-01', ...play },
    appStore: { status: 'published', version: '1.0.0', lastUpdate: '2026-08-01', ...app },
    installations: 0,
    rating: 0,
  }
}

describe('utils', () => {
  it('validateVersion accepts only semantic versions', () => {
    expect(validateVersion('1.2.3')).toBe(true)
    expect(validateVersion('0.0.1')).toBe(true)
    expect(validateVersion('1.2')).toBe(false)
    expect(validateVersion('abc')).toBe(false)
    expect(validateVersion('1.2.3.4')).toBe(false)
  })

  it('safeDate handles invalid values', () => {
    expect(safeDate('2026-08-01')).toBeInstanceOf(Date)
    expect(safeDate('')).toBeNull()
    expect(safeDate(null)).toBeNull()
    expect(safeDate('not-a-date')).toBeNull()
  })

  it('formatLocaleDate returns a dash for invalid input', () => {
    expect(formatLocaleDate('not-a-date')).toBe('—')
    expect(formatLocaleDate(undefined)).toBe('—')
  })

  it('statusColor covers all statuses', () => {
    for (const s of ['published', 'review', 'rejected', 'pending', 'unpublished']) {
      expect(statusColor(s)).toMatch(/^text-/)
    }
    expect(statusColor('whatever')).toBe('text-muted-foreground')
  })

  it('nextId computes max + 1', () => {
    expect(nextId([{ id: 1 }, { id: 5 }, { id: 3 }])).toBe(6)
    expect(nextId([])).toBe(1)
  })

  it('overallStatus picks the worst published store', () => {
    expect(overallStatus(makeApp())).toBe('published')
    expect(overallStatus(makeApp({ status: 'rejected' }))).toBe('rejected')
    expect(overallStatus(makeApp({ status: 'review' }))).toBe('review')
    expect(overallStatus(makeApp({ status: 'rejected' }, { status: 'review' }))).toBe('rejected')
    expect(overallStatus(makeApp({ version: '-' }, { version: '-' }))).toBe('unpublished')
  })
})