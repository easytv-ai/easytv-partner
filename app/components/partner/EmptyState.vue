<script setup lang="ts">
defineProps<{
  icon?: string
  title: string
  description?: string
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center px-4 py-14 text-center">
    <span class="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
      <UIcon :name="icon || 'i-lucide-inbox'" class="size-6" aria-hidden="true" />
    </span>
    <p class="text-sm font-medium text-zinc-700 dark:text-zinc-200">
      {{ title }}
    </p>
    <p v-if="description" class="mt-1 max-w-sm text-xs text-zinc-500 dark:text-zinc-400">
      {{ description }}
    </p>
    <div v-if="$slots.default" class="mt-4">
      <slot />
    </div>
  </div>
</template>
