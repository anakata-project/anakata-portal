import { describe, expect, it } from 'vitest'
import { portalPayKind } from '../../app/utils/portalPay'

const open = {
  status: 'REQUESTED' as const,
  payment_state: 'Awaiting deposit' as const,
  open_payment_kinds: [] as Array<string>
}

describe('portalPayKind', () => {
  it('offers a deposit while the booking is awaiting one', () => {
    expect(portalPayKind(open)).toBe('DEPOSIT')
  })

  it('offers the balance after the deposit is received', () => {
    expect(portalPayKind({
      ...open,
      status: 'CONFIRMED',
      payment_state: 'Deposit received'
    })).toBe('BALANCE')
  })

  it('offers nothing when the booking is paid, closed, or that link is already open', () => {
    expect(portalPayKind({ ...open, payment_state: 'Paid in full' })).toBeNull()
    expect(portalPayKind({ ...open, status: 'CANCELLED' })).toBeNull()
    expect(portalPayKind({ ...open, status: 'CANCELLED_POSTPAID' })).toBeNull()
    expect(portalPayKind({ ...open, status: 'RELEASED' })).toBeNull()
    expect(portalPayKind({ ...open, open_payment_kinds: ['DEPOSIT'] })).toBeNull()
    expect(portalPayKind({
      ...open,
      payment_state: 'Deposit received',
      open_payment_kinds: ['BALANCE']
    })).toBeNull()
  })
})
