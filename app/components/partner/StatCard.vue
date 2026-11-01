<script setup lang="ts">
defineProps<{
  icon: string
  label: string
  value: string
  sub?: string
  loading?: boolean
}>()
</script>

<template>
  <div class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/60 sm:p-5">
    <div class="flex items-center justify-between gap-2">
      <p class="truncate text-sm text-zinc-500 dark:text-zinc-400">
        {{ label }}
      </p>
      <span class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
        <UIcon :name="icon" class="size-4" aria-hidden="true" />
      </span>
    </div>
    <div v-if="loading" class="mt-3 h-8 w-28 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
    <p v-else class="mt-3 text-2xl font-semibold tabular-nums tracking-tight text-zinc-900 dark:text-white">
      {{ value }}
    </p>
    <p v-if="sub" class="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400">
      {{ sub }}
    </p>
  </div>
</template>
