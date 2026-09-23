import { sessionDecision } from '../utils/session'

export default defineNuxtRouteMiddleware(async (to) => {
  const { ensureSession, isSignedIn } = usePortalSession()

  await ensureSession()

  const decision = sessionDecision(to.fullPath, isSignedIn.value)

  if (decision.type === 'redirect') {
    return navigateTo(decision.to)
  }
})
