import type { PortalBooking } from '../types/api'

export type PortalPayKind = 'DEPOSIT' | 'BALANCE'

const closedStatuses = new Set<PortalBooking['status']>([
  'CANCELLED',
  'CANCELLED_POSTPAID',
  'RELEASED'
])

export function portalPayKind(row: {
  status: PortalBooking['status']
  payment_state: PortalBooking['payment_state']
  open_payment_kinds: Array<string>
}): PortalPayKind | null {
  if (closedStatuses.has(row.status)) {
    return null
  }

  if (row.payment_state === 'Awaiting deposit' && !row.open_payment_kinds.includes('DEPOSIT')) {
    return 'DEPOSIT'
  }

  if (row.payment_state === 'Deposit received' && !row.open_payment_kinds.includes('BALANCE')) {
    return 'BALANCE'
  }

  return null
}

export function openPaymentUrl(url: string): void {
  window.location.assign(url)
}
