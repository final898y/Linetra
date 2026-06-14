<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { useReportStore } from '@/stores/reports'
import { useAuthStore } from '@/stores/auth'
import {
  PlusIcon,
  TrashIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  EyeIcon,
} from '@heroicons/vue/24/outline'
import { useReportForm } from '@/composables/useReportForm'
import type {
  ReportItem,
  ReportStatus,
  TemplateType,
  ReportInsert,
  ReportItemInsert,
} from '@/types/models'

dayjs.extend(utc)
dayjs.extend(timezone)

const reportStore = useReportStore()
const authStore = useAuthStore()
const route = useRoute()
const {
  tabs,
  activeTab,
  currentReportId,
  currentTemplate,
  useDefaultValue,
  form,
  items,
  sortedItems,
  isInitializing,
  updateMode,
  applyTemplate,
  toggleDefault,
  addItem,
  removeItem,
  previewText,
  getItemLabel,
  commonTags,
  toggleTag,
  addCustomTag,
} = useReportForm()

const customTagInput = ref('')
const handleAddCustomTag = () => {
  if (customTagInput.value) {
    addCustomTag(customTagInput.value)
    customTagInput.value = ''
  }
}

onMounted(async () => {
  const reportId = route.params.id as string
  if (reportId) {
    isInitializing.value = true
    try {
      currentReportId.value = reportId
      const report = await reportStore.fetchReportById(reportId)
      const reportItems = await reportStore.fetchReportItemsById(reportId)

      // Load form data
      form.template_type = report.template_type as TemplateType
      form.department = report.department || ''
      form.subject = report.subject
      form.actual_due_at = report.actual_due_at
        ? dayjs(report.actual_due_at).format('YYYY-MM-DDTHH:mm')
        : ''
      form.announced_due_at = report.announced_due_at
        ? dayjs(report.announced_due_at).format('YYYY-MM-DDTHH:mm')
        : ''
      form.importance_flag = report.importance_flag || false
      form.status = report.status as ReportStatus
      form.remarks = report.remarks || ''
      // @ts-expect-error - Assuming relational structure
      form.tags = report.report_tags?.map((rt) => rt.tags?.name || '').filter(Boolean) || []

      // Load items
      items.value = reportItems.map((item: ReportItem) => ({
        ...item,
        isCustomizable: true,
      }))

      // Set template and tab based on data
      if (form.template_type === 'announcement') {
        activeTab.value = 'announcement'
      } else if (form.template_type === 'general') {
        activeTab.value = 'general'
      } else {
        currentTemplate.value = form.template_type as TemplateType
        activeTab.value = 'template'
      }
    } finally {
      setTimeout(() => {
        isInitializing.value = false
      }, 0)
    }
  }
})

// 當「實際截止時間」完成輸入時，若「對外期限」為空，自動預設為前一個工作日 (跳過週六、週日)
const handleActualDueChange = () => {
  if (isInitializing.value) return

  if (form.actual_due_at && !form.announced_due_at) {
    let targetDate = dayjs(form.actual_due_at).subtract(1, 'day')

    while (targetDate.day() === 0 || targetDate.day() === 6) {
      targetDate = targetDate.subtract(1, 'day')
    }

    form.announced_due_at = targetDate.format('YYYY-MM-DDTHH:mm')
  }
}

const isSubmitting = ref(false)
const showPreview = ref(true)

