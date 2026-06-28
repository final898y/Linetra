<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useReportStore } from '@/stores/reports'
import { useReportFilters } from '@/composables/useReportFilters'
import ReportCard from '@/components/common/ReportCard.vue'
import ReportFilterPanel from '@/components/common/ReportFilterPanel.vue'
import ReportSearchInput from '@/components/common/ReportSearchInput.vue'
import {
  SparklesIcon,
  FunnelIcon,
  BarsArrowDownIcon,
  BarsArrowUpIcon,
  EyeSlashIcon,
  EyeIcon,
} from '@heroicons/vue/24/outline'

const reportStore = useReportStore()
const { filterOptions, sortOrder, hideAnnouncements, hideCompleted, keyword } = useReportFilters()
const isFilterOpen = ref(false)

const applyFilters = () => {
  reportStore.fetchReports(filterOptions.value)
  isFilterOpen.value = false
}

// 當排序、開關或搜尋關鍵字變動時，立即更新列表
watch([sortOrder, hideAnnouncements, hideCompleted, keyword], () => {
  reportStore.fetchReports(filterOptions.value)
})

onMounted(() => {
  reportStore.fetchReports(filterOptions.value)
})
</script>

<template>
  <div class="space-y-8">
    <div class="flex flex-col gap-3">
      <!-- 第一列：標題 + 搜尋框 -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 class="text-3xl font-extrabold tracking-tightest text-cream-text">待辦案件</h2>
          <p class="text-cream-muted mt-1 text-sm uppercase tracking-widest font-bold">
            Pending Reports
          </p>
        </div>
        <div class="w-full sm:max-w-sm md:max-w-md">
          <ReportSearchInput />
        </div>
      </div>

      <!-- 第二列：篩選操作按鈕群 -->
      <div class="flex flex-wrap items-center justify-end gap-2">
        <!-- Sort Toggle -->
        <button
          @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'"
          class="flex items-center gap-1.5 px-3 py-2 bg-cream-surface border border-cream-border rounded-xl text-xs font-bold text-cream-text hover:bg-cream-hover transition-colors"
          :title="sortOrder === 'asc' ? '最近優先' : '最遠優先'"
        >
          <BarsArrowDownIcon v-if="sortOrder === 'asc'" class="size-4" />
          <BarsArrowUpIcon v-else class="size-4" />
          {{ sortOrder === 'asc' ? '最近' : '最遠' }}
        </button>

        <!-- Hide Announcements Toggle -->
        <button
          @click="hideAnnouncements = !hideAnnouncements"
          class="flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-bold transition-all"
          :class="
            hideAnnouncements
              ? 'bg-status-overdue/10 border-status-overdue/20 text-status-overdue'
              : 'bg-cream-surface border-cream-border text-cream-text hover:bg-cream-hover'
          "
        >
          <EyeSlashIcon v-if="hideAnnouncements" class="size-4" />
          <EyeIcon v-else class="size-4" />
          {{ hideAnnouncements ? '隱藏公告' : '顯示公告' }}
        </button>

        <!-- Hide Completed Toggle -->
        <button
          @click="hideCompleted = !hideCompleted"
          class="flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-bold transition-all"
          :class="
            hideCompleted
              ? 'bg-status-completed/10 border-status-completed/20 text-status-completed'
              : 'bg-cream-surface border-cream-border text-cream-text hover:bg-cream-hover'
          "
        >
          <EyeSlashIcon v-if="hideCompleted" class="size-4" />
          <EyeIcon v-else class="size-4" />
          {{ hideCompleted ? '隱藏已完成' : '顯示已完成' }}
        </button>

        <button
          @click="isFilterOpen = !isFilterOpen"
          class="flex items-center gap-1.5 px-3 py-2 bg-cream-surface border border-cream-border rounded-xl text-xs font-bold text-cream-text hover:bg-cream-hover transition-colors"
        >
          <FunnelIcon class="size-4" />
          篩選
        </button>
      </div>
    </div>

    <!-- Filter Panel -->
    <ReportFilterPanel v-if="isFilterOpen" @apply="applyFilters" />

    <!-- Loading State -->
    <div v-if="reportStore.loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="h-48 bg-cream-surface animate-pulse rounded-2xl"></div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="reportStore.reports.length === 0"
      class="bg-cream-surface border border-dashed border-cream-border rounded-3xl p-20 text-center"
    >
      <SparklesIcon class="size-12 text-brand mx-auto mb-4" />
      <h3 class="text-xl font-bold text-cream-text">目前沒有符合條件的案件</h3>
      <p class="text-cream-muted mt-2">嘗試調整篩選條件或點擊左側「建立通報」。</p>
    </div>

    <!-- Report List -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="report in reportStore.reports" :key="report.id" class="relative">
        <RouterLink :to="{ name: 'report-detail', params: { id: report.id } }">
          <ReportCard :report="report" />
        </RouterLink>
        <RouterLink
          :to="{ name: 'report-edit', params: { id: report.id } }"
          class="absolute top-4 right-4 z-10 p-2 bg-cream-bg rounded-lg shadow-sm border border-cream-border text-cream-muted hover:text-brand transition-colors"
          title="編輯案件"
        >
          <span class="text-[10px] font-bold">編輯</span>
        </RouterLink>
      </div>
    </div>
  </div>
</template>
