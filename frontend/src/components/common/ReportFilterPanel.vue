<script setup lang="ts">
import { ALL_REPORT_TYPES, COMMON_TAGS } from '@/config/reportTypes'
import type { ReportStatus } from '@/types/models'
import { useReportFilters } from '@/composables/useReportFilters'

const {
  selectedStatuses,
  selectedTemplateTypes,
  selectedTags,
  toggleStatus,
  toggleTemplateType,
  toggleTag,
  clearFilters,
} = useReportFilters()

const emit = defineEmits(['apply'])

const statuses: ReportStatus[] = ['pending', 'completed', 'overdue', 'archived', 'deleted']
const statusLabels: Record<ReportStatus, string> = {
  pending: '待辦',
  completed: '已完成',
  overdue: '已逾期',
  archived: '已封存',
  deleted: '已刪除',
}

const apply = () => {
  emit('apply')
}
</script>

<template>
  <div class="bg-cream-surface border border-cream-border rounded-2xl p-6 space-y-6">
    <div class="flex justify-between items-center">
      <h3 class="font-bold text-cream-text">篩選條件</h3>
      <button @click="clearFilters" class="text-xs text-cream-muted hover:text-brand font-bold">
        清除全部
      </button>
    </div>

    <!-- Status Filters -->
    <div class="space-y-3">
      <p class="text-[10px] font-bold text-cream-muted uppercase tracking-widest">案件狀態</p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="status in statuses"
          :key="status"
          @click="toggleStatus(status)"
          :class="[
            selectedStatuses.includes(status)
              ? 'bg-brand text-white border-brand'
              : 'bg-cream-bg text-cream-muted border-cream-border hover:border-brand',
          ]"
          class="px-3 py-1 rounded-lg text-xs font-bold border transition-colors"
        >
          {{ statusLabels[status] }}
        </button>
      </div>
    </div>

    <!-- Template Filters -->
    <div class="space-y-3">
      <p class="text-[10px] font-bold text-cream-muted uppercase tracking-widest">案件類型</p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="type in ALL_REPORT_TYPES"
          :key="type.id"
          @click="toggleTemplateType(type.id)"
          :class="[
            selectedTemplateTypes.includes(type.id)
              ? 'bg-brand text-white border-brand'
              : 'bg-cream-bg text-cream-muted border-cream-border hover:border-brand',
          ]"
          class="px-3 py-1 rounded-lg text-xs font-bold border transition-colors"
        >
          {{ type.name }}
        </button>
      </div>
    </div>

    <!-- Tag Filters -->
    <div class="space-y-3">
      <p class="text-[10px] font-bold text-cream-muted uppercase tracking-widest">
        標籤篩選 (任一符合)
      </p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="tag in COMMON_TAGS"
          :key="tag"
          @click="toggleTag(tag)"
          :class="[
            selectedTags.includes(tag)
              ? 'bg-brand/20 text-brand border-brand'
              : 'bg-cream-bg text-cream-muted border-cream-border hover:border-brand',
          ]"
          class="px-3 py-1 rounded-lg text-xs font-bold border transition-colors"
        >
          {{ tag }}
        </button>
      </div>
    </div>

    <button
      @click="apply"
      class="w-full py-2 bg-brand text-white rounded-xl text-sm font-bold hover:bg-brand/90 transition-colors"
    >
      套用篩選
    </button>
  </div>
</template>
