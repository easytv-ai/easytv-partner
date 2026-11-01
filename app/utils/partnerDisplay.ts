/** 代理商后台的展示格式化：金额（人民币）、比例、时间、状态。 */

export function formatMoney(v: unknown, fractionDigits = 2): string {
  const n = Number(v) || 0
  return `¥${n.toLocaleString('zh-CN', { minimumFractionDigits: fractionDigits, maximumFractionDigits: 2 })}`
}

export function formatNumber(v: unknown): string {
  return (Number(v) || 0).toLocaleString()
}

/** 0.15 → 15% */
export function formatRate(v: unknown): string {
  const n = Number(v) || 0
  return `${Math.round(n * 10000) / 100}%`
}

/** Unix 秒 → YYYY-MM-DD HH:mm */
export function formatUnix(ts: number | null | undefined): string {
  const v = Number(ts) || 0
  if (!v)
    return '—'
  const d = new Date(v * 1000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Unix 秒 → YYYY-MM-DD */
export function formatUnixDate(ts: number | null | undefined): string {
  const v = Number(ts) || 0
  if (!v)
    return '—'
  const d = new Date(v * 1000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export type BadgeColor = 'primary' | 'success' | 'error' | 'warning' | 'info' | 'neutral'

/** 伙伴状态 0 待审 / 1 已通过 / 2 已驳回 / 3 已停用 */
export function partnerStatusColor(status: number): BadgeColor {
  if (status === 1)
    return 'success'
  if (status === 2)
    return 'error'
  if (status === 3)
    return 'neutral'
  return 'warning'
}

/** 提现状态 0 待审核 / 2 打款中 / 1 已打款 / -1 打款失败 / -9 已驳回 */
export function withdrawStatusKey(status: number): string {
  switch (status) {
    case 1: return 'paid'
    case 2: return 'paying'
    case -1: return 'failed'
    case -9: return 'rejected'
    default: return 'pending'
  }
}

export function withdrawStatusColor(status: number): BadgeColor {
  switch (status) {
    case 1: return 'success'
    case 2: return 'info'
    case -1: return 'error'
    case -9: return 'neutral'
    default: return 'warning'
  }
}

/** 流水类型 9 返佣 / 6 冲回 / 3 提现出账 / 4 提现退回 */
export function billTypeKey(bizType: number): string {
  switch (bizType) {
    case 9: return 'rebate'
    case 6: return 'revoke'
    case 3: return 'withdraw'
    case 4: return 'withdrawRefund'
    default: return 'other'
  }
}

export function billTypeColor(bizType: number): BadgeColor {
  switch (bizType) {
    case 9: return 'success'
    case 6: return 'error'
    case 3: return 'info'
    case 4: return 'warning'
    default: return 'neutral'
  }
}

/** 提现收款账户 JSON → 一行文本 */
export function accountInfoText(raw: string): string {
  if (!raw)
    return '—'
  try {
    const obj = JSON.parse(raw) as Record<string, unknown>
    return ['bank_name', 'name', 'account']
      .map(k => String(obj[k] ?? '').trim())
      .filter(Boolean)
      .join(' · ') || raw
  }
  catch {
    return raw
  }
}

/** 口令状态：0 停用 / 未开始 / 已过期 / 已领完 / 启用 */
export function bonusCodeStateKey(code: { status: number, starts_at: number, expires_at: number, max_claims: number, claimed_count: number }, now = Math.floor(Date.now() / 1000)): string {
  if (code.status !== 1)
    return 'disabled'
  if (code.starts_at && code.starts_at > now)
    return 'notStarted'
  if (code.expires_at && code.expires_at < now)
    return 'expired'
  if (code.max_claims > 0 && code.claimed_count >= code.max_claims)
    return 'soldOut'
  return 'active'
}

export function bonusCodeStateColor(key: string): BadgeColor {
  switch (key) {
    case 'active': return 'success'
    case 'notStarted': return 'info'
    case 'expired': return 'neutral'
    case 'soldOut': return 'warning'
    default: return 'neutral'
  }
}

export async function copyText(text: string): Promise<boolean> {
  if (!text)
    return false
  try {
    await navigator.clipboard.writeText(text)
    return true
  }
  catch {
    return false
  }
}
