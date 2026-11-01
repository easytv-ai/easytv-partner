<script setup lang="ts">
/**
 * 申请提现：金额 ≤ 可提余额，收款账户按创作台同一 JSON 结构 { name, account, bank_name? }。
 */
import partnerApi, { type WithdrawWay } from '~/api/partner'
import { formatMoney } from '~/utils/partnerDisplay'

const props = defineProps<{
  withdrawable: number
}>()

const emit = defineEmits<{
  submitted: []
}>()

const open = defineModel<boolean>('open', { required: true })

const { t } = useI18n()
const { notify } = useNotifyToast()

const submitting = ref(false)
const form = reactive({
  amount: '',
  way: 'alipay' as WithdrawWay,
  name: '',
  account: '',
  bankName: '',
})
const errors = reactive({ amount: '', name: '', account: '', bankName: '' })

const wayItems = computed(() => [
  { label: t('billing.wayAlipay'), value: 'alipay' },
  { label: t('billing.wayWechat'), value: 'wechat' },
  { label: t('billing.wayBank'), value: 'bank' },
])

const amountNumber = computed(() => {
  const n = Number(String(form.amount).trim())
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0
})

watch(open, (v) => {
  if (v) {
    Object.assign(form, { amount: '', way: 'alipay', name: '', account: '', bankName: '' })
    Object.assign(errors, { amount: '', name: '', account: '', bankName: '' })
  }
})

function fillMax() {
  form.amount = String(Math.floor(props.withdrawable * 100) / 100)
}

function validate() {
  Object.assign(errors, { amount: '', name: '', account: '', bankName: '' })
  if (!(amountNumber.value > 0))
    errors.amount = t('billing.amountInvalid')
  else if (amountNumber.value > props.withdrawable + 1e-9)
    errors.amount = t('billing.amountExceeds', { max: formatMoney(props.withdrawable) })
  if (!form.name.trim())
    errors.name = t('billing.nameRequired')
  if (!form.account.trim())
    errors.account = t('billing.accountRequired')
  if (form.way === 'bank' && !form.bankName.trim())
    errors.bankName = t('billing.bankRequired')
  return !errors.amount && !errors.name && !errors.account && !errors.bankName
}

async function onSubmit() {
  if (submitting.value || !validate())
    return
  submitting.value = true
  try {
    const accountInfo: Record<string, string> = { name: form.name.trim(), account: form.account.trim() }
    if (form.way === 'bank')
      accountInfo.bank_name = form.bankName.trim()
    const res = await partnerApi.applyWithdraw({
      amount: amountNumber.value,
      way: form.way,
      account_info: JSON.stringify(accountInfo),
    })
    if (!res?.success) {
      notify(res?.message ?? t('billing.withdrawFail'), 'error')
      return
    }
    notify(t('billing.withdrawSubmitted'))
    open.value = false
    emit('submitted')
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <UModal v-model:open="open" :title="t('billing.withdrawTitle')" :description="t('billing.withdrawDesc', { max: formatMoney(withdrawable) })">
    <template #body>
      <form id="partner-withdraw-form" class="space-y-4" @submit.prevent="onSubmit">
        <UFormField :label="t('billing.amount')" required :error="errors.amount || undefined">
          <div class="flex gap-2">
            <UInput
              v-model="form.amount"
              type="number"
              inputmode="decimal"
              min="0"
              step="0.01"
              placeholder="0.00"
              class="min-w-0 flex-1"
            >
              <template #leading>
                <span class="text-sm text-zinc-500">¥</span>
              </template>
            </UInput>
            <UButton type="button" variant="outline" color="neutral" class="shrink-0" @click="fillMax">
              {{ t('billing.withdrawAll') }}
            </UButton>
          </div>
        </UFormField>
        <UFormField :label="t('billing.way')" required>
          <URadioGroup v-model="form.way" :items="wayItems" value-key="value" orientation="horizontal" />
        </UFormField>
        <UFormField v-if="form.way === 'bank'" :label="t('billing.bankName')" required :error="errors.bankName || undefined">
          <UInput v-model="form.bankName" :placeholder="t('billing.bankNamePh')" class="w-full" />
        </UFormField>
        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField :label="t('billing.payeeName')" required :error="errors.name || undefined">
            <UInput v-model="form.name" :placeholder="t('billing.payeeNamePh')" class="w-full" />
          </UFormField>
          <UFormField :label="t('billing.payeeAccount')" required :error="errors.account || undefined">
            <UInput v-model="form.account" :placeholder="t(`billing.accountPh.${form.way}`)" class="w-full" />
          </UFormField>
        </div>
        <p class="text-xs text-zinc-500 dark:text-zinc-400">
          {{ t('billing.withdrawHint') }}
        </p>
      </form>
    </template>
    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton type="button" variant="ghost" color="neutral" :disabled="submitting" @click="open = false">
          {{ t('common.cancel') }}
        </UButton>
        <UButton type="submit" form="partner-withdraw-form" :loading="submitting" :disabled="submitting">
          {{ t('billing.submitWithdraw') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
