<script setup lang="ts">
/**
 * 口令红包：运营创建并归属到我的口令及其效果（只读）。
 */
import partnerApi, { type PartnerBonusCode, parsePaged } from '~/api/partner'
import { CONSOLE_DEFAULT_PAGE_SIZE } from '~/utils/consoleSelectItems'
import {
  bonusCodeStateColor,
  bonusCodeStateKey,
  copyText,
  formatMoney,
  formatNumber,
  formatRate,
  formatUnixDate,
} from '~/utils/partnerDisplay'

const { t } = useI18n()
const { notify } = useNotifyToast()
const { loading, listReady, beginListLoad, markListReady } = useListReadyState()

useHead({ title: () => t('bonusCode.pageTitle') })

const page = ref(1)
const pageSize = ref(CONSOLE_DEFAULT_PAGE_SIZE)
const total = ref(0)
const rows = ref<PartnerBonusCode[]>([])

let seq = 0
const fetchList = useClientListFetch(async () => {
  const mySeq = ++seq
  beginListLoad()
  try {
    const raw = await partnerApi.bonusCodes({ page: page.value, page_size: pageSize.value })
    if (mySeq !== seq)
      return
    const paged = parsePaged<PartnerBonusCode>(raw)
    if (!paged) {
      notify(raw?.message ?? t('bonusCode.loadFail'), 'error')
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

/** 权益摘要：一个码可同时带红包积分 / 首充加赠 / 会员天数 */
function benefits(code: PartnerBonusCode): string[] {
  const out: string[] = []
  if (code.bonus_points > 0)
    out.push(t('bonusCode.benefitPoints', { n: formatNumber(code.bonus_points), days: code.bonus_valid_days }))
  if (code.first_recharge_rate > 0)
    out.push(t('bonusCode.benefitFirstRecharge', { rate: formatRate(code.first_recharge_rate), cap: code.first_recharge_cap_points > 0 ? formatNumber(code.first_recharge_cap_points) : '∞' }))
  if (code.member_days > 0)
    out.push(t('bonusCode.benefitMemberDays', { n: code.member_days }))
  return out
}

function periodText(code: PartnerBonusCode) {
  const start = code.starts_at ? formatUnixDate(code.starts_at) : ''
  const end = code.expires_at ? formatUnixDate(code.expires_at) : t('bonusCode.noExpiry')
  return start ? `${start} ~ ${end}` : end
}

async function copyCode(code: string) {
  if (await copyText(code))
    notify(t('bonusCode.copied'))
  else
    notify(t('common.copyFail'), 'error')
}
</script>

<template>
  <div class="console-container">
    <ManagePageHeader page-title-key="bonusCode.title" page-description-key="bonusCode.description">
      <template #actions>
        <UButton variant="outline" color="neutral" icon="i-lucide-refresh-cw" :loading="loading" @click="() => fetchList(`r-${Date.now()}`)">
          {{ t('common.refresh') }}
        </UButton>
      </template>
    </ManagePageHeader>

    <div class="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/60">
      <div v-if="loading && !listReady" class="flex items-center justify-center py-16 text-zinc-400">
        <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin" aria-hidden="true" />
      </div>
      <template v-else-if="rows.length">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[56rem] text-sm">
            <thead class="bg-zinc-50 text-left text-xs text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th class="px-4 py-2.5 font-medium sm:px-5">{{ t('bonusCode.colCode') }}</th>
                <th class="px-4 py-2.5 font-medium">{{ t('bonusCode.colBenefits') }}</th>
                <th class="px-4 py-2.5 font-medium">{{ t('bonusCode.colPeriod') }}</th>
                <th class="px-4 py-2.5 text-right font-medium">{{ t('bonusCode.colClaimed') }}</th>
                <th class="px-4 py-2.5 text-right font-medium">{{ t('bonusCode.colRegistered') }}</th>
                <th class="px-4 py-2.5 text-right font-medium">{{ t('bonusCode.colPaid') }}</th>
                <th class="px-4 py-2.5 font-medium sm:px-5">{{ t('common.status') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800">
              <tr v-for="row in rows" :key="row.id">
                <td class="px-4 py-2.5 sm:px-5">
                  <button type="button" class="inline-flex items-center gap-1.5 font-mono font-medium text-zinc-900 hover:text-blue-600 dark:text-zinc-100 dark:hover:text-blue-300" :title="t('bonusCode.copy')" @click="copyCode(row.code)">
                    {{ row.code }}
                    <UIcon name="i-lucide-copy" class="size-3.5 text-zinc-400" aria-hidden="true" />
                  </button>
                  <div v-if="row.remark" class="mt-0.5 max-w-[12rem] truncate text-xs text-zinc-400" :title="row.remark">{{ row.remark }}</div>
                </td>
                <td class="px-4 py-2.5">
                  <ul class="space-y-0.5 text-xs text-zinc-600 dark:text-zinc-300">
                    <li v-for="(b, i) in benefits(row)" :key="i">{{ b }}</li>
                    <li v-if="!benefits(row).length" class="text-zinc-400">—</li>
                  </ul>
                </td>
                <td class="px-4 py-2.5 text-xs text-zinc-500">{{ periodText(row) }}</td>
                <td class="px-4 py-2.5 text-right tabular-nums">
                  {{ formatNumber(row.claimed_count) }}<span v-if="row.max_claims > 0" class="text-zinc-400"> / {{ formatNumber(row.max_claims) }}</span>
                </td>
                <td class="px-4 py-2.5 text-right tabular-nums">{{ formatNumber(row.stats?.registered) }}</td>
                <td class="px-4 py-2.5 text-right tabular-nums">
                  {{ formatNumber(row.stats?.paid) }}
                  <div class="text-xs text-zinc-400">{{ formatMoney(row.stats?.amount) }}</div>
                </td>
                <td class="px-4 py-2.5 sm:px-5">
                  <UBadge :color="bonusCodeStateColor(bonusCodeStateKey(row))" variant="subtle" size="sm">{{ t(`bonusCode.state.${bonusCodeStateKey(row)}`) }}</UBadge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <ConsoleTablePagination v-model:page="page" v-model:page-size="pageSize" :total="total" :disabled="loading" />
      </template>
      <PartnerEmptyState v-else icon="i-lucide-ticket" :title="t('bonusCode.empty')" :description="t('bonusCode.emptyDesc')" />
    </div>
  </div>
</template>
