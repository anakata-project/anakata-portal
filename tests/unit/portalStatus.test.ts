import { describe, expect, it } from 'vitest'
import { listPath } from '../../app/utils/listPath'
import { bookingStatusTone, commissionStatusTone } from '../../app/utils/portalStatus'

describe('listPath', () => {
  it('omits the first page and sends a later page', () => {
    expect(listPath('/api/portal/bookings', 1)).toBe('/api/portal/bookings')
    expect(listPath('/api/portal/bookings', 2)).toBe('/api/portal/bookings?page=2')
  })
})

describe('bookingStatusTone', () => {
  it('maps confirmed, held, ended and requested', () => {
    expect(bookingStatusTone('CONFIRMED')).toBe('ok')
    expect(bookingStatusTone('FULLY_PAID')).toBe('ok')
    expect(bookingStatusTone('ON_HOLD_AGENCY')).toBe('warn')
    expect(bookingStatusTone('PENDING_PAYMENT')).toBe('warn')
    expect(bookingStatusTone('CANCELLED')).toBe('coral')
    expect(bookingStatusTone('RELEASED')).toBe('coral')
    expect(bookingStatusTone('REQUESTED')).toBe('sand')
  })
})

describe('commissionStatusTone', () => {
  it('maps the five accrual statuses', () => {
    expect(commissionStatusTone('BLOCKED')).toBe('coral')
    expect(commissionStatusTone('EARNED_ON_COMPLETION')).toBe('sand')
    expect(commissionStatusTone('PAYABLE')).toBe('warn')
    expect(commissionStatusTone('PAID')).toBe('ok')
    expect(commissionStatusTone('CANCELLED')).toBe('coral')
  })
})
