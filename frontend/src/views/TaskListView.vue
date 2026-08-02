<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { ClipboardDocumentCheckIcon, PlusIcon } from '@heroicons/vue/24/outline'
import { useReportStore } from '@/stores/reports'
import { useAuthStore } from '@/stores/auth'
import { useReportTemplate } from '@/composables/useReportTemplate'
import ReportCard from '@/components/common/ReportCard.vue'
import type { ReportInsert } from '@/types/models'

dayjs.extend(utc)
dayjs.extend(timezone)

const reportStore = useReportStore()
const authStore = useAuthStore()
const { generateLineText } = useReportTemplate()

const form = reactive({
  subject: '',
  remarks: '',
  deadline: '',
  importance: false,
})
const isSubmitting = ref(false)

const activeTasks = computed(() =>
  reportStore.reports.filter(
    (report) => report.template_type === 'task' && report.status !== 'completed'
  )
)

const refreshTasks = async () => {
  await reportStore.fetchReports({
    statuses: ['pending', 'overdue'],
    templateTypes: ['task'],
    tags: [],
    sortOrder: 'asc',
    hideAnnouncements: true,
    hideCompleted: true,
  })
}

const resetForm = () => {
  form.subject = ''
  form.remarks = ''
  form.deadline = ''
  form.importance = false
}

const createTask = async () => {
  if (!form.subject.trim()) {
    alert('請填寫任務內容')
    return
  }
  if (!authStore.user) {
    alert('請先登入')
    return
  }

  isSubmitting.value = true
  try {
    const announcedDueAt = form.deadline ? dayjs.tz(form.deadline).toISOString() : null
    const taskData: ReportInsert = {
      user_id: authStore.user.id,
      template_type: 'task',
      subject: form.subject.trim(),
      remarks: form.remarks.trim() || null,
      actual_due_at: null,
      announced_due_at: announcedDueAt,
      importance_flag: form.importance,
      status: 'pending',
      formatted_content: generateLineText(
        { template_type: 'task', subject: form.subject.trim(), announced_due_at: announcedDueAt },
        []
      ),
      sent_at: new Date().toISOString(),
    }

    await reportStore.createReport(taskData)
    resetForm()
    await refreshTasks()
    alert('任務已建立')
  } catch (error) {
    console.error('Failed to create task:', error)
    alert('建立任務失敗，請稍後再試')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(refreshTasks)
</script>

<template>
  <div class="space-y-8 pb-20">
    <div>
      <h2 class="text-3xl font-extrabold tracking-tightest text-cream-text">任務清單</h2>
      <p class="text-cream-muted mt-1 text-sm uppercase tracking-widest font-bold">
        建立臨時任務，集中追蹤尚未完成的工作
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <section class="bg-cream-surface border border-cream-border rounded-2xl p-6 space-y-6">
        <div class="flex items-center gap-3 border-b border-cream-border pb-4">
          <div class="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
            <PlusIcon class="size-5" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-cream-text">建立任務</h3>
            <p class="text-xs text-cream-muted">只需填寫任務與期限即可開始追蹤</p>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-cream-text uppercase tracking-wider mb-2"
              >任務內容（必填）</label
            >
            <input
              v-model="form.subject"
              type="text"
              placeholder="例如：確認活動場地與設備"
              class="w-full bg-cream-bg border border-cream-border rounded-xl px-4 py-3 text-cream-text focus:ring-2 focus:ring-brand focus:outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-cream-text uppercase tracking-wider mb-2"
              >任務期限</label
            >
            <input
              v-model="form.deadline"
              type="datetime-local"
              class="w-full bg-cream-bg border border-cream-border rounded-xl px-4 py-3 text-cream-text focus:ring-2 focus:ring-brand focus:outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-cream-text uppercase tracking-wider mb-2"
              >備註</label
            >
            <textarea
              v-model="form.remarks"
              rows="3"
              placeholder="補充負責人、進度或其他提醒"
              class="w-full bg-cream-bg border border-cream-border rounded-xl px-4 py-3 text-sm text-cream-text focus:ring-2 focus:ring-brand focus:outline-none"
            ></textarea>
          </div>

          <label
            class="flex items-center gap-2 text-sm font-bold text-status-overdue cursor-pointer"
          >
            <input
              v-model="form.importance"
              type="checkbox"
              class="w-5 h-5 rounded border-cream-border text-brand focus:ring-brand"
            />
            標記為重要任務
          </label>
        </div>

        <button
          @click="createTask"
          :disabled="isSubmitting"
          class="w-full bg-cream-text text-dark-text py-3 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50"
        >
          {{ isSubmitting ? '建立中...' : '建立任務' }}
        </button>
      </section>

      <section class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-cream-text">尚未完成</h3>
            <p class="text-xs text-cream-muted">完成任務後，點擊卡片上的勾選按鈕即可移除</p>
          </div>
          <span class="px-2.5 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold">
            {{ activeTasks.length }} 項
          </span>
        </div>

        <div v-if="reportStore.loading" class="grid grid-cols-1 gap-5">
          <div
            v-for="i in 3"
            :key="i"
            class="h-48 bg-cream-surface animate-pulse rounded-2xl"
          ></div>
        </div>
        <div
          v-else-if="activeTasks.length === 0"
          class="bg-cream-surface border border-dashed border-cream-border rounded-2xl p-12 text-center"
        >
          <ClipboardDocumentCheckIcon class="size-12 text-brand mx-auto mb-4" />
          <h4 class="text-lg font-bold text-cream-text">目前沒有未完成任務</h4>
          <p class="text-sm text-cream-muted mt-2">左側建立第一項臨時任務吧。</p>
        </div>
        <div v-else class="grid grid-cols-1 gap-5">
          <div v-for="task in activeTasks" :key="task.id" class="relative">
            <RouterLink :to="{ name: 'report-detail', params: { id: task.id } }">
              <ReportCard :report="task" />
            </RouterLink>
            <RouterLink
              :to="{ name: 'report-edit', params: { id: task.id } }"
              class="absolute top-4 right-4 z-10 p-2 bg-cream-bg rounded-lg shadow-sm border border-cream-border text-cream-muted hover:text-brand transition-colors"
              title="編輯任務"
            >
              <span class="text-[10px] font-bold">編輯</span>
            </RouterLink>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
