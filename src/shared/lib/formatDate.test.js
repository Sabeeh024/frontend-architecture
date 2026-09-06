import { describe, expect, it } from 'vitest'
import { formatDate } from './formatDate'

// Layer: pure function. No setup, no mocks, no DOM — input in, output out.
describe('formatDate', () => {
  it('formats an ISO string as a short date', () => {
    expect(formatDate('2026-08-20T10:00:00Z')).toBe('Aug 20, 2026')
  })

  it('is stable regardless of the time component', () => {
    expect(formatDate('2026-01-01T23:59:59Z')).toBe('Jan 1, 2026')
  })
})
