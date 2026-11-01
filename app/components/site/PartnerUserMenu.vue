<script setup lang="ts">
import { partnerStatusColor } from '~/utils/partnerDisplay'

const { t } = useI18n()
const localePath = useLocalePath()
const toast = useToast()
const { user, logout, hydrate, isLoggedIn } = useAuth()
const { partner, status, reset: resetPartner } = usePartnerSelf()

const loggingOut = ref(false)
const menuOpen = ref(false)

onMounted(() => {
  hydrate()
})

const showMenu = computed(() => isLoggedIn.value && !!user.value)

const displayName = computed(() => {
  const partnerName = String(partner.value?.name ?? '').trim()
  if (partnerName)
    return partnerName
  const nickname = String(user.value?.nickname ?? '').trim()
  if (nickname)
    return nickname
  return String(user.value?.username ?? '').trim() || '—'
})

const accountLine = computed(() => {
  const nickname = String(user.value?.nickname ?? '').trim()
  const username = String(user.value?.username ?? '').trim()
  return nickname && nickname !== displayName.value ? nickname : username
})

const userId = computed(() => {
  const id = user.value?.id
  return id == null || id === '' ? '' : String(id)
})

const userInitial = computed(() => {
  const n = displayName.value
  return n !== '—' ? n.slice(0, 1).toUpperCase() : '?'
})

const statusLabel = computed(() => status.value >= 0 ? t(`partner.status${status.value}`) : '')
const isConsoleAccess = computed(() => user.value?.console_access === true)

async function onLogout() {
  menuOpen.value = false
  loggingOut.value = true
  try {
    const res = await logout()
    resetPartner()
    if (res.ok) {
      await navigateTo(localePath('/login'))
      return
    }
    toast.add({ title: res.message ?? t('auth.logoutFail'), color: 'error' })
  }
  finally {
    loggingOut.value = false
  }
}
</script>

<template>
  <ClientOnly>
    <UPopover
      v-if="showMenu"
      v-model:open="menuOpen"
      :content="{ align: 'end', side: 'bottom', sideOffset: 6 }"
    >
      <button
        type="button"
        class="flex max-w-[min(100%,14rem)] items-center gap-2.5 rounded-lg border border-zinc-200 bg-zinc-50/80 py-1.5 pl-1.5 pr-2.5 text-left transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800/60 dark:hover:bg-zinc-800"
        :aria-label="t('nav.userMenu')"
        :disabled="loggingOut"
      >
        <span class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white dark:bg-blue-500">
          {{ userInitial }}
        </span>
        <span class="min-w-0 flex-1 text-left">
          <span class="flex items-center gap-1.5">
            <span class="max-w-[5rem] truncate text-sm font-medium text-zinc-900 sm:max-w-[9rem] dark:text-zinc-50">
              {{ displayName }}
            </span>
            <UBadge
              v-if="statusLabel"
              :color="partnerStatusColor(status)"
              variant="subtle"
              size="xs"
              class="shrink-0"
            >
              {{ statusLabel }}
            </UBadge>
          </span>
          <span
            v-if="accountLine"
            class="hidden max-w-[9rem] truncate text-xs text-zinc-500 sm:block dark:text-zinc-400"
          >
            {{ accountLine }}
          </span>
        </span>
        <UIcon
          name="i-lucide-chevron-down"
          class="size-4 shrink-0 text-zinc-400"
          :class="menuOpen ? 'rotate-180' : ''"
        />
      </button>

      <template #content>
        <div class="w-64 p-3">
          <div class="mb-3 flex items-start gap-3">
            <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white dark:bg-blue-500">
              {{ userInitial }}
            </span>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {{ displayName }}
              </p>
              <p v-if="accountLine" class="truncate text-xs text-zinc-500 dark:text-zinc-400">
                {{ accountLine }}
              </p>
            </div>
          </div>

          <dl class="mb-3 space-y-1.5 rounded-md bg-zinc-50 px-3 py-2 text-xs dark:bg-zinc-800/80">
            <div v-if="userId" class="flex justify-between gap-2">
              <dt class="shrink-0 text-zinc-500 dark:text-zinc-400">{{ t('common.userId') }}</dt>
              <dd class="font-mono font-medium text-zinc-800 dark:text-zinc-200">{{ userId }}</dd>
            </div>
            <div v-if="partner?.code" class="flex justify-between gap-2">
              <dt class="shrink-0 text-zinc-500 dark:text-zinc-400">{{ t('partner.code') }}</dt>
              <dd class="font-mono font-medium text-zinc-800 dark:text-zinc-200">{{ partner.code }}</dd>
            </div>
            <div v-if="statusLabel" class="flex justify-between gap-2">
              <dt class="shrink-0 text-zinc-500 dark:text-zinc-400">{{ t('common.status') }}</dt>
              <dd class="font-medium text-zinc-800 dark:text-zinc-200">{{ statusLabel }}</dd>
            </div>
            <div v-if="isConsoleAccess" class="flex justify-between gap-2">
              <dt class="shrink-0 text-zinc-500 dark:text-zinc-400">{{ t('auth.consoleAccess') }}</dt>
              <dd class="font-medium text-amber-700 dark:text-amber-300">{{ t('auth.consoleAccessOn') }}</dd>
            </div>
          </dl>

          <UButton
            type="button"
            variant="soft"
            color="error"
            block
            icon="i-lucide-log-out"
            :loading="loggingOut"
            :disabled="loggingOut"
            @click="onLogout"
          >
            {{ loggingOut ? t('auth.loggingOut') : t('nav.logout') }}
          </UButton>
        </div>
      </template>
    </UPopover>

    <template #fallback>
      <div class="h-10 w-24 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
    </template>
  </ClientOnly>
</template>
