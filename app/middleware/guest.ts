import { isValidAuthSession } from '~/utils/auth-session'

/** 已登录访问登录页时直接进后台 */
export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server)
    return

  const { user, hydrate } = useAuth()
  hydrate()

  if (!isValidAuthSession(user.value))
    return

  const localePath = useLocalePath()
  return navigateTo(localePath('/'))
})
