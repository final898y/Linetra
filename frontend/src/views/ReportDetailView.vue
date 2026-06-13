<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useReportStore } from '@/stores/reports'
import { useTimeFormatter } from '@/composables/useTimeFormatter'
import type { Report, ReportItem } from '@/types/models'
import { ArrowLeftIcon, PencilIcon, CheckIcon, TrashIcon } from '@heroicons/vue/24/outline'

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

const handleDelete = async () => {
  if (report.value && confirm('確定要刪除此案件嗎？此操作將標記為已刪除。')) {
    await reportStore.updateStatus(report.value.id, 'deleted')
    router.push({ name: 'dashboard' })
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
          v-if="report.status !== 'completed' && report.status !== 'deleted'"
          @click="handleComplete"
          class="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-xl text-sm font-bold hover:bg-brand/90"
        >
          <CheckIcon class="size-4" /> 標記完成
        </button>
        <button
          v-if="report.status !== 'deleted'"
          @click="handleDelete"
          class="flex items-center gap-2 px-4 py-2 bg-cream-surface border border-status-overdue/20 text-status-overdue rounded-xl text-sm font-bold hover:bg-status-overdue/5"
        >
          <TrashIcon class="size-4" /> 刪除
        </button>
      </div>
    </div>

    <!-- Details -->
    <div class="bg-cream-surface border border-cream-border rounded-2xl p-8 space-y-6">
      <div>
        <h1 class="text-3xl font-extrabold text-cream-text mb-2">{{ report.subject }}</h1>
        <div class="flex flex-wrap items-center gap-4 mb-4">
          <p class="text-sm font-bold text-cream-muted uppercase tracking-wider">
            {{ report.department || '未設定單位' }}
          </p>
          <div v-if="report.tags && report.tags.length > 0" class="flex flex-wrap gap-1">
            <span
              v-for="tag in report.tags"
              :key="tag"
              class="text-[10px] font-bold px-2 py-0.5 bg-cream-bg text-cream-muted border border-cream-border rounded-lg"
            >
              #{{ tag }}
            </span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-cream-border/50">
        <div>
          <p class="text-[10px] font-bold text-cream-muted uppercase tracking-widest">狀態</p>
          <p class="text-sm font-bold text-brand uppercase">{{ report.status }}</p>
        </div>
        <div>
          <p class="text-[10px] font-bold text-cream-muted uppercase tracking-widest">對外期限</p>
          <p
            class="text-sm font-bold"
            :class="
              getRemainingTimeColor(
                report.announced_due_at,
                report.status === 'completed' || report.status === 'deleted'
              )
            "
          >
            {{ formatRelative(report.announced_due_at) }}
          </p>
        </div>
        <div v-if="report.actual_due_at">
          <p class="text-[10px] font-bold text-cream-muted uppercase tracking-widest">
            實際截止 (內控)
          </p>
          <p
            class="text-sm font-bold"
            :class="
              getRemainingTimeColor(
                report.actual_due_at,
                report.status === 'completed' || report.status === 'deleted'
              )
            "
          >
            {{ formatRelative(report.actual_due_at) }}
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

      <!-- Internal Remarks -->
      <div v-if="report.remarks" class="pt-6 border-t border-cream-border/50 space-y-4">
        <h3 class="text-xs font-bold text-status-overdue uppercase tracking-widest">
          內部備註 (僅供內部追蹤)
        </h3>
        <p
          class="text-sm text-cream-text bg-cream-bg p-4 rounded-xl border border-cream-border whitespace-pre-wrap"
        >
          {{ report.remarks }}
        </p>
      </div>
    </div>
  </div>
</template>
