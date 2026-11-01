import { clearAuthStorage, isValidAuthSession } from '~/utils/auth-session'

/**
 * 控制台布局鉴权闸门：有有效会话才渲染；再按伙伴状态决定是否只能停在申请页。
 */
export function useAuthGate() {
  const localePath = useLocalePath()
  const route = useRoute()
  const { user, hydrate, setUser } = useAuth()
  const partnerSelf = usePartnerSelf()
  const ready = ref(false)

  /** 不要求「已通过审核」的页面 */
  function isOpenPath(path: string) {
    const last = path.split('/').filter(Boolean).pop() ?? ''
    return last === 'apply'
  }

  async function enforce() {
    if (!import.meta.client)
      return false

    hydrate()
    if (!isValidAuthSession(user.value)) {
      clearAuthStorage()
      setUser(null)
      ready.value = false
      await navigateTo(localePath('/login'))
      return false
    }

    await partnerSelf.ensureLoaded()
    if (partnerSelf.state.value === 'error') {
      // 接口异常时仍放行（页面各自提示），避免整站白屏
      ready.value = true
      return true
    }
    if (!partnerSelf.isApproved.value && !isOpenPath(route.path)) {
      await navigateTo(localePath('/apply'), { replace: true })
    }
    ready.value = true
    return true
  }

  onMounted(() => {
    void enforce()
  })

  // 审核状态变化（例如刚提交申请）时重新判定
  watch(() => partnerSelf.status.value, () => {
    if (ready.value && !partnerSelf.isApproved.value && !isOpenPath(route.path))
      void navigateTo(localePath('/apply'), { replace: true })
  })

  return { ready, enforce, user }
}
