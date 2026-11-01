<script setup lang="ts">
/**
 * 资料设置：已通过审核后只能改联系方式与介绍；名称 / 类型锁定。
 */
import partnerApi, { type PartnerKind } from '~/api/partner'
import { formatRate, formatUnix, partnerStatusColor } from '~/utils/partnerDisplay'

const { t } = useI18n()
const { notify } = useNotifyToast()
const { user } = useAuth()
const { overview, partner, status, reload } = usePartnerSelf()

useHead({ title: () => t('settings.pageTitle') })

const submitting = ref(false)

async function onSubmit(payload: { name: string, kind: PartnerKind, contact: string, intro: string }) {
  if (submitting.value)
    return
  submitting.value = true
  try {
    const res = await partnerApi.updateProfile({ contact: payload.contact, intro: payload.intro })
    if (!res?.success) {
      notify(res?.message ?? t('common.saveFail'), 'error')
      return
    }
    notify(t('settings.saved'))
    await reload()
  }
  finally {
    submitting.value = false
  }
}

const kindLabel = computed(() => partner.value ? t(`partner.kind.${partner.value.kind}`) : '—')
</script>

<template>
  <div class="console-container">
    <ManagePageHeader page-title-key="settings.title" page-description-key="settings.description" />

    <div class="grid gap-4 lg:grid-cols-3">
      <section class="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60 lg:col-span-2">
        <h2 class="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          {{ t('settings.profileTitle') }}
        </h2>
        <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {{ t('settings.profileDesc') }}
        </p>
        <div class="mt-5">
          <PartnerForm
            :initial="partner"
            lock-identity
            :submitting="submitting"
            :submit-label="t('common.save')"
            @submit="onSubmit"
          />
        </div>
      </section>

      <section class="space-y-4">
        <div class="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60">
          <h2 class="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            {{ t('settings.partnerTitle') }}
          </h2>
          <dl class="mt-3 space-y-2.5 text-sm">
            <div class="flex items-center justify-between gap-3">
              <dt class="text-zinc-500 dark:text-zinc-400">{{ t('common.status') }}</dt>
              <dd><UBadge :color="partnerStatusColor(status)" variant="subtle" size="sm">{{ t(`partner.status${status}`) }}</UBadge></dd>
            </div>
            <div class="flex items-center justify-between gap-3">
              <dt class="text-zinc-500 dark:text-zinc-400">{{ t('apply.kind') }}</dt>
              <dd class="font-medium">{{ kindLabel }}</dd>
            </div>
            <div class="flex items-center justify-between gap-3">
              <dt class="text-zinc-500 dark:text-zinc-400">{{ t('partner.code') }}</dt>
              <dd class="font-mono font-medium">{{ partner?.code || '—' }}</dd>
            </div>
            <div class="flex items-center justify-between gap-3">
              <dt class="text-zinc-500 dark:text-zinc-400">{{ t('settings.rebateRate') }}</dt>
              <dd class="font-medium">{{ formatRate(overview?.rebate_rate ?? 0) }}</dd>
            </div>
            <div class="flex items-center justify-between gap-3">
              <dt class="text-zinc-500 dark:text-zinc-400">{{ t('settings.appliedAt') }}</dt>
              <dd class="text-zinc-700 dark:text-zinc-300">{{ formatUnix(partner?.applied_at) }}</dd>
            </div>
            <div class="flex items-center justify-between gap-3">
              <dt class="text-zinc-500 dark:text-zinc-400">{{ t('settings.reviewedAt') }}</dt>
              <dd class="text-zinc-700 dark:text-zinc-300">{{ formatUnix(partner?.reviewed_at) }}</dd>
            </div>
          </dl>
        </div>

        <div class="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60">
          <h2 class="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            {{ t('settings.accountTitle') }}
          </h2>
          <dl class="mt-3 space-y-2.5 text-sm">
            <div class="flex items-center justify-between gap-3">
              <dt class="text-zinc-500 dark:text-zinc-400">{{ t('common.userId') }}</dt>
              <dd class="font-mono font-medium">{{ user?.id ?? '—' }}</dd>
            </div>
            <div class="flex items-center justify-between gap-3">
              <dt class="text-zinc-500 dark:text-zinc-400">{{ t('settings.account') }}</dt>
              <dd class="max-w-[12rem] truncate font-medium">{{ user?.username || '—' }}</dd>
            </div>
            <div v-if="user?.nickname" class="flex items-center justify-between gap-3">
              <dt class="text-zinc-500 dark:text-zinc-400">{{ t('settings.nickname') }}</dt>
              <dd class="max-w-[12rem] truncate font-medium">{{ user.nickname }}</dd>
            </div>
          </dl>
          <p class="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
            {{ t('settings.accountHint') }}
          </p>
        </div>
      </section>
    </div>
  </div>
</template>
