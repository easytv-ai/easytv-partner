<script setup lang="ts">
/** 全站只有控制台一种壳层，未指定 layout 的页面也走它。 */
</script>

<template>
  <NuxtLayout name="console">
    <slot />
  </NuxtLayout>
</template>
