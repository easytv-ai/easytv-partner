import http from '~/api/http'

/**
 * 代理商后台接口（API.md 9.3 / 9.3.1）。
 * 伙伴用自己的 EasyTV 账号登录，只能看到本人名下归属客户的聚合数据。
 */

export type PartnerKind = 'mcn' | 'school' | 'kol' | 'dev' | 'other'
export const PARTNER_KINDS: PartnerKind[] = ['mcn', 'school', 'kol', 'dev', 'other']

/** 0 待审 / 1 已通过 / 2 已驳回 / 3 已停用 */
export type PartnerStatus = 0 | 1 | 2 | 3

export interface Partner {
  id: number
  user_id: number
  name: string
  kind: PartnerKind | string
  contact: string
  intro: string
  /** 审核通过时生成的专属码（P + 6 位） */
  code: string
  /** 0 表示沿用全局默认返佣比例 */
  rebate_rate: number
  status: PartnerStatus | number
  /** 审核备注（驳回原因） */
  remark: string
  customers: number
  paid_users: number
  amount_total: number
  rebate_total: number
  applied_at: number
  reviewed_at: number
  created_at: number
}

export interface PartnerRecentCustomer {
  nickname: string
  amount: number
  rebate: number
  created_at: number
}

export interface PartnerMonthSummary {
  new_customers: number
  paid_users: number
  orders: number
  amount: number
  rebate: number
}

/** GET /user/partner/console/overview */
export interface PartnerOverview {
  partner: Partner
  /** 已通过时才有：推广落地页链接 */
  link: string
  customers: number
  paid_users: number
  amount_total: number
  rebate_total: number
  /** 可提余额（元，用户 quota 折算） */
  withdrawable: number
  /** 实际生效返佣比例（0~1） */
  rebate_rate: number
  /** 归属起返佣有效月数 */
  rebate_months: number
  recent: PartnerRecentCustomer[]
  month: PartnerMonthSummary
  server_time: number
}

export interface PartnerStatRow {
  date: string
  new_customers: number
  orders: number
  amount: number
  rebate: number
}

export interface PartnerStats {
  rows: PartnerStatRow[]
  start_date: string
  end_date: string
  totals: PartnerStatRow
}

export type PartnerStatsRange = '7d' | '30d' | '90d'

export interface PartnerCustomer {
  id: number
  user_id: number
  /** 已脱敏 */
  nickname: string
  source: 'code' | 'link' | 'manual' | string
  first_paid_at: number
  amount: number
  rebate: number
  created_at: number
}

export interface PartnerCustomerQuery {
  paid?: '1' | '0'
  sort?: 'recent' | 'amount'
  page?: number
  page_size?: number
}

/** 资金流水（promoter_bill）；biz_type 9 返佣 / 6 冲回 / 3 提现出账 / 4 提现退回 */
export interface PartnerBill {
  id: number
  biz_type: number
  amount: number
  balance: number
  from_user_id: number
  from_nickname: string
  source_no: string
  source_amount: number
  rate: number
  status: number
  created_at: number
  remark: string
}

export const PARTNER_BILL_TYPES = [9, 6, 3, 4] as const

/** 提现单；status 0 待审核 / 2 打款中 / 1 已打款 / -1 打款失败 / -9 已驳回 */
export interface PartnerWithdraw {
  id: number
  withdraw_no: string
  amount: number
  fee: number
  actual_amount: number
  way: 'alipay' | 'wechat' | 'bank' | string
  account_info: string
  status: number
  audit_remark: string
  created_at: number
  complete_time: number
  failure_msg: string
}

export type WithdrawWay = 'alipay' | 'wechat' | 'bank'

export interface WithdrawPayload {
  amount: number
  way: WithdrawWay
  /** JSON 字符串：{ name, account, bank? } */
  account_info: string
}

export interface PartnerBonusCodeStats {
  claimed: number
  registered: number
  paid: number
  amount: number
  reward_points: number
  bonus_points: number
}

/** 口令红包（归属到我的），kind 1 首充加赠 / 2 定额积分 / 3 会员天数 */
export interface PartnerBonusCode {
  id: number
  code: string
  kind: number
  partner_name: string
  bonus_points: number
  bonus_valid_days: number
  first_recharge_rate: number
  first_recharge_cap_points: number
  reward_valid_days: number
  member_days: number
  max_claims: number
  claimed_count: number
  starts_at: number
  expires_at: number
  status: number
  remark: string
  created_at: number
  stats: PartnerBonusCodeStats
}

export interface PartnerApplyPayload {
  name: string
  kind: PartnerKind
  contact: string
  intro: string
}

export interface PartnerProfilePayload {
  name?: string
  kind?: PartnerKind
  contact: string
  intro: string
}

export interface PagedData<T> {
  items: T[]
  total: number
}

export const partnerApi = {
  /** 看板总览；未申请时 success=false, code="not_applied" */
  overview() {
    return http.get('/user/partner/console/overview')
  },

  stats(range: PartnerStatsRange) {
    return http.get('/user/partner/console/stats', { range })
  },

  customers(query: PartnerCustomerQuery) {
    return http.get('/user/partner/console/customers', query as Record<string, unknown>)
  },

  bonusCodes(query: { page?: number, page_size?: number }) {
    return http.get('/user/partner/console/bonus-codes', query as Record<string, unknown>)
  },

  /** 申请成为渠道伙伴；已申请过返回当前记录 */
  apply(payload: PartnerApplyPayload) {
    return http.post('/user/partner/apply', payload)
  },

  /** 自助改资料：待审可改全部，已驳回改完自动重新待审，已通过只能改联系方式 / 介绍 */
  updateProfile(payload: PartnerProfilePayload) {
    return http.put('/user/partner/console/profile', payload)
  },

  /** 资金流水（返佣 / 冲回 / 提现出账 / 提现退回） */
  bills(query: { page?: number, page_size?: number, biz_type?: string }) {
    return http.get('/user/bills/self', { biz_type: PARTNER_BILL_TYPES.join(','), ...query } as Record<string, unknown>)
  },

  withdraws(query: { page?: number, page_size?: number }) {
    return http.get('/user/withdraw/self', query as Record<string, unknown>)
  },

  /** 申请提现：余额为用户 quota 折算的人民币，申请即冻结 */
  applyWithdraw(payload: WithdrawPayload) {
    return http.post('/user/withdraw', payload)
  },
}

/** 接口统一的 { success, data } 判定 */
export function isOk(raw: any): boolean {
  return Boolean(raw && raw.success === true)
}

export function parsePaged<T = any>(raw: any): PagedData<T> | null {
  if (!isOk(raw))
    return null
  const data = raw.data ?? {}
  return {
    items: Array.isArray(data.items) ? data.items : [],
    total: Number(data.total) || 0,
  }
}

export default partnerApi
