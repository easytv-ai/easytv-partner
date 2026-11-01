/**
 * 代理商后台登录 / 退出：复用创作台账号（/user/login、/user/sms_login），无角色要求。
 */

import userAuth from '~/api/user-auth'
import type { AuthUser } from '~/types/auth'
import {
  clearAuthStorage,
  isValidAuthSession,
  parseStoredAuthUser,
} from '~/utils/auth-session'
import { AUTH_USER_STORAGE_KEY } from '~/utils/auth-user'

export type { AuthUser }

export type TryLoginResult = { ok: true } | { ok: false, message?: string }
export type LogoutResult = { ok: true } | { ok: false, message?: string }

function isApiFailure(res: any): boolean {
  if (res == null)
    return true
  if (res.error === true)
    return true
  if (typeof res.statusCode === 'number' && res.statusCode >= 400)
    return true
  if (res.success === false)
    return true
  return false
}

function userFromLoginResponse(res: any, fallbackUsername: string): AuthUser {
  const data = (res?.data ?? {}) as Record<string, unknown>
  const authUser: AuthUser = {
    id: (data.id as number | undefined) ?? undefined,
    username: String(data.username ?? fallbackUsername),
    nickname: String(data.nickname ?? ''),
    role: Number(data.role ?? 0) || 0,
    access_token: String(data.access_token ?? '').trim() || undefined,
  }
  if (data.console_access === true)
    authUser.console_access = true
  return authUser
}

export function useAuth() {
  const user = useState<AuthUser | null>('easytv-partner-auth-user', () => null)
  const isLoggedIn = useState('isLoggedIn', () => false)

  function syncLoginState() {
    if (!import.meta.client)
      return
    isLoggedIn.value = isValidAuthSession(user.value)
  }

  function hydrate() {
    if (!import.meta.client)
      return
    try {
      const raw = localStorage.getItem(AUTH_USER_STORAGE_KEY)
      if (!raw) {
        user.value = null
      }
      else {
        const parsed = parseStoredAuthUser(raw)
        if (parsed) {
          user.value = parsed
        }
        else {
          clearAuthStorage()
          user.value = null
        }
      }
    }
    catch {
      clearAuthStorage()
      user.value = null
    }
    syncLoginState()
  }

  function setUser(u: AuthUser | null) {
    const next = u && isValidAuthSession(u) ? u : null
    user.value = next
    isLoggedIn.value = isValidAuthSession(next)
    if (import.meta.client) {
      if (next)
        localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(next))
      else
        clearAuthStorage()
    }
  }

  function applyLoginResponse(res: any, fallbackUsername: string, failMessage: string): TryLoginResult {
    if (isApiFailure(res))
      return { ok: false, message: res?.message ?? res?.statusMessage ?? failMessage }
    const authUser = userFromLoginResponse(res, fallbackUsername)
    if (!isValidAuthSession(authUser))
      return { ok: false, message: res?.message ?? failMessage }
    setUser(authUser)
    return { ok: true }
  }

  /** 账号 + 密码 */
  async function tryLogin(username: string, password: string): Promise<TryLoginResult> {
    try {
      const res = await userAuth.login({ username: username.trim(), password })
      return applyLoginResponse(res, username.trim(), '账号或密码错误')
    }
    catch {
      return { ok: false, message: '网络错误，请稍后重试' }
    }
  }

  /** 手机验证码 */
  async function trySmsLogin(mobile: string, code: string): Promise<TryLoginResult> {
    try {
      const res = await userAuth.smsLogin({ mobile: mobile.trim(), code: code.trim() })
      return applyLoginResponse(res, mobile.trim(), '验证码错误或已过期')
    }
    catch {
      return { ok: false, message: '网络错误，请稍后重试' }
    }
  }

  /** 管理员代登：兑换 ticket，覆盖本地会话 */
  async function tryExchangeConsoleAccess(ticket: string): Promise<TryLoginResult> {
    const trimmed = String(ticket ?? '').trim()
    if (!trimmed)
      return { ok: false, message: '访问凭证无效或已过期' }
    try {
      setUser(null)
      const res = await userAuth.exchangeConsoleAccess(trimmed)
      return applyLoginResponse(res, '', '访问凭证无效或已过期')
    }
    catch {
      return { ok: false, message: '网络错误，请稍后重试' }
    }
  }

  /** 代登会话只清本地，不作废用户本人的令牌 */
  async function logout(): Promise<LogoutResult> {
    const consoleAccess = user.value?.console_access === true
    if (!consoleAccess) {
      try {
        await userAuth.logout()
      }
      catch {
        /* 忽略网络错误，本地会话照常清除 */
      }
    }
    setUser(null)
    return { ok: true }
  }

  return {
    user: readonly(user),
    isLoggedIn,
    hydrate,
    syncLoginState,
    setUser,
    logout,
    tryLogin,
    trySmsLogin,
    tryExchangeConsoleAccess,
  }
}
