<script setup lang="ts">
/**
 * 管理员免密进入：/console?ticket=… 兑换成该伙伴的会话后进看板。
 */
definePageMeta({ layout: 'simple' })

const route = useRoute()
const localePath = useLocalePath()
const { t } = useI18n()
const { tryExchangeConsoleAccess } = useAuth()
const { reset: resetPartner } = usePartnerSelf()

useHead({ title: () => t('auth.consoleAccessTitle') })

const error = ref('')

onMounted(async () => {
  const ticket = String(route.query.ticket ?? '').trim()
  if (!ticket) {
    error.value = t('auth.ticketInvalid')
    return
  }
  const res = await tryExchangeConsoleAccess(ticket)
  if (!res.ok) {
    error.value = res.message ?? t('auth.ticketInvalid')
    return
  }
  resetPartner()
  await navigateTo(localePath('/'), { replace: true })
})
</script>

<template>
  <div class="w-full max-w-md text-center">
    <template v-if="!error">
      <UIcon name="i-lucide-loader-circle" class="mx-auto size-8 animate-spin text-zinc-400" aria-hidden="true" />
      <p class="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
        {{ t('auth.consoleAccessLoading') }}
      </p>
    </template>
    <UCard v-else variant="outline" class="dark:bg-zinc-900/50">
      <p class="text-sm font-medium text-red-600 dark:text-red-400">
        {{ error }}
      </p>
      <UButton :to="localePath('/login')" class="mt-4" variant="soft" color="neutral">
        {{ t('auth.backToLogin') }}
      </UButton>
    </UCard>
  </div>
</template>
