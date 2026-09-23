const MONTH = /^(\d{4})-(\d{2})$/

function validMonth(value: string): boolean {
  const match = MONTH.exec(value)

  if (!match) {
    return false
  }

  const month = Number(match[2])

  return month >= 1 && month <= 12
}

function lastDay(yearMonth: string): string {
  const year = Number(yearMonth.slice(0, 4))
  const month = Number(yearMonth.slice(5, 7))
  const day = new Date(Date.UTC(year, month, 0)).getUTCDate()

  return `${yearMonth}-${String(day).padStart(2, '0')}`
}

export function monthToRange(fromMonth: string, toMonth: string): { from?: string, to?: string } {
  const from = validMonth(fromMonth) ? `${fromMonth}-01` : undefined
  const to = validMonth(toMonth) ? lastDay(toMonth) : undefined

  return { from, to }
}

export function availabilityPath(input: {
  fromMonth: string
  toMonth: string
  yacht: string
  itinerary: string
  page: number
}): string {
  const range = monthToRange(input.fromMonth, input.toMonth)
  const params = new URLSearchParams()

  if (range.from) {
    params.set('from', range.from)
  }

  if (range.to) {
    params.set('to', range.to)
  }

  const yacht = input.yacht.trim()
  const itinerary = input.itinerary.trim()

  if (yacht) {
    params.set('yacht', yacht)
  }

  if (itinerary) {
    params.set('itinerary', itinerary)
  }

  if (input.page > 1) {
    params.set('page', String(input.page))
  }

  const query = params.toString()

  return query ? `/api/portal/availability?${query}` : '/api/portal/availability'
}
