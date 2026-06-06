<script setup lang="ts">
import { onMounted } from 'vue'
import { useReportStore } from '@/stores/reports'
import ReportCard from '@/components/common/ReportCard.vue'

const reportStore = useReportStore()

onMounted(() => {
  reportStore.fetchReports()
})
</script>

<template>
  <div class="space-y-8">
    <div class="flex justify-between items-end">
      <div>
        <h2 class="text-3xl font-extrabold tracking-tightest text-cream-text">待辦案件</h2>
        <p class="text-cream-muted mt-2 text-sm uppercase tracking-widest font-bold">
          Pending Reports
        </p>
      </div>
      <div class="flex gap-2">
        <!-- Filters placeholder -->
        <button
          class="px-4 py-2 bg-cream-surface border border-cream-border rounded-xl text-xs font-bold text-cream-text hover:bg-cream-hover"
        >
          全部案件
        </button>
        <button
          class="px-4 py-2 bg-cream-surface border border-cream-border rounded-xl text-xs font-bold text-cream-muted hover:bg-cream-hover"
        >
          即將到期
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="reportStore.loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="h-48 bg-cream-surface animate-pulse rounded-2xl"></div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="reportStore.reports.length === 0"
      class="bg-cream-surface border border-dashed border-cream-border rounded-3xl p-20 text-center"
    >
      <p class="text-4xl mb-4">🎉</p>
      <h3 class="text-xl font-bold text-cream-text">目前沒有待辦案件</h3>
      <p class="text-cream-muted mt-2">點擊左側「建立通報」來開始您的第一個任務。</p>
    </div>

    <!-- Report List -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ReportCard v-for="report in reportStore.reports" :key="report.id" :report="report" />
    </div>
  </div>
</template>
