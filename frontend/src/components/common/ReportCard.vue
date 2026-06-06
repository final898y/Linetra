<script setup lang="ts">
import type { Report } from '@/types/models'
import { useTimeFormatter } from '@/composables/useTimeFormatter'
import { useReportStore } from '@/stores/reports'

const props = defineProps<{
  report: Report
}>()

const { formatRelative, getRemainingTimeColor } = useTimeFormatter()
const reportStore = useReportStore()

const handleComplete = async () => {
  await reportStore.updateStatus(props.report.id, 'completed')
}

const statusColors = {
  pending: 'bg-brand/10 text-brand border-brand/20',
  completed: 'bg-status-completed/10 text-status-completed border-status-completed/20',
  overdue: 'bg-status-overdue/10 text-status-overdue border-status-overdue/20',
  archived: 'bg-status-archived/10 text-status-archived border-status-archived/20',
}
</script>

<template>
  <div
    class="bg-cream-surface border border-cream-border rounded-2xl p-6 hover:bg-cream-hover transition-all group flex flex-col justify-between h-full"
    :class="[report.importance_flag ? 'border-l-4 border-l-status-overdue' : '']"
  >
    <div>
      <div class="flex justify-between items-start mb-4">
        <span
          class="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase border"
          :class="statusColors[report.status]"
        >
          {{ report.status }}
        </span>
        <div
          v-if="report.importance_flag"
          class="w-2 h-2 rounded-full bg-status-overdue animate-pulse"
        ></div>
      </div>

      <h3 class="text-xl font-bold text-cream-text mb-2 line-clamp-2 leading-tight">
        {{ report.subject }}
      </h3>
      <p
        v-if="report.department"
        class="text-xs font-bold text-cream-muted uppercase tracking-wider mb-4"
      >
        {{ report.department }}
      </p>
    </div>

    <div class="mt-6 pt-4 border-t border-cream-border/50">
      <div class="flex justify-between items-end">
        <div>
          <p class="text-[10px] font-bold text-cream-muted uppercase tracking-widest mb-1">
            對外通知期限
          </p>
          <p
            class="text-sm font-bold"
            :class="getRemainingTimeColor(report.announced_due_at, report.status === 'completed')"
          >
            {{ formatRelative(report.announced_due_at) }}
          </p>
        </div>
        <button
          v-if="report.status !== 'completed'"
          @click.stop="handleComplete"
          class="w-8 h-8 rounded-lg bg-cream-bg border border-cream-border flex items-center justify-center hover:bg-brand hover:text-white hover:border-brand transition-all"
          title="標記完成"
        >
          ✓
        </button>
      </div>
    </div>
  </div>
</template>
