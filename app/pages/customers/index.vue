<script setup lang="ts">
/**
 * 归属客户：付费筛选 / 排序 / 分页，昵称已由后端脱敏。
 */
import partnerApi, { type PartnerCustomer, parsePaged } from '~/api/partner'
import { CONSOLE_DEFAULT_PAGE_SIZE, SELECT_ITEM_ALL } from '~/utils/consoleSelectItems'
import { formatMoney, formatUnix } from '~/utils/partnerDisplay'

const { t } = useI18n()
const { notify } = useNotifyToast()
const { loading, listReady, beginListLoad, markListReady } = useListReadyState()

useHead({ title: () => t('customers.pageTitle') })

const page = ref(1)
const pageSize = ref(CONSOLE_DEFAULT_PAGE_SIZE)
const total = ref(0)
const rows = ref<PartnerCustomer[]>([])
const paid = ref<string>(SELECT_ITEM_ALL)
const sort = ref<'recent' | 'amount'>('recent')

const paidItems = computed(() => [
  { label: t('customers.filterAll'), value: SELECT_ITEM_ALL },
  { label: t('customers.filterPaid'), value: '1' },
  { label: t('customers.filterUnpaid'), value: '0' },
])
const sortItems = computed(() => [
  { label: t('customers.sortRecent'), value: 'recent' },
  { label: t('customers.sortAmount'), value: 'amount' },
])

const SOURCES = ['code', 'link', 'manual'] as const
const sourceLabel = (s: string) => (SOURCES as readonly string[]).includes(s) ? t(`customers.source.${s}`) : (s || '—')
const sourceColor = (s: string) => s === 'code' ? 'primary' : s === 'link' ? 'info' : 'neutral'

let seq = 0
const fetchList = useClientListFetch(async () => {
  const mySeq = ++seq
  beginListLoad()
  try {
    const raw = await partnerApi.customers({
      page: page.value,
      page_size: pageSize.value,
      sort: sort.value,
      ...(paid.value === SELECT_ITEM_ALL ? {} : { paid: paid.value as '1' | '0' }),
    })
    if (mySeq !== seq)
      return
    const paged = parsePaged<PartnerCustomer>(raw)
    if (!paged) {
      notify(raw?.message ?? t('customers.loadFail'), 'error')
      return
    }
    rows.value = paged.items
    total.value = paged.total
  }
  finally {
    if (mySeq === seq)
      markListReady()
    else
      loading.value = false
  }
})

onMounted(() => void fetchList())
watch([page, pageSize], () => void fetchList(`p-${Date.now()}`))
watch([paid, sort], () => {
  page.value = 1
  void fetchList(`f-${Date.now()}`)
})
</script>

<template>
  <div class="console-container">
    <ManagePageHeader page-title-key="customers.title" page-description-key="customers.description" />

    <div class="mb-4 flex flex-wrap items-center gap-2">
      <USelect v-model="paid" :items="paidItems" value-key="value" class="w-36" />
      <USelect v-model="sort" :items="sortItems" value-key="value" class="w-40" />
      <UButton variant="outline" color="neutral" icon="i-lucide-refresh-cw" :loading="loading" @click="() => fetchList(`r-${Date.now()}`)">
        {{ t('common.refresh') }}
      </UButton>
    </div>

    <div class="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/60">
      <div v-if="loading && !listReady" class="flex items-center justify-center py-16 text-zinc-400">
        <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin" aria-hidden="true" />
      </div>
      <template v-else-if="rows.length">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[44rem] text-sm">
            <thead class="bg-zinc-50 text-left text-xs text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th class="px-4 py-2.5 font-medium sm:px-5">{{ t('customers.colCustomer') }}</th>
                <th class="px-4 py-2.5 font-medium">{{ t('customers.colSource') }}</th>
                <th class="px-4 py-2.5 font-medium">{{ t('customers.colBoundAt') }}</th>
                <th class="px-4 py-2.5 font-medium">{{ t('customers.colFirstPaidAt') }}</th>
                <th class="px-4 py-2.5 text-right font-medium">{{ t('customers.colAmount') }}</th>
                <th class="px-4 py-2.5 text-right font-medium sm:px-5">{{ t('customers.colRebate') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800">
              <tr v-for="row in rows" :key="row.id" class="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40">
                <td class="px-4 py-2.5 sm:px-5">
                  <div class="font-medium text-zinc-900 dark:text-zinc-100">{{ row.nickname }}</div>
                  <div class="text-xs text-zinc-400">ID {{ row.user_id }}</div>
                </td>
                <td class="px-4 py-2.5">
                  <UBadge :color="sourceColor(row.source)" variant="subtle" size="sm">{{ sourceLabel(row.source) }}</UBadge>
                </td>
                <td class="whitespace-nowrap px-4 py-2.5 text-zinc-500">{{ formatUnix(row.created_at) }}</td>
                <td class="px-4 py-2.5 text-zinc-500">
                  <span v-if="row.first_paid_at">{{ formatUnix(row.first_paid_at) }}</span>
                  <UBadge v-else color="neutral" variant="subtle" size="sm">{{ t('customers.unpaid') }}</UBadge>
                </td>
                <td class="px-4 py-2.5 text-right tabular-nums">{{ formatMoney(row.amount) }}</td>
                <td class="px-4 py-2.5 text-right tabular-nums text-emerald-600 dark:text-emerald-400 sm:px-5">{{ formatMoney(row.rebate) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ConsoleTablePagination v-model:page="page" v-model:page-size="pageSize" :total="total" :disabled="loading" />
      </template>
      <PartnerEmptyState
        v-else
        icon="i-lucide-users"
        :title="t('customers.empty')"
        :description="t('customers.emptyDesc')"
      />
    </div>
  </div>
</template>
