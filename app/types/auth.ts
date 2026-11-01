export interface AuthUser {
  id?: number | string
  username: string
  nickname?: string
  email?: string
  role?: number
  access_token?: string
  token?: string
  /** 管理员凭 ticket 代登时为 true：退出只清本地会话，不作废用户本人的令牌 */
  console_access?: boolean
  [key: string]: unknown
}
