<script setup lang="ts">
/**
 * 看板：累计 / 本月指标卡、日趋势图、最近归属客户。
 */
import partnerApi, { type PartnerStats, type PartnerStatsRange } from '~/api/partner'
import { copyText, formatMoney, formatNumber, formatRate, formatUnix } from '~/utils/partnerDisplay'

const { t } = useI18n()
const localePath = useLocalePath()
const { notify } = useNotifyToast()
const { overview, partner, isApproved, reload, state } = usePartnerSelf()

useHead({ title: () => t('dashboard.pageTitle') })

const overviewLoading = computed(() => state.value === 'loading' || state.value === 'idle')

const totalCards = computed(() => {
  const o = overview.value
  return [
    {
      icon: 'i-lucide-users',
      label: t('dashboard.cardCustomers'),
      value: o ? formatNumber(o.customers) : '—',
      sub: o ? t('dashboard.cardCustomersSub', { n: formatNumber(o.paid_users) }) : '',
    },
    {
      icon: 'i-lucide-receipt',
      label: t('dashboard.cardAmount'),
      value: o ? formatMoney(o.amount_total) : '—',
      sub: o ? t('dashboard.cardAmountSub', { rate: formatRate(o.rebate_rate) }) : '',
    },
    {
      icon: 'i-lucide-hand-coins',
      label: t('dashboard.cardRebate'),
      value: o ? formatMoney(o.rebate_total) : '—',
      sub: o ? t('dashboard.cardRebateSub', { months: o.rebate_months }) : '',
    },
    {
      icon: 'i-lucide-wallet',
      label: t('dashboard.cardWithdrawable'),
      value: o ? formatMoney(o.withdrawable) : '—',
      sub: t('dashboard.cardWithdrawableSub'),
    },
  ]
})

const monthCards = computed(() => {
  const m = overview.value?.month
  return [
    { icon: 'i-lucide-user-plus', label: t('dashboard.monthNewCustomers'), value: m ? formatNumber(m.new_customers) : '—' },
    { icon: 'i-lucide-badge-check', label: t('dashboard.monthPaidUsers'), value: m ? formatNumber(m.paid_users) : '—' },
    { icon: 'i-lucide-shopping-bag', label: t('dashboard.monthOrders'), value: m ? formatNumber(m.orders) : '—', sub: m ? formatMoney(m.amount) : '' },
    { icon: 'i-lucide-coins', label: t('dashboard.monthRebate'), value: m ? formatMoney(m.rebate) : '—' },
  ]
})

/* ---------- 趋势 ---------- */

const range = ref<PartnerStatsRange>('30d')
const rangeItems = computed(() => [
  { label: t('dashboard.range7d'), value: '7d' },
  { label: t('dashboard.range30d'), value: '30d' },
  { label: t('dashboard.range90d'), value: '90d' },
])
const stats = ref<PartnerStats | null>(null)
const statsLoading = ref(false)

async function loadStats() {
  if (!isApproved.value)
    return
  statsLoading.value = true
  try {
    const res = await partnerApi.stats(range.value)
    if (res?.success && res.data)
      stats.value = res.data as PartnerStats
    else if (res?.message)
      notify(res.message, 'error')
  }
  finally {
    statsLoading.value = false
  }
}

watch(range, () => void loadStats())
watch(isApproved, (v) => {
  if (v)
    void loadStats()
}, { immediate: true })

const rangeTotals = computed(() => stats.value?.totals)

async function copyLink() {
  const link = overview.value?.link ?? ''
  if (await copyText(link))
    notify(t('materials.linkCopied'))
  else
    notify(t('common.copyFail'), 'error')
}

const fetchAll = useClientListFetch(async () => {
  await Promise.all([reload(), loadStats()])
})
</script>

