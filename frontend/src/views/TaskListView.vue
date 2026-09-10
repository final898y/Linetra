<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { CheckIcon, ClipboardDocumentCheckIcon, PlusIcon } from '@heroicons/vue/24/outline'
import { useReportStore } from '@/stores/reports'
import { useAuthStore } from '@/stores/auth'
import { useReportTemplate } from '@/composables/useReportTemplate'
import type { ReportInsert } from '@/types/models'

dayjs.extend(utc)
dayjs.extend(timezone)

const reportStore = useReportStore()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const { generateLineText } = useReportTemplate()

const selectedId = ref<string | null>(null)
const isSubmitting = ref(false)
const form = reactive({
  subject: '',
  remarks: '',
  deadline: '',
  importance: false,
})

const activeTasks = computed(() =>
  reportStore.reports.filter(
    (report) => report.template_type === 'task' && report.status !== 'completed'
  )
)
const selectedTask = computed(
  () => reportStore.reports.find((report) => report.id === selectedId.value) || null
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

const resetForm = (updateRoute = true) => {
  selectedId.value = null
  form.subject = ''
  form.remarks = ''
  form.deadline = ''
  form.importance = false
  if (updateRoute && route.params.id) router.push({ name: 'task-list' })
}

const selectTask = (task: (typeof activeTasks.value)[number], updateRoute = true) => {
  selectedId.value = task.id
  form.subject = task.subject
  form.remarks = task.remarks || ''
  form.deadline = task.announced_due_at
    ? dayjs(task.announced_due_at).format('YYYY-MM-DDTHH:mm')
    : ''
  form.importance = task.importance_flag
  if (updateRoute && route.params.id !== task.id) {
    router.push({ name: 'task-list', params: { id: task.id } })
  }
}

const syncTaskFromRoute = () => {
  const taskId = route.params.id as string | undefined
  if (!taskId) {
    resetForm(false)
    return
  }
  const task = activeTasks.value.find((item) => item.id === taskId)
  if (task) selectTask(task, false)
}

const formatDeadline = (deadline: string | null) =>
  deadline ? dayjs(deadline).format('MM/DD HH:mm') : '未設定期限'

const saveTask = async () => {
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
    const formattedContent = generateLineText(
      { template_type: 'task', subject: form.subject.trim(), announced_due_at: announcedDueAt },
      []
    )

    if (selectedId.value) {
      await reportStore.updateReport(selectedId.value, {
        subject: form.subject.trim(),
        remarks: form.remarks.trim() || null,
        announced_due_at: announcedDueAt,
        importance_flag: form.importance,
        formatted_content: formattedContent,
      })
      alert('任務已更新')
    } else {
      const taskData: ReportInsert = {
        user_id: authStore.user.id,
        template_type: 'task',
        subject: form.subject.trim(),
        remarks: form.remarks.trim() || null,
        actual_due_at: null,
        announced_due_at: announcedDueAt,
        importance_flag: form.importance,
        status: 'pending',
        formatted_content: formattedContent,
        sent_at: new Date().toISOString(),
      }
      await reportStore.createReport(taskData)
      alert('任務已建立')
    }

    resetForm()
    await refreshTasks()
  } catch (error) {
    console.error('Failed to save task:', error)
    alert(selectedId.value ? '更新任務失敗，請稍後再試' : '建立任務失敗，請稍後再試')
  } finally {
    isSubmitting.value = false
  }
}

const completeTask = async () => {
  if (!selectedId.value) return
  try {
    await reportStore.updateStatus(selectedId.value, 'completed')
    resetForm()
    await refreshTasks()
    alert('任務已完成')
  } catch (error) {
    console.error('Failed to complete task:', error)
    alert('更新任務狀態失敗，請稍後再試')
  }
}

watch(() => route.params.id, syncTaskFromRoute)

onMounted(async () => {
  await refreshTasks()
  syncTaskFromRoute()
})
</script>

