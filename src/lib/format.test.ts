import { describe, expect, it, vi } from 'vitest'
import { formatMoney } from './format'

describe('formatMoney', () => {
  it('uses the SGD code and two decimals', () => {
    expect(formatMoney(4280.55)).toBe('SGD 4,280.55')
    expect(formatMoney(12840)).toBe('SGD 12,840.00')
    expect(formatMoney(-420.3)).toBe('-SGD 420.30')
  })
})

describe('formatShortDate', () => {
  it('formats in Singapore time regardless of the runner timezone', async () => {
    vi.stubEnv('TZ', 'UTC')
    vi.resetModules()
    try {
      const { formatShortDate } = await import('./format')
      // This instant is 18 Oct in UTC and 19 Oct in Singapore.
      expect(formatShortDate('2026-10-18T17:15:00Z')).toBe('19 Oct')
    } finally {
      vi.unstubAllEnvs()
    }
  })
})
