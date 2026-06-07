<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useReportStore } from '@/stores/reports'
import { useTimeFormatter } from '@/composables/useTimeFormatter'
import type { Report, ReportItem } from '@/types/models'
import { ArrowLeftIcon, PencilIcon, CheckIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const reportStore = useReportStore()
const { formatRelative, getRemainingTimeColor } = useTimeFormatter()

const report = ref<Report | null>(null)
const items = ref<ReportItem[]>([])
const loading = ref(true)

onMounted(async () => {
  const reportId = route.params.id as string
  if (reportId) {
    try {
      report.value = await reportStore.fetchReportById(reportId)
      items.value = await reportStore.fetchReportItemsById(reportId)
    } catch (error) {
      console.error('Failed to load report:', error)
    } finally {
      loading.value = false
    }
  }
})

const handleComplete = async () => {
  if (report.value) {
    await reportStore.updateStatus(report.value.id, 'completed')
    report.value.status = 'completed'
  }
}
</script>

<template>
  <div v-if="loading" class="p-8 text-center text-cream-muted">載入中...</div>
  <div v-else-if="!report" class="p-8 text-center text-status-overdue">找不到案件</div>
  <div v-else class="max-w-3xl mx-auto p-6 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <button
        @click="router.back()"
        class="flex items-center gap-2 text-cream-muted hover:text-cream-text"
      >
        <ArrowLeftIcon class="size-5" /> 返回
      </button>
      <div class="flex gap-2">
        <RouterLink
          :to="{ name: 'report-edit', params: { id: report.id } }"
          class="flex items-center gap-2 px-4 py-2 bg-cream-surface border border-cream-border rounded-xl text-sm font-bold text-cream-text hover:bg-cream-hover"
        >
          <PencilIcon class="size-4" /> 編輯
        </RouterLink>
        <button
          v-if="report.status !== 'completed'"
          @click="handleComplete"
          class="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-xl text-sm font-bold hover:bg-brand/90"
        >
          <CheckIcon class="size-4" /> 標記完成
        </button>
      </div>
    </div>

    <!-- Details -->
    <div class="bg-cream-surface border border-cream-border rounded-2xl p-8 space-y-6">
      <div>
        <h1 class="text-3xl font-extrabold text-cream-text mb-2">{{ report.subject }}</h1>
        <p class="text-sm font-bold text-cream-muted uppercase tracking-wider">
          {{ report.department || '未設定單位' }}
        </p>
      </div>

      <div class="grid grid-cols-2 gap-4 pt-6 border-t border-cream-border/50">
        <div>
          <p class="text-[10px] font-bold text-cream-muted uppercase tracking-widest">狀態</p>
          <p class="text-sm font-bold text-brand">{{ report.status }}</p>
        </div>
        <div>
          <p class="text-[10px] font-bold text-cream-muted uppercase tracking-widest">截止時間</p>
          <p
            class="text-sm font-bold"
            :class="getRemainingTimeColor(report.announced_due_at, report.status === 'completed')"
          >
            {{ formatRelative(report.announced_due_at) }}
          </p>
        </div>
      </div>

      <div v-if="items.length > 0" class="pt-6 border-t border-cream-border/50 space-y-4">
        <h3 class="text-xs font-bold text-cream-muted uppercase tracking-widest">通報細節</h3>
        <div v-for="item in items" :key="item.id" class="space-y-1">
          <p class="text-[10px] font-bold text-cream-muted uppercase">{{ item.item_type }}</p>
          <p class="text-sm text-cream-text bg-cream-bg p-3 rounded-lg">{{ item.content }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
