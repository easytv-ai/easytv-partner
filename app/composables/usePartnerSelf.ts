import partnerApi, { type PartnerOverview } from '~/api/partner'

export type PartnerLoadState = 'idle' | 'loading' | 'ready' | 'not_applied' | 'error'

/**
 * 当前登录用户的伙伴总览（全局共享）：控制台布局据此决定进申请页还是看板，
 * 各页面复用同一份数据，保存资料 / 提现后调用 reload() 刷新。
 */
export function usePartnerSelf() {
  const overview = useState<PartnerOverview | null>('easytv-partner-overview', () => null)
  const state = useState<PartnerLoadState>('easytv-partner-overview-state', () => 'idle')
  const errorMessage = useState<string>('easytv-partner-overview-error', () => '')
  const inflight = useState<Promise<void> | null>('easytv-partner-overview-inflight', () => null)

  const partner = computed(() => overview.value?.partner ?? null)
  const status = computed(() => Number(partner.value?.status ?? -1))
  const isApproved = computed(() => status.value === 1)
  const hasApplied = computed(() => !!partner.value)

  async function fetchOverview() {
    state.value = 'loading'
    errorMessage.value = ''
    try {
      const res = await partnerApi.overview()
      if (res?.success && res.data) {
        overview.value = res.data as PartnerOverview
        state.value = 'ready'
        return
      }
      overview.value = null
      if (res?.code === 'not_applied') {
        state.value = 'not_applied'
        return
      }
      state.value = 'error'
      errorMessage.value = String(res?.message ?? '')
    }
    catch {
      overview.value = null
      state.value = 'error'
    }
  }

  /** 首次进入时加载；重复调用复用进行中的请求 */
  function ensureLoaded(): Promise<void> {
    if (state.value === 'ready' || state.value === 'not_applied')
      return Promise.resolve()
    return reload()
  }

  function reload(): Promise<void> {
    if (inflight.value)
      return inflight.value
    const p = fetchOverview().finally(() => {
      inflight.value = null
    })
    inflight.value = p
    return p
  }

  function reset() {
    overview.value = null
    state.value = 'idle'
    errorMessage.value = ''
  }

  return {
    overview,
    partner,
    state,
    status,
    isApproved,
    hasApplied,
    errorMessage,
    ensureLoaded,
    reload,
    reset,
  }
}
