export const HOME = '/rates'

export const SESSION_NOTICE = 'session'

export const AUTH_PATHS = [
  '/login',
  '/forgot',
  '/reset-password',
  '/accept'
] as const

export function pathnameOf(path: string): string {
  return path.split('?')[0]?.split('#')[0] ?? path
}

export function isAuthPath(path: string): boolean {
  return (AUTH_PATHS as ReadonlyArray<string>).includes(pathnameOf(path))
}

export function sanitizeRedirect(raw: unknown): string | null {
  if (typeof raw !== 'string') {
    return null
  }

  if (!raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) {
    return null
  }

  if (isAuthPath(raw) || pathnameOf(raw) === '/') {
    return null
  }

  return raw
}

export function postLoginPath(redirect: unknown): string {
  return sanitizeRedirect(redirect) ?? HOME
}

export function loginTarget(
  redirect?: unknown
): '/login' | { path: '/login', query: { redirect: string } } {
  const safe = sanitizeRedirect(redirect)

  if (safe === null) {
    return '/login'
  }

  return { path: '/login', query: { redirect: safe } }
}

export function lostSessionTarget(): { path: '/login', query: { notice: typeof SESSION_NOTICE } } {
  return { path: '/login', query: { notice: SESSION_NOTICE } }
}

export type SessionRedirect = '/login' | typeof HOME | { path: '/login', query: { redirect: string } }

export function sessionDecision(
  path: string,
  signedIn: boolean
): { type: 'allow' } | { type: 'redirect', to: SessionRedirect } {
  const pathname = pathnameOf(path)

  if (signedIn && (pathname === '/login' || pathname === '/')) {
    return { type: 'redirect', to: HOME }
  }

  if (isAuthPath(path)) {
    return { type: 'allow' }
  }

  if (!signedIn) {
    return { type: 'redirect', to: loginTarget(path) }
  }

  return { type: 'allow' }
}

export function unauthorizedSessionAction(signedIn: boolean):
  | { clear: false }
  | { clear: true, to: ReturnType<typeof lostSessionTarget> } {
  if (!signedIn) {
    return { clear: false }
  }

  return { clear: true, to: lostSessionTarget() }
}
