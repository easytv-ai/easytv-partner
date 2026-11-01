import type { AuthUser } from '~/types/auth'
import { AUTH_USER_STORAGE_KEY } from '~/utils/auth-user'

/** 是否为可视为已登录的有效会话（须同时有用户 id 与访问令牌） */
export function isValidAuthSession(user: AuthUser | null | undefined): boolean {
  if (!user)
    return false
  const id = user.id
  const token = String(user.access_token ?? user.token ?? '').trim()
  return id != null && String(id) !== '' && token.length > 0
}

export function parseStoredAuthUser(raw: string): AuthUser | null {
  try {
    const parsed = JSON.parse(raw) as AuthUser
    return isValidAuthSession(parsed) ? parsed : null
  }
  catch {
    return null
  }
}

export function clearAuthStorage() {
  if (!import.meta.client)
    return
  try {
    localStorage.removeItem(AUTH_USER_STORAGE_KEY)
  }
  catch {
    /* ignore */
  }
}

/** 无需登录的页面：登录页、代登落地页（兼容 i18n 前缀） */
export function isAuthPublicPath(path: string): boolean {
  const last = path.split('/').filter(Boolean).pop() ?? ''
  return last === 'login' || last === 'console'
}

export const SESSION_EXPIRED_QUERY = { reason: 'session_expired' } as const

/** 登录类接口的 401 表示凭据错误，不应触发会话过期跳转 */
export function isAuthEntryApiPath(url: string): boolean {
  return /\/user\/(?:login|sms_login|register|logout|console_access\/exchange)(?:\?|$)/.test(url)
}

let unauthorizedRedirectPending = false

/** 避免并发 401 重复跳转登录页 */
export function tryBeginUnauthorizedRedirect(): boolean {
  if (!import.meta.client || unauthorizedRedirectPending)
    return false
  if (isAuthPublicPath(window.location.pathname))
    return false
  unauthorizedRedirectPending = true
  return true
}

/** API 在 access token 无效时可能返回 HTTP 200 + success:false */
export function isAccessTokenInvalidResponse(data: unknown): boolean {
  if (!data || typeof data !== 'object')
    return false
  const body = data as { success?: boolean, message?: string }
  if (body.success !== false)
    return false
  const msg = String(body.message ?? '').toLowerCase()
  return msg.includes('access token')
    || msg.includes('token 无效')
    || msg.includes('token 無效')
    || msg.includes('invalid access token')
    || msg.includes('未提供用户标识')
}