<template>
  <div class="min-h-full bg-cream-bg p-4 md:p-6">
    <div class="mx-auto max-w-7xl space-y-4">
      <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-3">
          <div class="rounded-2xl bg-brand/10 p-3 text-brand">
            <ClipboardDocumentCheckIcon class="h-7 w-7" />
          </div>
          <div>
            <h1 class="text-xl font-bold text-cream-text">任務清單</h1>
            <p class="text-sm text-cream-muted">建立臨時任務，集中追蹤尚未完成的工作</p>
          </div>
        </div>
        <button class="btn-primary flex items-center gap-2" type="button" @click="resetForm()">
          <PlusIcon class="h-5 w-5" />新增任務
        </button>
      </header>

      <div class="grid gap-4 lg:grid-cols-12">
        <aside class="workspace-list space-y-3 lg:col-span-4">
          <div class="flex items-center justify-between">
            <h2 class="text-xs font-bold uppercase tracking-widest text-cream-muted">尚未完成</h2>
            <span class="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-bold text-brand">
              {{ activeTasks.length }} 項
            </span>
          </div>

          <div v-if="reportStore.loading" class="space-y-2">
            <div v-for="i in 3" :key="i" class="h-28 animate-pulse rounded-2xl bg-cream-surface" />
          </div>
          <div
            v-else-if="activeTasks.length === 0"
            class="rounded-2xl border border-dashed border-cream-border bg-cream-surface p-8 text-center"
          >
            <ClipboardDocumentCheckIcon class="mx-auto mb-3 size-10 text-brand" />
            <p class="text-sm font-bold text-cream-text">目前沒有未完成任務</p>
            <p class="mt-1 text-xs text-cream-muted">建立第一項臨時任務吧。</p>
          </div>
          <button
            v-for="task in activeTasks"
            v-else
            :key="task.id"
            class="w-full rounded-2xl border p-4 text-left transition-all"
            :class="
              selectedId === task.id
                ? 'border-brand bg-brand/10 shadow-sm'
                : 'border-cream-border bg-cream-surface hover:-translate-y-0.5 hover:border-brand hover:bg-cream-hover hover:shadow-sm'
            "
            type="button"
            @click="selectTask(task)"
          >
            <div class="flex items-start justify-between gap-3">
              <h3 class="line-clamp-2 font-bold text-cream-text">{{ task.subject }}</h3>
              <span
                class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
                :class="
                  task.status === 'overdue'
                    ? 'bg-status-overdue/10 text-status-overdue'
                    : 'bg-brand/10 text-brand'
                "
              >
                {{ task.status === 'overdue' ? '逾期' : '待處理' }}
              </span>
            </div>
            <p class="mt-2 text-xs text-cream-muted">
              期限：{{ formatDeadline(task.announced_due_at) }}
            </p>
            <p v-if="task.importance_flag" class="mt-2 text-xs font-bold text-status-overdue">
              重要任務
            </p>
          </button>
        </aside>

        <section
          class="workspace-editor rounded-2xl border border-cream-border bg-cream-surface p-4 shadow-sm sm:p-6 lg:col-span-8"
        >
          <div class="mb-5 flex items-center justify-between border-b border-cream-border pb-4">
            <div class="flex items-center gap-3">
              <div
                class="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand"
              >
                <ClipboardDocumentCheckIcon class="size-5" />
              </div>
              <div>
                <h2 class="font-bold text-cream-text">
                  {{ selectedId ? '編輯任務' : '建立任務' }}
                </h2>
                <p class="text-xs text-cream-muted">填寫任務內容與期限，集中追蹤工作進度</p>
              </div>
            </div>
            <button
              v-if="selectedTask"
              class="btn-secondary flex items-center gap-2 text-status-completed"
              type="button"
              @click="completeTask"
            >
              <CheckIcon class="h-5 w-5" />完成任務
            </button>
          </div>

          <div class="space-y-4">
            <label>
              <span class="form-label">任務內容（必填）</span>
              <input
                v-model="form.subject"
                class="form-input"
                placeholder="例如：確認活動場地與設備"
              />
            </label>

            <label>
              <span class="form-label">任務期限</span>
              <input v-model="form.deadline" class="form-input" type="datetime-local" />
            </label>

            <label>
              <span class="form-label">備註</span>
              <textarea
                v-model="form.remarks"
                class="form-input min-h-28"
                placeholder="補充負責人、進度或其他提醒"
              />
            </label>

            <label
              class="flex cursor-pointer items-center gap-2 text-sm font-bold text-status-overdue"
            >
              <input
                v-model="form.importance"
                type="checkbox"
                class="h-5 w-5 rounded border-cream-border text-brand focus:ring-brand"
              />
              標記為重要任務
            </label>
          </div>

          <div class="mt-5 flex justify-end border-t border-cream-border pt-4">
            <button
              data-testid="save-task"
              class="btn-primary px-5"
              type="button"
              :disabled="isSubmitting"
              @click="saveTask"
            >
              {{ isSubmitting ? '儲存中…' : selectedId ? '儲存任務' : '建立任務' }}
            </button>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
