<script setup lang="ts">
/**
 * 看板趋势图：按日的客户实付 / 返佣（柱）与新增客户（线）。
 * 只注册用到的 echarts 模块，按主题切换配色。
 */
import { BarChart, LineChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import type { PartnerStatRow } from '~/api/partner'

use([CanvasRenderer, BarChart, LineChart, GridComponent, TooltipComponent, LegendComponent])

const props = defineProps<{
  rows: PartnerStatRow[]
  loading?: boolean
}>()

const { t } = useI18n()
const { isDark } = useTheme()

const textColor = computed(() => (isDark.value ? '#a8aab2' : '#5f5f5f'))
const splitColor = computed(() => (isDark.value ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'))

const option = computed(() => {
  const dates = props.rows.map(r => r.date.slice(5))
  return {
    backgroundColor: 'transparent',
    textStyle: { fontFamily: 'inherit' },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: isDark.value ? '#18181b' : '#ffffff',
      borderColor: isDark.value ? '#27272a' : '#e5e7eb',
      textStyle: { color: isDark.value ? '#f4f4f5' : '#18181b', fontSize: 12 },
      valueFormatter: (v: unknown) => String(v),
    },
    legend: {
      top: 0,
      textStyle: { color: textColor.value, fontSize: 12 },
      itemWidth: 12,
      itemHeight: 8,
    },
    grid: { left: 8, right: 8, top: 36, bottom: 4, containLabel: true },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: splitColor.value } },
      axisTick: { show: false },
      axisLabel: { color: textColor.value, fontSize: 11, hideOverlap: true },
    },
    yAxis: [
      {
        type: 'value',
        name: t('dashboard.axisMoney'),
        nameTextStyle: { color: textColor.value, fontSize: 11 },
        axisLabel: { color: textColor.value, fontSize: 11 },
        splitLine: { lineStyle: { color: splitColor.value } },
      },
      {
        type: 'value',
        name: t('dashboard.axisCustomers'),
        nameTextStyle: { color: textColor.value, fontSize: 11 },
        minInterval: 1,
        axisLabel: { color: textColor.value, fontSize: 11 },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: t('dashboard.seriesAmount'),
        type: 'bar',
        barMaxWidth: 22,
        itemStyle: { color: '#2563eb', borderRadius: [3, 3, 0, 0] },
        data: props.rows.map(r => r.amount),
      },
      {
        name: t('dashboard.seriesRebate'),
        type: 'bar',
        barMaxWidth: 22,
        itemStyle: { color: '#f59e0b', borderRadius: [3, 3, 0, 0] },
        data: props.rows.map(r => r.rebate),
      },
      {
        name: t('dashboard.seriesNewCustomers'),
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2, color: '#10b981' },
        itemStyle: { color: '#10b981' },
        data: props.rows.map(r => r.new_customers),
      },
    ],
  }
})
</script>

<template>
  <div class="relative h-72 w-full">
    <VChart :option="option" autoresize class="h-full w-full" />
    <div
      v-if="loading"
      class="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-zinc-950/60"
    >
      <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin text-zinc-400" aria-hidden="true" />
    </div>
  </div>
</template>
