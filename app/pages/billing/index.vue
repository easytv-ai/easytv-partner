<script setup lang="ts">
/**
 * 返佣与提现：余额卡 + 申请提现；两个分页表（返佣流水 / 提现记录）。
 */
import partnerApi, { type PartnerBill, type PartnerWithdraw, parsePaged } from '~/api/partner'
import { CONSOLE_DEFAULT_PAGE_SIZE } from '~/utils/consoleSelectItems'
import {
  accountInfoText,
  billTypeColor,
  billTypeKey,
  formatMoney,
  formatRate,
  formatUnix,
  withdrawStatusColor,
  withdrawStatusKey,
} from '~/utils/partnerDisplay'

const { t } = useI18n()
const { notify } = useNotifyToast()
const { overview, reload: reloadOverview } = usePartnerSelf()

useHead({ title: () => t('billing.pageTitle') })

const withdrawable = computed(() => Number(overview.value?.withdrawable) || 0)

type Tab = 'bills' | 'withdraws'
const tab = ref<Tab>('bills')
const tabItems = computed(() => [
  { label: t('billing.tabBills'), value: 'bills' },
  { label: t('billing.tabWithdraws'), value: 'withdraws' },
])

interface PagedState<T> {
  page: Ref<number>
  pageSize: Ref<number>
  loading: Ref<boolean>
  loaded: Ref<boolean>
  items: Ref<T[]>
  total: Ref<number>
}

function createPaged<T>(): PagedState<T> {
  return {
    page: ref(1),
    pageSize: ref<number>(CONSOLE_DEFAULT_PAGE_SIZE),
    loading: ref(false),
    loaded: ref(false),
    items: ref([]) as Ref<T[]>,
    total: ref(0),
  }
}

async function loadPaged<T>(state: PagedState<T>, fetcher: (q: { page: number, page_size: number }) => Promise<any>, failKey: string) {
  state.loading.value = true
  try {
    const raw = await fetcher({ page: state.page.value, page_size: state.pageSize.value })
    const paged = parsePaged<T>(raw)
    if (!paged) {
      notify(raw?.message ?? t(failKey), 'error')
      return
    }
    state.items.value = paged.items
    state.total.value = paged.total
    state.loaded.value = true
  }
  finally {
    state.loading.value = false
  }
}

const bills = createPaged<PartnerBill>()
const withdraws = createPaged<PartnerWithdraw>()

const loadBills = () => loadPaged(bills, q => partnerApi.bills(q), 'billing.loadFail')
const loadWithdraws = () => loadPaged(withdraws, q => partnerApi.withdraws(q), 'billing.loadFail')

watch([bills.page, bills.pageSize], () => void loadBills())
watch([withdraws.page, withdraws.pageSize], () => void loadWithdraws())
watch(tab, (v) => {
  if (v === 'withdraws' && !withdraws.loaded.value)
    void loadWithdraws()
})

const fetchAll = useClientListFetch(async () => {
  await Promise.all([loadBills(), tab.value === 'withdraws' ? loadWithdraws() : Promise.resolve()])
})
onMounted(() => void fetchAll())

const withdrawOpen = ref(false)

async function onWithdrawSubmitted() {
  tab.value = 'withdraws'
  withdraws.page.value = 1
  await Promise.all([reloadOverview(), loadWithdraws(), loadBills()])
}

function wayLabel(way: string) {
  if (way === 'alipay')
    return t('billing.wayAlipay')
  if (way === 'wechat')
    return t('billing.wayWechat')
  if (way === 'bank')
    return t('billing.wayBank')
  return way || '—'
}

const amountClass = (v: number) => v >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
const signed = (v: number) => `${v > 0 ? '+' : ''}${formatMoney(v)}`
</script>