const handleCopyAndSave = async () => {
  if (!form.subject) return alert('請填寫案由')
  if (!authStore.user) return alert('請先登入')

  isSubmitting.value = true
  try {
    await navigator.clipboard.writeText(previewText.value)

    const reportData: ReportInsert = {
      ...form,
      user_id: authStore.user.id,
      formatted_content: previewText.value,
      status: form.status,
      department: form.department || null,
      remarks: form.remarks || null,
      actual_due_at: form.actual_due_at ? dayjs.tz(form.actual_due_at).toISOString() : null,
      announced_due_at: form.announced_due_at
        ? dayjs.tz(form.announced_due_at).toISOString()
        : null,
    }

    let reportId = currentReportId.value
    if (reportId) {
      await reportStore.updateReport(reportId, reportData)
      await reportStore.deleteReportItems(reportId)
      await reportStore.deleteReportTags(reportId)
    } else {
      const savedReport = await reportStore.createReport(reportData)
      if (!savedReport) throw new Error('Failed to create report')
      reportId = savedReport.id
      currentReportId.value = reportId
    }

    // Persist Tags
    if (form.tags.length > 0) {
      const persistedTags = await reportStore.upsertTags(form.tags)
      const reportTags = persistedTags.map((tag) => ({
        report_id: reportId!,
        tag_id: tag.id,
      }))
      await reportStore.createReportTags(reportTags)
    }

    const reportItems: ReportItemInsert[] = items.value
      .filter((i) => i.content && i.content.trim() !== '')
      .map((i, index) => ({
        item_type: (i.item_type || 'detail') as
          | 'submission_method'
          | 'detail'
          | 'note'
          | 'agenda'
          | 'link'
          | 'meeting_time',
        content: i.content || '',
        sort_order: index + 1,
        report_id: reportId!,
      }))

    if (reportItems.length > 0) {
      await reportStore.createReportItems(reportItems)
    }

    alert(
      currentReportId.value
        ? '已複製通報文字，並同步更新資料庫！'
        : '已複製通報文字，並成功建立案件！'
    )
  } catch (error) {
    console.error('Failed to save:', error)
    alert('發生錯誤，請稍後再試')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-8 pb-20">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <div>
          <h2 class="text-3xl font-extrabold tracking-tightest text-cream-text">
            {{ currentReportId ? '編輯案件' : '建立新通報' }}
          </h2>
          <p class="text-cream-muted text-sm mt-1">
            {{
              currentReportId
                ? '修改案件資訊並更新 LINE 格式'
                : '選擇模式並填寫資訊，系統將自動產生 LINE 格式'
            }}
          </p>
        </div>
        <RouterLink
          v-if="currentReportId"
          :to="{ name: 'report-detail', params: { id: currentReportId } }"
          class="flex items-center gap-1.5 px-3 py-1.5 bg-cream-surface border border-cream-border rounded-lg text-xs font-bold text-cream-muted hover:text-brand hover:border-brand transition-all"
        >
          <EyeIcon class="size-4" />
          查看案件
        </RouterLink>
      </div>
      <div class="flex bg-cream-surface p-1 rounded-xl border border-cream-border">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="updateMode(tab.id)"
          class="px-4 py-2 text-sm font-bold rounded-lg transition-all"
          :class="
            activeTab === tab.id
              ? 'bg-cream-bg text-brand shadow-sm'
              : 'text-cream-muted hover:text-cream-text'
          "
        >
          {{ tab.name }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Form Section -->
      <div class="lg:col-span-7 space-y-6">
        <!-- Template Selection (Only for Template Mode) -->
        <section
          v-if="activeTab === 'template'"
          class="bg-cream-surface border border-cream-border rounded-2xl p-6"
        >
          <label class="block text-xs font-bold text-cream-muted uppercase tracking-widest mb-3"
            >選擇具體模板</label
          >
          <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <button
              v-for="tmpl in ['meeting', 'weekly_report', 'briefing', 'task'] as const"
              :key="tmpl"
              @click="applyTemplate(tmpl)"
              class="px-4 py-3 text-sm font-bold border-2 rounded-xl transition-all"
              :class="
                currentTemplate === tmpl
                  ? 'border-brand bg-brand/5 text-brand'
                  : 'border-cream-border text-cream-muted hover:border-cream-muted'
              "
            >
              {{
                tmpl === 'meeting'
                  ? '處務會議'
                  : tmpl === 'weekly_report'
                    ? '市長週報'
                    : tmpl === 'briefing'
                      ? '市長面報'
                      : '臨時任務'
              }}
            </button>
          </div>
        </section>

        <!-- Basic Info -->
        <section class="bg-cream-surface border border-cream-border rounded-2xl p-6 space-y-4">
          <h3
            class="text-xs font-bold text-cream-muted uppercase tracking-widest border-b border-cream-border pb-2"
          >
            基本資訊
          </h3>

          <div class="space-y-4 pt-2">
            <div>
              <label class="block text-xs font-bold text-cream-text uppercase tracking-wider mb-2"
                >案由 / 標題 (必填)</label
              >
              <input
                v-model="form.subject"
                type="text"
                class="w-full bg-cream-bg border border-cream-border rounded-xl px-4 py-3 text-cream-text focus:ring-2 focus:ring-brand focus:outline-none"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-cream-text uppercase tracking-wider mb-2"
                >標籤 (多選 / 可自行輸入)</label
              >
              <div class="flex flex-wrap gap-2 items-center">
                <!-- 預設標籤 -->
                <button
                  v-for="tag in commonTags"
                  :key="tag"
                  @click="toggleTag(tag)"
                  type="button"
                  class="px-3 py-1.5 rounded-lg border text-xs font-bold transition-all"
                  :class="
                    form.tags.includes(tag)
                      ? 'bg-brand/20 text-brand border-brand'
                      : 'bg-cream-bg text-cream-muted border-cream-border hover:border-brand'
                  "
                >
                  {{ tag }}
                </button>

                <!-- 已加入但不在預設清單中的自定義標籤 -->
                <button
                  v-for="tag in form.tags.filter((t) => !commonTags.includes(t))"
                  :key="tag"
                  @click="toggleTag(tag)"
                  type="button"
                  class="px-3 py-1.5 rounded-lg border-2 border-dashed border-brand/40 bg-brand/5 text-brand text-xs font-bold transition-all flex items-center gap-1"
                >
                  {{ tag }}
                  <span class="text-[10px] opacity-50">×</span>
                </button>

                <!-- 自定義輸入框 -->
                <div class="relative min-w-[120px]">
                  <input
                    v-model="customTagInput"
                    @keydown.enter.prevent="handleAddCustomTag"
                    type="text"
                    placeholder="+ 自定義標籤"
                    class="w-full bg-transparent border-b border-cream-border px-2 py-1 text-xs text-cream-text focus:border-brand focus:outline-none placeholder:text-cream-muted/50"
                  />
                </div>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-cream-text uppercase tracking-wider mb-2"
                >內部備註 (僅供內部追蹤，不顯示於通報)</label
              >
              <textarea
                v-model="form.remarks"
                rows="2"
                placeholder="例如：誰交了、催繳紀錄..."
                class="w-full bg-cream-bg border border-cream-border rounded-xl px-4 py-3 text-sm text-cream-text focus:ring-2 focus:ring-brand focus:outline-none"
              ></textarea>
            </div>

            <div v-if="activeTab !== 'announcement'" class="space-y-4 pt-2">
              <div v-if="activeTab === 'general'">
                <label class="block text-xs font-bold text-cream-text uppercase tracking-wider mb-2"
                  >通報單位</label
                >
                <input
                  v-model="form.department"
                  type="text"
                  class="w-full bg-cream-bg border border-cream-border rounded-xl px-4 py-3 text-cream-text focus:ring-2 focus:ring-brand focus:outline-none"
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    class="block text-xs font-bold text-cream-text uppercase tracking-wider mb-2"
                    >實際截止時間 (內控)</label
                  >
                  <input
                    v-model="form.actual_due_at"
                    @change="handleActualDueChange"
                    type="datetime-local"
                    class="w-full bg-cream-bg border border-cream-border rounded-xl px-4 py-3 text-cream-text focus:ring-2 focus:ring-brand focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    class="block text-xs font-bold text-cream-text uppercase tracking-wider mb-2"
                    >對外通報期限</label
                  >
                  <input
                    v-model="form.announced_due_at"
                    type="datetime-local"
                    class="w-full bg-cream-bg border border-cream-border rounded-xl px-4 py-3 text-cream-text focus:ring-2 focus:ring-brand focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2 pt-2">
              <input
                v-model="form.importance_flag"
                type="checkbox"
                id="importance"
                class="w-5 h-5 rounded border-cream-border text-brand focus:ring-brand cursor-pointer"
              />
              <label for="importance" class="text-sm font-bold text-status-overdue cursor-pointer"
                >標記為重要案件</label
              >
            </div>

            <div v-if="currentReportId" class="pt-4 border-t border-cream-border/50">
              <label class="block text-xs font-bold text-cream-text uppercase tracking-wider mb-3"
                >案件狀態</label
              >
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="status in [
                    'pending',
                    'completed',
                    'overdue',
                    'archived',
                  ] as ReportStatus[]"
                  :key="status"
                  @click="form.status = status"
                  type="button"
                  class="px-3 py-1.5 rounded-lg border text-xs font-bold transition-all uppercase tracking-widest"
                  :class="
                    form.status === status
                      ? 'bg-cream-text text-dark-text border-cream-text shadow-sm'
                      : 'bg-cream-bg text-cream-muted border-cream-border hover:border-cream-muted'
                  "
                >
                  {{ status }}
                </button>
              </div>
              <p class="text-[10px] text-cream-muted mt-2 italic">
                ※ 編輯模式下可手動調回「pending」以恢復追蹤
              </p>
            </div>
          </div>
        </section>

        <!-- Dynamic Items / Content -->
        <section class="bg-cream-surface border border-cream-border rounded-2xl p-6 space-y-4">
          <div class="flex justify-between items-center border-b border-cream-border pb-2">
            <h3 class="text-xs font-bold text-cream-muted uppercase tracking-widest">
              {{ activeTab === 'announcement' ? '公告內容' : '通報細節' }}
            </h3>
            <div v-if="activeTab === 'general'" class="flex gap-2">
              <button
                @click="addItem('submission_method')"
                class="flex items-center gap-1 text-[10px] font-bold text-brand bg-brand/10 px-2 py-1 rounded-md"
              >
                <PlusIcon class="size-3" />
                方式
              </button>
              <button
                @click="addItem('detail')"
                class="flex items-center gap-1 text-[10px] font-bold text-brand bg-brand/10 px-2 py-1 rounded-md"
              >
                <PlusIcon class="size-3" />
                說明
              </button>
              <button
                @click="addItem('note')"
                class="flex items-center gap-1 text-[10px] font-bold text-brand bg-brand/10 px-2 py-1 rounded-md"
              >
                <PlusIcon class="size-3" />
                備註
              </button>
            </div>
          </div>

          <div class="space-y-4 pt-2">
            <div
              v-for="{ item, originalIndex } in sortedItems"
              :key="originalIndex"
              class="space-y-1"
            >
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-bold text-cream-muted uppercase tracking-tighter">{{
                    getItemLabel(item.item_type!)
                  }}</span>
                  <button
                    v-if="item.isCustomizable"
                    @click="toggleDefault(item)"
                    class="text-[9px] px-1.5 py-0.5 rounded border font-bold transition-all"
                    :class="
                      useDefaultValue[`${currentTemplate}_${item.item_type}`]
                        ? 'bg-brand text-white border-brand'
                        : 'bg-cream-surface text-cream-muted border-cream-border'
                    "
                  >
                    {{
                      useDefaultValue[`${currentTemplate}_${item.item_type}`] ? '預設值' : '自定義'
                    }}
                  </button>
                </div>
                <button
                  v-if="
                    activeTab === 'general' ||
                    (activeTab === 'template' && item.item_type === 'note')
                  "
                  @click="removeItem(originalIndex)"
                  class="text-status-overdue p-1 hover:bg-rose-50 rounded-md transition-colors"
                  title="刪除項目"
                >
                  <TrashIcon class="size-4" />
                </button>
              </div>

              <textarea
                v-if="item.item_type === 'detail' || item.item_type === 'agenda'"
                v-model="item.content"
                rows="4"
                class="w-full bg-cream-bg border border-cream-border rounded-xl px-4 py-2 text-sm text-cream-text focus:ring-1 focus:ring-brand focus:outline-none"
              ></textarea>
              <input
                v-else
                v-model="item.content"
                type="text"
                :readonly="
                  item.isCustomizable && useDefaultValue[`${currentTemplate}_${item.item_type}`]
                "
                class="w-full bg-cream-bg border border-cream-border rounded-xl px-4 py-2 text-sm text-cream-text focus:ring-1 focus:ring-brand focus:outline-none"
                :class="{
                  'opacity-60 cursor-not-allowed bg-cream-surface':
                    item.isCustomizable && useDefaultValue[`${currentTemplate}_${item.item_type}`],
                }"
              />
              <div
                v-if="item.item_type === 'submission_method'"
                class="flex flex-wrap gap-1.5 mt-2"
              >
                <button
                  v-for="opt in ['紙本核章', '線上表單', '檔案回傳']"
                  :key="opt"
                  @click="item.content = opt"
                  class="text-[9px] px-2 py-0.5 rounded-full border transition-all font-bold"
                  :class="
                    item.content === opt
                      ? 'bg-brand/20 text-brand border-brand'
                      : 'bg-cream-bg text-cream-muted border-cream-border hover:border-cream-muted'
                  "
                >
                  {{ opt }}
                </button>
              </div>
            </div>

            <button
              v-if="activeTab === 'template'"
              @click="addItem('note')"
              class="w-full py-2 border-2 border-dashed border-cream-border rounded-xl text-xs font-bold text-cream-muted hover:border-brand hover:text-brand transition-all flex items-center justify-center gap-2"
            >
              <PlusIcon class="size-4" />
              增加自定義備註
            </button>
          </div>
        </section>

        <button
          @click="handleCopyAndSave"
          :disabled="isSubmitting"
          class="w-full bg-cream-text text-dark-text py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-xl shadow-cream-text/10 disabled:opacity-50 flex items-center justify-center gap-3"
        >
          <DocumentTextIcon v-if="!isSubmitting" class="size-6" />
          <ArrowPathIcon v-else class="size-6 animate-spin" />
          {{
            isSubmitting
              ? '處理中...'
              : currentReportId
                ? '產生通報文字並儲存變更'
                : '產生通報文字並建立案件'
          }}
        </button>
      </div>

      <!-- Preview Section -->
      <div class="lg:col-span-5">
        <div class="sticky top-24 space-y-4">
          <div class="flex justify-between items-center">
            <h3 class="text-xs font-bold text-cream-muted uppercase tracking-widest">
              LINE 預覽效果
            </h3>
            <button
              @click="showPreview = !showPreview"
              class="text-[10px] font-bold text-brand hover:underline"
            >
              {{ showPreview ? '隱藏' : '顯示' }}
            </button>
          </div>

          <div v-if="showPreview" class="relative">
            <div class="absolute -top-2 -left-2 w-4 h-4 bg-brand rotate-45 rounded-sm"></div>
            <div
              class="bg-cream-surface rounded-2xl p-6 font-mono text-sm whitespace-pre-wrap break-words overflow-hidden border border-cream-border shadow-sm min-h-[400px]"
            >
              {{ previewText }}
            </div>
          </div>

          <p class="text-[10px] text-cream-muted text-center italic">
            ※ 點擊「產生」按鈕後將自動複製以上文字至剪貼簿
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
