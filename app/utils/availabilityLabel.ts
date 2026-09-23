import type { PortalAvailabilityRow } from '../types/api'

type LabelCode = PortalAvailabilityRow['label']['code']
type PillTone = 'neutral' | 'ok' | 'warn' | 'coral' | 'sand'

const REQUESTABLE: ReadonlySet<LabelCode> = new Set(['AVAILABLE', 'LIMITED', 'ONLY_N_LEFT'])

export function canRequestDeparture(code: LabelCode): boolean {
  return REQUESTABLE.has(code)
}

export function labelTone(code: LabelCode): PillTone {
  if (code === 'AVAILABLE') {
    return 'ok'
  }

  if (code === 'LIMITED' || code === 'ONLY_N_LEFT') {
    return 'warn'
  }

  if (code === 'FULL') {
    return 'coral'
  }

  return 'sand'
}
