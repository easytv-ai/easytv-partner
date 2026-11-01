<script setup lang="ts">
/**
 * 推广物料：专属链接 + 二维码、专属码、可直接复制的推广文案、返佣规则。
 */
import QRCode from 'qrcode'
import { copyText, formatRate } from '~/utils/partnerDisplay'

const { t } = useI18n()
const { notify } = useNotifyToast()
const config = useRuntimeConfig()
const { overview, partner } = usePartnerSelf()
const { isDark } = useTheme()

useHead({ title: () => t('materials.pageTitle') })

const studioUrl = computed(() => String(config.public.studioUrl || '').replace(/\/$/, ''))
const link = computed(() => {
  if (overview.value?.link)
    return overview.value.link
  const code = partner.value?.code
  return code ? `${studioUrl.value}/partner/${code}` : ''
})
const code = computed(() => partner.value?.code ?? '')
const rate = computed(() => formatRate(overview.value?.rebate_rate ?? 0))
const months = computed(() => overview.value?.rebate_months ?? 0)

const qrDataUrl = ref('')
watch([link, isDark], async ([url, dark]) => {
  if (!url) {
    qrDataUrl.value = ''
    return
  }
  try {
    qrDataUrl.value = await QRCode.toDataURL(url, {
      margin: 1,
      width: 320,
      color: dark ? { dark: '#f4f4f5', light: '#18181b' } : { dark: '#18181b', light: '#ffffff' },
    })
  }
  catch {
    qrDataUrl.value = ''
  }
}, { immediate: true })

function downloadQr() {
  if (!qrDataUrl.value)
    return
  const a = document.createElement('a')
  a.href = qrDataUrl.value
  a.download = `easytv-partner-${code.value || 'qr'}.png`
  a.click()
}

async function copy(text: string, doneKey: string) {
  if (await copyText(text))
    notify(t(doneKey))
  else
    notify(t('common.copyFail'), 'error')
}

const templates = computed(() => {
  const vars = { link: link.value, code: code.value, name: partner.value?.name ?? '' }
  return [
    { title: t('materials.tplShortTitle'), body: t('materials.tplShort', vars) },
    { title: t('materials.tplLongTitle'), body: t('materials.tplLong', vars) },
    { title: t('materials.tplGroupTitle'), body: t('materials.tplGroup', vars) },
  ]
})

const rules = computed(() => [
  t('materials.rule1'),
  t('materials.rule2', { rate: rate.value }),
  t('materials.rule3', { months: months.value }),
  t('materials.rule4'),
])
</script>

<template>
  <div class="console-container">
    <ManagePageHeader page-title-key="materials.title" page-description-key="materials.description" />

    <div class="grid gap-4 lg:grid-cols-5">
      <section class="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60 lg:col-span-3">
        <h2 class="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          {{ t('materials.linkTitle') }}
        </h2>
        <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {{ t('materials.linkDesc') }}
        </p>
        <div class="mt-4 flex flex-col gap-2 sm:flex-row">
          <UInput :model-value="link" readonly class="min-w-0 flex-1" />
          <div class="flex gap-2">
            <UButton icon="i-lucide-copy" :disabled="!link" @click="copy(link, 'materials.linkCopied')">
              {{ t('common.copy') }}
            </UButton>
            <UButton :to="link || undefined" target="_blank" rel="noopener" variant="outline" color="neutral" icon="i-lucide-external-link" :disabled="!link">
              {{ t('materials.open') }}
            </UButton>
          </div>
        </div>

        <div class="mt-6 grid gap-3 sm:grid-cols-2">
          <div class="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <p class="text-xs text-zinc-500 dark:text-zinc-400">
              {{ t('partner.code') }}
            </p>
            <div class="mt-1 flex items-center justify-between gap-2">
              <span class="font-mono text-2xl font-semibold tracking-widest text-zinc-900 dark:text-white">{{ code || '—' }}</span>
              <UButton variant="ghost" color="neutral" size="sm" icon="i-lucide-copy" :disabled="!code" @click="copy(code, 'materials.codeCopied')">
                {{ t('common.copy') }}
              </UButton>
            </div>
            <p class="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              {{ t('materials.codeHint') }}
            </p>
          </div>
          <div class="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <p class="text-xs text-zinc-500 dark:text-zinc-400">
              {{ t('materials.rebateTitle') }}
            </p>
            <p class="mt-1 text-2xl font-semibold text-zinc-900 dark:text-white">
              {{ rate }}
            </p>
            <p class="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              {{ t('materials.rebateHint', { months }) }}
            </p>
          </div>
        </div>
      </section>

      <section class="flex flex-col items-center rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60 lg:col-span-2">
        <h2 class="self-start text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          {{ t('materials.qrTitle') }}
        </h2>
        <div class="mt-4 flex h-48 w-48 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <img v-if="qrDataUrl" :src="qrDataUrl" alt="" class="h-full w-full object-contain">
          <UIcon v-else name="i-lucide-qr-code" class="size-10 text-zinc-300" aria-hidden="true" />
        </div>
        <UButton class="mt-4" variant="outline" color="neutral" icon="i-lucide-download" :disabled="!qrDataUrl" @click="downloadQr">
          {{ t('materials.downloadQr') }}
        </UButton>
      </section>
    </div>

    <section class="mt-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60">
      <h2 class="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
        {{ t('materials.tplTitle') }}
      </h2>
      <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        {{ t('materials.tplDesc') }}
      </p>
      <div class="mt-4 grid gap-3 md:grid-cols-3">
        <div v-for="tpl in templates" :key="tpl.title" class="flex flex-col rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <p class="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {{ tpl.title }}
          </p>
          <p class="mt-2 flex-1 whitespace-pre-line text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">
            {{ tpl.body }}
          </p>
          <UButton class="mt-3 self-start" variant="soft" size="sm" icon="i-lucide-copy" :disabled="!link" @click="copy(tpl.body, 'materials.tplCopied')">
            {{ t('common.copy') }}
          </UButton>
        </div>
      </div>
    </section>

    <section class="mt-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60">
      <h2 class="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
        {{ t('materials.rulesTitle') }}
      </h2>
      <ol class="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-zinc-600 dark:text-zinc-300">
        <li v-for="(r, i) in rules" :key="i">{{ r }}</li>
      </ol>
    </section>
  </div>
</template>
