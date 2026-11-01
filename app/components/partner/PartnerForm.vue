<script setup lang="ts">
/**
 * 申请 / 资料表单：name + kind 在已通过审核后锁定，contact / intro 始终可改。
 */
import { PARTNER_KINDS, type PartnerKind } from '~/api/partner'

const props = defineProps<{
  initial?: { name?: string, kind?: string, contact?: string, intro?: string } | null
  lockIdentity?: boolean
  submitting?: boolean
  submitLabel: string
}>()

const emit = defineEmits<{
  submit: [payload: { name: string, kind: PartnerKind, contact: string, intro: string }]
}>()

const { t } = useI18n()

const form = reactive({
  name: '',
  kind: 'other' as PartnerKind,
  contact: '',
  intro: '',
})
const errors = reactive({ name: '', contact: '' })

watch(() => props.initial, (v) => {
  form.name = String(v?.name ?? '')
  form.kind = (PARTNER_KINDS as string[]).includes(String(v?.kind)) ? (v!.kind as PartnerKind) : 'other'
  form.contact = String(v?.contact ?? '')
  form.intro = String(v?.intro ?? '')
}, { immediate: true })

const kindItems = computed(() => PARTNER_KINDS.map(k => ({ label: t(`partner.kind.${k}`), value: k })))

function validate() {
  errors.name = ''
  errors.contact = ''
  const nameLen = [...form.name.trim()].length
  if (nameLen < 2 || nameLen > 32)
    errors.name = t('apply.nameInvalid')
  if (!form.contact.trim())
    errors.contact = t('apply.contactRequired')
  return !errors.name && !errors.contact
}

function onSubmit() {
  if (!validate())
    return
  emit('submit', {
    name: form.name.trim(),
    kind: form.kind,
    contact: form.contact.trim(),
    intro: form.intro.trim(),
  })
}
</script>

<template>
  <form class="space-y-5" @submit.prevent="onSubmit">
    <div class="grid gap-5 sm:grid-cols-2">
      <UFormField :label="t('apply.name')" required :error="errors.name || undefined" :help="lockIdentity ? t('apply.lockedHint') : t('apply.nameHelp')">
        <UInput
          v-model="form.name"
          :disabled="lockIdentity"
          :maxlength="32"
          :placeholder="t('apply.namePh')"
          class="w-full"
        />
      </UFormField>
      <UFormField :label="t('apply.kind')" required>
        <USelect
          v-model="form.kind"
          :items="kindItems"
          value-key="value"
          :disabled="lockIdentity"
          class="w-full"
        />
      </UFormField>
    </div>
    <UFormField :label="t('apply.contact')" required :error="errors.contact || undefined" :help="t('apply.contactHelp')">
      <UInput
        v-model="form.contact"
        :maxlength="120"
        :placeholder="t('apply.contactPh')"
        class="w-full"
      />
    </UFormField>
    <UFormField :label="t('apply.intro')" :help="t('apply.introHelp')">
      <UTextarea
        v-model="form.intro"
        :rows="4"
        :maxlength="500"
        :placeholder="t('apply.introPh')"
        class="w-full"
      />
    </UFormField>
    <div class="flex justify-end">
      <UButton type="submit" :loading="submitting" :disabled="submitting">
        {{ submitLabel }}
      </UButton>
    </div>
  </form>
</template>
