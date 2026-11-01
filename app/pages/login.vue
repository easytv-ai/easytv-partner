<script setup lang="ts">
/**
 * 登录：手机验证码（默认，与创作台一致）或账号密码。登录后由控制台布局按伙伴状态分流。
 */
import userAuth from '~/api/user-auth'
import { PASSWORD_MAX } from '~/utils/password'

definePageMeta({
  layout: 'simple',
  middleware: 'guest',
})

const route = useRoute()
const localePath = useLocalePath()
const { t } = useI18n()
const { notify, toast } = useNotifyToast()
const { tryLogin, trySmsLogin } = useAuth()
const { reset: resetPartner } = usePartnerSelf()

useHead({ title: () => t('auth.pageTitle') })

type Mode = 'sms' | 'password'
const mode = ref<Mode>('sms')
const modeItems = computed(() => [
  { label: t('auth.modeSms'), value: 'sms' },
  { label: t('auth.modePassword'), value: 'password' },
])

const loading = ref(false)
const sendingCode = ref(false)
const countdown = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

const smsForm = reactive({ mobile: '', code: '' })
const pwdForm = reactive({ username: '', password: '' })
const errors = reactive({ mobile: '', code: '', username: '', password: '' })

const isMobile = (v: string) => /^1\d{10}$/.test(v.trim())

onMounted(() => {
  if (route.query.reason === 'session_expired')
    notify(t('auth.sessionExpired'), 'error')
})

onBeforeUnmount(() => {
  if (timer)
    clearInterval(timer)
})

function startCountdown(seconds = 60) {
  countdown.value = seconds
  if (timer)
    clearInterval(timer)
  timer = setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0 && timer) {
      clearInterval(timer)
      timer = null
    }
  }, 1000)
}

async function sendCode() {
  errors.mobile = ''
  if (!isMobile(smsForm.mobile)) {
    errors.mobile = t('auth.mobileInvalid')
    return
  }
  sendingCode.value = true
  try {
    const res = await userAuth.sendSmsVerification(smsForm.mobile.trim())
    if (res?.success) {
      notify(t('auth.codeSent'))
      startCountdown()
    }
    else {
      notify(res?.message ?? t('auth.codeSendFail'), 'error')
    }
  }
  catch {
    notify(t('auth.networkError'), 'error')
  }
  finally {
    sendingCode.value = false
  }
}

async function afterLogin() {
  resetPartner()
  toast.add({ title: t('auth.loginSuccess'), color: 'success' })
  await navigateTo(localePath('/'))
}

async function onSmsSubmit() {
  errors.mobile = ''
  errors.code = ''
  if (!isMobile(smsForm.mobile)) {
    errors.mobile = t('auth.mobileInvalid')
    return
  }
  if (!/^\d{4,8}$/.test(smsForm.code.trim())) {
    errors.code = t('auth.codeInvalid')
    return
  }
  loading.value = true
  try {
    const res = await trySmsLogin(smsForm.mobile, smsForm.code)
    if (res.ok)
      await afterLogin()
    else
      notify(res.message ?? t('auth.loginFail'), 'error')
  }
  finally {
    loading.value = false
  }
}

async function onPasswordSubmit() {
  errors.username = ''
  errors.password = ''
  if (!pwdForm.username.trim()) {
    errors.username = t('auth.usernameRequired')
    return
  }
  if (!pwdForm.password) {
    errors.password = t('auth.passwordRequired')
    return
  }
  loading.value = true
  try {
    const res = await tryLogin(pwdForm.username, pwdForm.password)
    if (res.ok)
      await afterLogin()
    else
      notify(res.message ?? t('auth.loginFailPassword'), 'error')
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-md">
    <UCard variant="outline" class="shadow-sm dark:bg-zinc-900/50" :ui="{ body: 'p-6 sm:p-8 space-y-6' }">
      <div>
        <h2 class="text-xl font-semibold text-zinc-900 dark:text-white">
          {{ t('auth.title') }}
        </h2>
        <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {{ t('auth.subtitle') }}
        </p>
      </div>

      <UTabs
        v-model="mode"
        :items="modeItems"
        :content="false"
        color="neutral"
        variant="pill"
        size="sm"
        class="w-full"
      />

      <form v-if="mode === 'sms'" class="space-y-4" @submit.prevent="onSmsSubmit">
        <UFormField :label="t('auth.mobile')" required :error="errors.mobile || undefined">
          <UInput
            v-model="smsForm.mobile"
            type="tel"
            inputmode="numeric"
            autocomplete="tel"
            :maxlength="11"
            :placeholder="t('auth.mobilePh')"
            class="w-full"
          />
        </UFormField>
        <UFormField :label="t('auth.code')" required :error="errors.code || undefined">
          <div class="flex gap-2">
            <UInput
              v-model="smsForm.code"
              inputmode="numeric"
              autocomplete="one-time-code"
              :maxlength="8"
              :placeholder="t('auth.codePh')"
              class="min-w-0 flex-1"
            />
            <UButton
              type="button"
              variant="outline"
              color="neutral"
              class="shrink-0"
              :loading="sendingCode"
              :disabled="sendingCode || countdown > 0"
              @click="sendCode"
            >
              {{ countdown > 0 ? t('auth.resendIn', { s: countdown }) : t('auth.sendCode') }}
            </UButton>
          </div>
        </UFormField>
        <UButton type="submit" block size="lg" class="mt-2 justify-center" :loading="loading" :disabled="loading">
          {{ loading ? t('auth.loggingIn') : t('auth.login') }}
        </UButton>
      </form>

      <form v-else class="space-y-4" @submit.prevent="onPasswordSubmit">
        <UFormField :label="t('auth.username')" required :error="errors.username || undefined">
          <UInput
            v-model="pwdForm.username"
            type="text"
            autocomplete="username"
            :placeholder="t('auth.usernamePh')"
            class="w-full"
          />
        </UFormField>
        <UFormField :label="t('auth.password')" required :error="errors.password || undefined">
          <UInput
            v-model="pwdForm.password"
            type="password"
            autocomplete="current-password"
            :placeholder="t('auth.passwordPh')"
            :maxlength="PASSWORD_MAX"
            class="w-full"
          />
        </UFormField>
        <UButton type="submit" block size="lg" class="mt-2 justify-center" :loading="loading" :disabled="loading">
          {{ loading ? t('auth.loggingIn') : t('auth.login') }}
        </UButton>
      </form>

      <p class="text-center text-xs text-zinc-500 dark:text-zinc-400">
        {{ t('auth.sameAccountHint') }}
      </p>
    </UCard>
  </div>
</template>
