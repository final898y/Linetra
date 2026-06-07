<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useReportStore } from '@/stores/reports'
import { REPORT_TEMPLATES } from '@/config/reportTemplates'
import ReportCard from '@/components/common/ReportCard.vue'
import { SparklesIcon, ClockIcon } from '@heroicons/vue/24/outline'

const reportStore = useReportStore()
const selectedTemplateType = ref('all')

const applyFilters = () => {
  reportStore.fetchReports(undefined, selectedTemplateType.value)
}

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
        <!-- Template Filter -->
        <select
          v-model="selectedTemplateType"
          @change="applyFilters"
          class="px-4 py-2 bg-cream-surface border border-cream-border rounded-xl text-xs font-bold text-cream-text hover:bg-cream-hover transition-colors"
        >
          <option value="all">全部類型</option>
          <option v-for="(template, key) in REPORT_TEMPLATES" :key="key" :value="key">
            {{ template.name }}
          </option>
        </select>

        <!-- Existing Filters placeholder -->
        <button
          class="flex items-center gap-2 px-4 py-2 bg-cream-surface border border-cream-border rounded-xl text-xs font-bold text-cream-muted hover:bg-cream-hover transition-colors"
        >
          <ClockIcon class="size-4" />
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
      <SparklesIcon class="size-12 text-brand mx-auto mb-4" />
      <h3 class="text-xl font-bold text-cream-text">目前沒有待辦案件</h3>
      <p class="text-cream-muted mt-2">點擊左側「建立通報」來開始您的第一個任務。</p>
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
