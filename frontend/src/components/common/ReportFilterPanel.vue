<script setup lang="ts">
import { ALL_REPORT_TYPES } from '@/config/reportTypes'
import type { ReportStatus } from '@/types/models'
import { useReportFilters } from '@/composables/useReportFilters'
import { useReportStore } from '@/stores/reports'
import { computed, ref } from 'vue'

const reportStore = useReportStore()
const {
  selectedStatuses,
  selectedTemplateTypes,
  selectedTags,
  hideCompleted,
  toggleStatus,
  toggleTemplateType,
  toggleTag,
  clearFilters,
} = useReportFilters()

const searchQuery = ref('')
const filteredTags = computed(() => {
  return reportStore.allUniqueTags.filter((tag) =>
    tag.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

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
      <div class="flex flex-wrap gap-2 mb-4">
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

      <button
        @click="hideCompleted = !hideCompleted"
        class="flex items-center gap-2 text-xs font-bold transition-colors"
        :class="hideCompleted ? 'text-brand' : 'text-cream-muted hover:text-brand'"
      >
        <div
          class="w-4 h-4 border rounded flex items-center justify-center"
          :class="hideCompleted ? 'bg-brand border-brand' : 'border-cream-border'"
        >
          <span v-if="hideCompleted" class="text-white text-[10px]">✓</span>
        </div>
        隱藏已完成案件
      </button>
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
      <p class="text-[10px] font-bold text-cream-muted uppercase tracking-widest">標籤篩選</p>

      <!-- Popular Tags -->
      <div v-if="reportStore.topTags.length > 0 && !searchQuery" class="mb-4">
        <p class="text-[9px] text-cream-muted mb-2 italic">常用標籤</p>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="tag in reportStore.topTags"
            :key="tag"
            @click="toggleTag(tag)"
            :class="[
              selectedTags.includes(tag)
                ? 'bg-brand/20 text-brand border-brand'
                : 'bg-cream-bg text-cream-text border-cream-border hover:border-brand',
            ]"
            class="px-2 py-1 rounded-md text-[10px] font-bold border transition-colors"
          >
            {{ tag }}
          </button>
        </div>
      </div>

      <!-- Searchable Input -->
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜尋標籤..."
        class="w-full bg-cream-bg border border-cream-border rounded-lg px-3 py-2 text-xs text-cream-text focus:ring-1 focus:ring-brand focus:outline-none mb-2"
      />

      <!-- All Tags List -->
      <div class="flex flex-wrap gap-1.5 max-h-[150px] overflow-y-auto">
        <button
          v-for="tag in filteredTags"
          :key="tag"
          @click="toggleTag(tag)"
          :class="[
            selectedTags.includes(tag)
              ? 'bg-brand/20 text-brand border-brand'
              : 'bg-cream-bg text-cream-muted border-cream-border hover:border-brand',
          ]"
          class="px-2 py-1 rounded-md text-[10px] font-bold border transition-colors"
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
