<script setup lang="ts">
import type { CalendarDay } from '@/composables/useCalendar'
import type { Report } from '@/types/models'

defineProps<{
  day: CalendarDay
  reports: Report[]
}>()

const statusColors = {
  pending: 'bg-brand/10 text-brand border-brand/20',
  completed: 'bg-status-completed/10 text-status-completed border-status-completed/20',
  overdue: 'bg-status-overdue/10 text-status-overdue border-status-overdue/20',
  archived: 'bg-status-archived/10 text-status-archived border-status-archived/20',
  deleted: 'bg-status-overdue/5 text-status-overdue/70 border-status-overdue/10 grayscale',
}
</script>

<template>
  <div
    class="min-h-[100px] md:min-h-[140px] p-2 border-r border-b border-cream-border transition-colors hover:bg-cream-bg/50"
    :class="{
      'bg-cream-surface/30': !day.isCurrentMonth,
      'bg-cream-surface': day.isCurrentMonth,
    }"
  >
    <div class="flex justify-between items-start mb-2">
      <span
        class="text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full"
        :class="{
          'bg-brand text-white': day.isToday,
          'text-cream-muted': !day.isCurrentMonth && !day.isToday,
          'text-cream-text': day.isCurrentMonth && !day.isToday,
        }"
      >
        {{ day.date.date() }}
      </span>
      <span
        v-if="reports.length > 0"
        class="text-[9px] font-bold text-cream-muted bg-cream-bg px-1 rounded"
      >
        {{ reports.length }} 案
      </span>
    </div>

    <!-- 案件標籤清單 -->
    <div class="space-y-1 overflow-hidden">
      <div
        v-for="report in reports.slice(0, 3)"
        :key="report.id"
        class="text-[9px] px-1.5 py-0.5 rounded border truncate font-bold flex items-center gap-1"
        :class="statusColors[report.status]"
      >
        <div
          v-if="report.importance_flag"
          class="w-1 h-1 rounded-full bg-status-overdue animate-pulse shrink-0"
        ></div>
        {{ report.subject }}
      </div>
      <div v-if="reports.length > 3" class="text-[8px] text-cream-muted font-bold pl-1">
        +{{ reports.length - 3 }} 更多...
      </div>
    </div>
  </div>
</template>
