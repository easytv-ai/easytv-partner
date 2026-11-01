import http from '~/api/http'

/** 登录相关接口（与创作台同一套 /user/*） */
export const userAuth = {
  /** POST /user/login，账号 + 密码 */
  login(data: { username: string, password: string }) {
    return http.post('/user/login', data)
  },

  /** GET /sms/verification?mobile= 发送登录验证码 */
  sendSmsVerification(mobile: string) {
    return http.get('/sms/verification', { mobile })
  },

  /** POST /user/sms_login 手机验证码登录（未注册会自动开户） */
  smsLogin(data: { mobile: string, code: string }) {
    return http.post('/user/sms_login', data)
  },

  /** POST /user/console_access/exchange 管理员代登 ticket 兑换 */
  exchangeConsoleAccess(ticket: string) {
    return http.post('/user/console_access/exchange', { ticket })
  },

  /** GET /user/logout */
  logout() {
    return http.get('/user/logout')
  },
}

export default userAuth