<template>
  <div class="console-container">
    <ManagePageHeader page-title-key="billing.title" page-description-key="billing.description" />

    <section class="mb-6 flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-sm text-zinc-500 dark:text-zinc-400">
          {{ t('billing.withdrawable') }}
        </p>
        <p class="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-zinc-900 dark:text-white">
          {{ formatMoney(withdrawable) }}
        </p>
        <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {{ t('billing.totalRebate', { total: formatMoney(overview?.rebate_total ?? 0) }) }}
        </p>
      </div>
      <UButton icon="i-lucide-banknote" size="lg" :disabled="withdrawable <= 0" @click="withdrawOpen = true">
        {{ t('billing.applyWithdraw') }}
      </UButton>
    </section>

    <UTabs v-model="tab" :items="tabItems" :content="false" color="neutral" variant="link" class="mb-3" />

    <div v-show="tab === 'bills'" class="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/60">
      <div v-if="bills.loading.value && !bills.loaded.value" class="flex items-center justify-center py-16 text-zinc-400">
        <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin" aria-hidden="true" />
      </div>
      <template v-else-if="bills.items.value.length">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[48rem] text-sm">
            <thead class="bg-zinc-50 text-left text-xs text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th class="px-4 py-2.5 font-medium sm:px-5">{{ t('billing.colTime') }}</th>
                <th class="px-4 py-2.5 font-medium">{{ t('billing.colType') }}</th>
                <th class="px-4 py-2.5 font-medium">{{ t('billing.colCustomer') }}</th>
                <th class="px-4 py-2.5 text-right font-medium">{{ t('billing.colSourceAmount') }}</th>
                <th class="px-4 py-2.5 text-right font-medium">{{ t('billing.colRate') }}</th>
                <th class="px-4 py-2.5 text-right font-medium">{{ t('billing.colAmount') }}</th>
                <th class="px-4 py-2.5 text-right font-medium sm:px-5">{{ t('billing.colBalance') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800">
              <tr v-for="row in bills.items.value" :key="row.id">
                <td class="whitespace-nowrap px-4 py-2.5 text-zinc-500 sm:px-5">{{ formatUnix(row.created_at) }}</td>
                <td class="px-4 py-2.5">
                  <UBadge :color="billTypeColor(row.biz_type)" variant="subtle" size="sm">{{ t(`billing.type.${billTypeKey(row.biz_type)}`) }}</UBadge>
                </td>
                <td class="px-4 py-2.5">
                  <span v-if="row.from_nickname">{{ row.from_nickname }}</span>
                  <span v-else class="text-zinc-400">—</span>
                </td>
                <td class="px-4 py-2.5 text-right tabular-nums">{{ row.source_amount ? formatMoney(row.source_amount) : '—' }}</td>
                <td class="px-4 py-2.5 text-right tabular-nums">{{ row.rate ? formatRate(row.rate) : '—' }}</td>
                <td class="px-4 py-2.5 text-right font-medium tabular-nums" :class="amountClass(row.amount)">{{ signed(row.amount) }}</td>
                <td class="px-4 py-2.5 text-right tabular-nums text-zinc-500 sm:px-5">{{ formatMoney(row.balance) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ConsoleTablePagination v-model:page="bills.page.value" v-model:page-size="bills.pageSize.value" :total="bills.total.value" :disabled="bills.loading.value" />
      </template>
      <PartnerEmptyState v-else icon="i-lucide-receipt" :title="t('billing.billsEmpty')" :description="t('billing.billsEmptyDesc')" />
    </div>

    <div v-show="tab === 'withdraws'" class="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/60">
      <div v-if="withdraws.loading.value && !withdraws.loaded.value" class="flex items-center justify-center py-16 text-zinc-400">
        <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin" aria-hidden="true" />
      </div>
      <template v-else-if="withdraws.items.value.length">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[48rem] text-sm">
            <thead class="bg-zinc-50 text-left text-xs text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th class="px-4 py-2.5 font-medium sm:px-5">{{ t('billing.colTime') }}</th>
                <th class="px-4 py-2.5 font-medium">{{ t('billing.colWithdrawNo') }}</th>
                <th class="px-4 py-2.5 text-right font-medium">{{ t('billing.colAmount') }}</th>
                <th class="whitespace-nowrap px-4 py-2.5 font-medium">{{ t('billing.way') }}</th>
                <th class="px-4 py-2.5 font-medium">{{ t('billing.colAccount') }}</th>
                <th class="px-4 py-2.5 font-medium">{{ t('common.status') }}</th>
                <th class="px-4 py-2.5 font-medium sm:px-5">{{ t('billing.colRemark') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800">
              <tr v-for="row in withdraws.items.value" :key="row.id">
                <td class="whitespace-nowrap px-4 py-2.5 text-zinc-500 sm:px-5">{{ formatUnix(row.created_at) }}</td>
                <td class="whitespace-nowrap px-4 py-2.5 font-mono text-xs">{{ row.withdraw_no }}</td>
                <td class="px-4 py-2.5 text-right font-medium tabular-nums">{{ formatMoney(row.amount) }}</td>
                <td class="whitespace-nowrap px-4 py-2.5">{{ wayLabel(row.way) }}</td>
                <td class="px-4 py-2.5 max-w-[14rem] truncate text-zinc-500" :title="accountInfoText(row.account_info)">{{ accountInfoText(row.account_info) }}</td>
                <td class="px-4 py-2.5">
                  <UBadge :color="withdrawStatusColor(row.status)" variant="subtle" size="sm">{{ t(`billing.withdrawStatus.${withdrawStatusKey(row.status)}`) }}</UBadge>
                </td>
                <td class="px-4 py-2.5 max-w-[14rem] truncate text-zinc-500 sm:px-5" :title="row.failure_msg || row.audit_remark">{{ row.failure_msg || row.audit_remark || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ConsoleTablePagination v-model:page="withdraws.page.value" v-model:page-size="withdraws.pageSize.value" :total="withdraws.total.value" :disabled="withdraws.loading.value" />
      </template>
      <PartnerEmptyState v-else icon="i-lucide-banknote" :title="t('billing.withdrawsEmpty')" :description="t('billing.withdrawsEmptyDesc')" />
    </div>

    <PartnerWithdrawModal v-model:open="withdrawOpen" :withdrawable="withdrawable" @submitted="onWithdrawSubmitted" />
  </div>
</template>
