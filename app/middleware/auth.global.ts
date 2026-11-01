import { isAuthPublicPath, isValidAuthSession } from '~/utils/auth-session'

/**
 * 全局路由鉴权（仅客户端）：/login、/console 公开，其它页面须有有效会话。
 */
export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server)
    return

  if (isAuthPublicPath(to.path))
    return

  const { user, hydrate } = useAuth()
  hydrate()

  if (!isValidAuthSession(user.value)) {
    const localePath = useLocalePath()
    return navigateTo(localePath('/login'))
  }
})
