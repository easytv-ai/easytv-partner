<script setup lang="ts">
/**
 * 申请入驻 / 审核状态页：
 * - 未申请：填表提交
 * - 待审：展示状态，可修改资料
 * - 已驳回：展示原因，修改后重新提交（后端自动回到待审）
 * - 已停用：只展示说明
 * - 已通过：直接去看板
 */
import partnerApi, { type PartnerKind } from '~/api/partner'
import { formatUnix, partnerStatusColor } from '~/utils/partnerDisplay'

const { t } = useI18n()
const localePath = useLocalePath()
const { notify } = useNotifyToast()
const { partner, status, state, hasApplied, isApproved, reload } = usePartnerSelf()

useHead({ title: () => t('apply.pageTitle') })

watch(isApproved, (v) => {
  if (v)
    void navigateTo(localePath('/'), { replace: true })
}, { immediate: true })

const submitting = ref(false)

const mode = computed<'apply' | 'pending' | 'rejected' | 'disabled'>(() => {
  if (!hasApplied.value)
    return 'apply'
  if (status.value === 2)
    return 'rejected'
  if (status.value === 3)
    return 'disabled'
  return 'pending'
})

const submitLabel = computed(() => mode.value === 'apply'
  ? t('apply.submit')
  : mode.value === 'rejected'
    ? t('apply.resubmit')
    : t('common.save'))

async function onSubmit(payload: { name: string, kind: PartnerKind, contact: string, intro: string }) {
  if (submitting.value)
    return
  submitting.value = true
  try {
    const res = mode.value === 'apply'
      ? await partnerApi.apply(payload)
      : await partnerApi.updateProfile(payload)
    if (!res?.success) {
      notify(res?.message ?? t('apply.submitFail'), 'error')
      return
    }
    notify(mode.value === 'apply' ? t('apply.submitted') : mode.value === 'rejected' ? t('apply.resubmitted') : t('settings.saved'))
    await reload()
  }
  finally {
    submitting.value = false
  }
}

const perks = computed(() => [
  { icon: 'i-lucide-percent', title: t('apply.perk1Title'), desc: t('apply.perk1Desc') },
  { icon: 'i-lucide-link', title: t('apply.perk2Title'), desc: t('apply.perk2Desc') },
  { icon: 'i-lucide-chart-line', title: t('apply.perk3Title'), desc: t('apply.perk3Desc') },
  { icon: 'i-lucide-banknote', title: t('apply.perk4Title'), desc: t('apply.perk4Desc') },
])
</script>

<template>
  <div class="console-container max-w-5xl">
    <ManagePageHeader
      :page-title="t(`apply.title.${mode}`)"
      :page-description="t(`apply.description.${mode}`)"
    />

    <div v-if="state === 'loading' || state === 'idle'" class="flex items-center justify-center py-16 text-zinc-400">
      <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin" aria-hidden="true" />
    </div>

    <div v-else class="grid gap-4 lg:grid-cols-3">
      <section class="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60 lg:col-span-2">
        <div v-if="hasApplied && partner" class="mb-5 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <UBadge :color="partnerStatusColor(status)" variant="subtle">{{ t(`partner.status${status}`) }}</UBadge>
              <span class="text-xs text-zinc-500 dark:text-zinc-400">{{ t('apply.appliedAt', { time: formatUnix(partner.applied_at) }) }}</span>
            </div>
            <span v-if="partner.reviewed_at" class="text-xs text-zinc-500 dark:text-zinc-400">{{ t('apply.reviewedAt', { time: formatUnix(partner.reviewed_at) }) }}</span>
          </div>
          <p v-if="mode === 'rejected' && partner.remark" class="mt-3 text-sm text-red-600 dark:text-red-400">
            {{ t('apply.rejectReason', { reason: partner.remark }) }}
          </p>
          <p v-else-if="mode === 'pending'" class="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
            {{ t('apply.pendingHint') }}
          </p>
          <p v-else-if="mode === 'disabled'" class="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
            {{ t('apply.disabledHint') }}
          </p>
        </div>

        <PartnerForm
          v-if="mode !== 'disabled'"
          :initial="partner"
          :submitting="submitting"
          :submit-label="submitLabel"
          @submit="onSubmit"
        />
      </section>

      <aside class="space-y-3">
        <div v-for="perk in perks" :key="perk.title" class="flex gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
          <span class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
            <UIcon :name="perk.icon" class="size-4" aria-hidden="true" />
          </span>
          <div>
            <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">{{ perk.title }}</p>
            <p class="mt-0.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{{ perk.desc }}</p>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>