<template>
  <div class="console-container">
    <ManagePageHeader
      :page-title="partner?.name ? t('dashboard.titleNamed', { name: partner.name }) : t('dashboard.title')"
      :page-description="t('dashboard.description')"
    >
      <template #actions>
        <UButton variant="outline" color="neutral" icon="i-lucide-refresh-cw" :loading="overviewLoading || statsLoading" @click="() => fetchAll(`r-${Date.now()}`)">
          {{ t('common.refresh') }}
        </UButton>
        <UButton icon="i-lucide-link" :disabled="!overview?.link" @click="copyLink">
          {{ t('dashboard.copyLink') }}
        </UButton>
      </template>
    </ManagePageHeader>

    <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <PartnerStatCard
        v-for="card in totalCards"
        :key="card.label"
        v-bind="card"
        :loading="overviewLoading"
      />
    </section>

    <section class="mt-6">
      <h2 class="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
        {{ t('dashboard.monthTitle') }}
      </h2>
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <PartnerStatCard
          v-for="card in monthCards"
          :key="card.label"
          v-bind="card"
          :loading="overviewLoading"
        />
      </div>
    </section>

    <section class="mt-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/60 sm:p-5">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            {{ t('dashboard.trendTitle') }}
          </h2>
          <p v-if="rangeTotals" class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {{ t('dashboard.trendTotals', {
              customers: formatNumber(rangeTotals.new_customers),
              orders: formatNumber(rangeTotals.orders),
              amount: formatMoney(rangeTotals.amount),
              rebate: formatMoney(rangeTotals.rebate),
            }) }}
          </p>
        </div>
        <UTabs
          v-model="range"
          :items="rangeItems"
          :content="false"
          color="neutral"
          variant="pill"
          size="xs"
        />
      </div>
      <ClientOnly>
        <PartnerTrendChart :rows="stats?.rows ?? []" :loading="statsLoading" />
        <template #fallback>
          <div class="h-72 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        </template>
      </ClientOnly>
    </section>

    <section class="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/60">
      <div class="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800 sm:px-5">
        <h2 class="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          {{ t('dashboard.recentTitle') }}
        </h2>
        <UButton :to="localePath('/customers')" variant="link" color="neutral" size="sm" trailing-icon="i-lucide-arrow-right">
          {{ t('dashboard.viewAllCustomers') }}
        </UButton>
      </div>
      <div v-if="overview?.recent?.length" class="overflow-x-auto">
        <table class="w-full min-w-[32rem] text-sm">
          <thead class="bg-zinc-50 text-left text-xs text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
            <tr>
              <th class="px-4 py-2.5 font-medium sm:px-5">{{ t('customers.colCustomer') }}</th>
              <th class="px-4 py-2.5 text-right font-medium">{{ t('customers.colAmount') }}</th>
              <th class="px-4 py-2.5 text-right font-medium">{{ t('customers.colRebate') }}</th>
              <th class="px-4 py-2.5 font-medium sm:px-5">{{ t('customers.colBoundAt') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800">
            <tr v-for="(row, i) in overview.recent" :key="i">
              <td class="px-4 py-2.5 sm:px-5">{{ row.nickname }}</td>
              <td class="px-4 py-2.5 text-right tabular-nums">{{ formatMoney(row.amount) }}</td>
              <td class="px-4 py-2.5 text-right tabular-nums text-emerald-600 dark:text-emerald-400">{{ formatMoney(row.rebate) }}</td>
              <td class="whitespace-nowrap px-4 py-2.5 text-zinc-500 sm:px-5">{{ formatUnix(row.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <PartnerEmptyState
        v-else
        icon="i-lucide-users"
        :title="t('dashboard.recentEmpty')"
        :description="t('dashboard.recentEmptyDesc')"
      >
        <UButton :to="localePath('/materials')" variant="soft" size="sm" icon="i-lucide-megaphone">
          {{ t('nav.materials') }}
        </UButton>
      </PartnerEmptyState>
    </section>
  </div>
</template>
