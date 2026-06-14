<script setup lang="ts">
import type { Report } from '@/types/models'
import { XMarkIcon } from '@heroicons/vue/24/outline'

defineProps<{
  date: string
  reports: Report[]
  isOpen: boolean
}>()

defineEmits(['close'])

const statusColors = {
  pending: 'bg-brand/10 text-brand border-brand/20',
  completed: 'bg-status-completed/10 text-status-completed border-status-completed/20',
  overdue: 'bg-status-overdue/10 text-status-overdue border-status-overdue/20',
  archived: 'bg-status-archived/10 text-status-archived border-status-archived/20',
  deleted: 'bg-status-overdue/5 text-status-overdue/70 border-status-overdue/10 grayscale',
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Overlay -->
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('close')"></div>

    <!-- Modal -->
    <div
      class="relative bg-cream-surface rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-cream-border"
    >
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-extrabold text-cream-text">{{ date }} 行程清單</h3>
        <button
          @click="$emit('close')"
          class="text-cream-muted hover:text-cream-text transition-colors"
        >
          <XMarkIcon class="size-6" />
        </button>
      </div>

      <div class="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
        <RouterLink
          v-for="report in reports"
          :key="report.id"
          :to="{ name: 'report-detail', params: { id: report.id } }"
          class="block p-4 rounded-xl border transition-all hover:scale-[1.02]"
          :class="statusColors[report.status]"
        >
          <div class="font-bold text-sm truncate">{{ report.subject }}</div>
          <div class="text-[10px] opacity-70 font-bold uppercase tracking-wider mt-1">
            {{ report.department || '未設定單位' }}
          </div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>
