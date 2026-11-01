<script setup lang="ts">
import type { ConsoleNavGroup } from '~/utils/partnerNav'

defineProps<{
  groups: ConsoleNavGroup[]
}>()

const emit = defineEmits<{
  navigate: []
}>()

const route = useRoute()
const localePath = useLocalePath()
const { t } = useI18n()

function isActive(path: string) {
  const resolved = localePath(path)
  if (route.path === resolved || route.path === `${resolved}/`)
    return true
  if (path === '/')
    return false
  return route.path.startsWith(`${resolved}/`)
}

function groupHasActiveLink(group: ConsoleNavGroup) {
  return group.links.some(link => isActive(link.to))
}

function childLinkClass(active: boolean) {
  const base = 'flex items-center gap-2 rounded-md py-2 pr-2 pl-3 text-sm transition-colors'
  if (active)
    return `${base} bg-blue-50 font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300`
  return `${base} text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100`
}

function groupTitleClass(active: boolean) {
  const base = 'flex items-center gap-2 px-2 py-2 text-xs font-semibold uppercase tracking-wide'
  if (active)
    return `${base} text-blue-700 dark:text-blue-300`
  return `${base} text-zinc-500 dark:text-zinc-400`
}
</script>

<template>
  <nav class="flex flex-1 flex-col overflow-y-auto px-2 py-3">
    <section
      v-for="(group, gi) in groups"
      :key="group.titleKey"
      class="pb-3"
      :class="gi > 0 ? 'mt-1 border-t border-zinc-200 pt-3 dark:border-zinc-800' : ''"
    >
      <div :class="groupTitleClass(groupHasActiveLink(group))">
        <span class="min-w-0 truncate">{{ t(group.titleKey) }}</span>
      </div>
      <div class="mt-0.5 flex flex-col gap-0.5">
        <NuxtLink
          v-for="item in group.links"
          :key="item.to"
          :to="localePath(item.to)"
          :prefetch="false"
          :class="childLinkClass(isActive(item.to))"
          @click="emit('navigate')"
        >
          <UIcon
            :name="item.icon"
            class="h-4 w-4 shrink-0"
            :class="isActive(item.to)
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-zinc-400 dark:text-zinc-500'"
          />
          <span class="min-w-0 truncate">{{ t(item.labelKey) }}</span>
        </NuxtLink>
      </div>
    </section>
  </nav>
</template>
