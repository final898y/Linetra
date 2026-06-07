<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useReportStore } from '@/stores/reports'
import { useAuthStore } from '@/stores/auth'
import { useReportTemplate } from '@/composables/useReportTemplate'
import { PlusIcon, TrashIcon, DocumentTextIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'

import { REPORT_TEMPLATES } from '@/config/reportTemplates'

import type { ReportItemInsert, ReportInsert, TemplateType, ReportItem } from '@/types/models'

const reportStore = useReportStore()
const authStore = useAuthStore()
const { generateLineText } = useReportTemplate()
const route = useRoute()

onMounted(async () => {
  const reportId = route.params.id as string
  if (reportId) {
    currentReportId.value = reportId
    const report = await reportStore.fetchReportById(reportId)
    const reportItems = await reportStore.fetchReportItemsById(reportId)

    // Load form data
    form.template_type = report.template_type as TemplateType
    form.department = report.department || ''
    form.subject = report.subject
    form.actual_due_at = report.actual_due_at ? report.actual_due_at.substring(0, 16) : ''
    form.announced_due_at = report.announced_due_at ? report.announced_due_at.substring(0, 16) : ''
    form.importance_flag = report.importance_flag || false

    // Load items
    items.value = reportItems.map((item: ReportItem) => ({
      ...item,
      isCustomizable: true,
    }))

    // Set active tab based on template type
    if (form.template_type === 'announcement') {
      activeTab.value = 'announcement'
    } else if (form.template_type === 'general') {
      activeTab.value = 'general'
    } else {
      activeTab.value = 'template'
      currentTemplate.value = form.template_type as TemplateType
    }
  }
})

// Tabs state
const tabs = [
  { id: 'general', name: '一般模式' },
  { id: 'template', name: '模板模式' },
  { id: 'announcement', name: '公告模式' },
] as const

const activeTab = ref<(typeof tabs)[number]['id']>('general')
const currentReportId = ref<string | null>(null)

// Template specific state
const currentTemplate = ref<TemplateType>('meeting')
const useDefaultValue = reactive<Record<string, boolean>>({}) // 追蹤哪些欄位使用預設值

const form = reactive({
  template_type: 'general' as TemplateType,
  department: '',
  subject: '',
  actual_due_at: '',
  announced_due_at: '',
  importance_flag: false,
})

const items = ref<Partial<ReportItemInsert & { isCustomizable?: boolean }>[]>([])

// 項目排序權重定義，確保 UI 與產出邏輯一致
const ITEM_ORDER_WEIGHTS: Record<string, number> = {
  submission_method: 10,
  detail: 20,
  meeting_time: 30,
  link: 40,
  agenda: 50,
  note: 100,
}

// 自動排序後的項目列表
const sortedItems = computed(() => {
  // 回傳包含原始索引的對象，以便刪除操作
  return [...items.value]
    .map((item, originalIndex) => ({ item, originalIndex }))
    .sort((a, b) => {
      const weightA = ITEM_ORDER_WEIGHTS[a.item.item_type || ''] || 999
      const weightB = ITEM_ORDER_WEIGHTS[b.item.item_type || ''] || 999
      return weightA - weightB
    })
})

// Default values and logic
const updateMode = (tabId: (typeof tabs)[number]['id']) => {
  activeTab.value = tabId
  currentReportId.value = null // 切換模式時重置，視為新案件
  if (tabId === 'general') {
    form.template_type = 'general'
    form.subject = ''
    items.value = [
      { item_type: 'submission_method', content: '紙本核章', sort_order: 1 },
      { item_type: 'detail', content: '', sort_order: 2 },
    ]
  } else if (tabId === 'template') {
    applyTemplate(currentTemplate.value)
  } else if (tabId === 'announcement') {
    form.template_type = 'announcement'
    form.subject = ''
    items.value = [{ item_type: 'detail', content: '', sort_order: 1 }]
  }
}

const applyTemplate = (type: TemplateType) => {
  const config = REPORT_TEMPLATES[type]
  if (!config) return

  form.template_type = type
  currentTemplate.value = type
  form.subject = config.defaultSubject

  items.value = config.items.map((item, idx) => {
    const key = `${type}_${item.item_type}`
    // 如果之前沒設過，預設為 true (使用預設值)
    if (useDefaultValue[key] === undefined) useDefaultValue[key] = true

    const savedCustomValue = localStorage.getItem(`custom_val_${key}`)

    return {
      ...item,
      content: useDefaultValue[key] ? item.content : savedCustomValue || item.content,
      sort_order: idx + 1,
    }
  })
}

// 切換預設/自定義
const toggleDefault = (item: Partial<ReportItemInsert & { isCustomizable?: boolean }>) => {
  const key = `${currentTemplate.value}_${item.item_type}`
  useDefaultValue[key] = !useDefaultValue[key]

  if (useDefaultValue[key]) {
    // 恢復預設
    const config = REPORT_TEMPLATES[currentTemplate.value]
    const original = config?.items.find((i) => i.item_type === item.item_type)
    if (original) item.content = original.content
  }
}

// 監聽 items 變化，自動儲存使用者的自定義內容
watch(
  items,
  (newItems) => {
    if (activeTab.value !== 'template') return
    const type = currentTemplate.value
    newItems.forEach((item) => {
      const key = `${type}_${item.item_type}`
      if (item.isCustomizable && !useDefaultValue[key]) {
        localStorage.setItem(`custom_val_${key}`, item.content || '')
      }
    })
  },
  { deep: true }
)

// Watchers
watch(
  activeTab,
  (newTab) => {
    updateMode(newTab)
  },
  { immediate: true }
)

watch(currentTemplate, (newType) => {
  if (activeTab.value === 'template') {
    applyTemplate(newType)
  }
})

const addItem = (type: ReportItemInsert['item_type']) => {
  items.value.push({
    item_type: type,
    content: '',
    sort_order: items.value.length + 1,
  })
}

const removeItem = (index: number) => {
  items.value.splice(index, 1)
}

const previewText = computed(() => {
  // For announcement, we might use a dedicated content field or combine items
  const reportData: Partial<ReportInsert> = { ...form }
  if (form.template_type === 'announcement') {
    reportData.formatted_content = items.value.find((i) => i.item_type === 'detail')?.content || ''
  }
  return generateLineText(reportData, items.value as ReportItemInsert[])
})

const isSubmitting = ref(false)
const showPreview = ref(true)

const handleCopyAndSave = async () => {
  if (!form.subject) return alert('請填寫案由')
  if (!authStore.user) return alert('請先登入')

  isSubmitting.value = true
  try {
    // 1. Copy to clipboard
    await navigator.clipboard.writeText(previewText.value)

    // 2. Save to Supabase
    const reportData: Partial<ReportInsert> = {
      ...form,
      user_id: authStore.user.id,
      formatted_content: previewText.value,
      status: 'pending',
      department: form.department || null,
      actual_due_at: form.actual_due_at || null,
      announced_due_at: form.announced_due_at || null,
    }

    let reportId = currentReportId.value
    if (reportId) {
      // Update existing report
      await reportStore.updateReport(reportId, reportData)
      // Clear old items
      await reportStore.deleteReportItems(reportId)
    } else {
      // Create new report
      const savedReport = await reportStore.createReport(reportData as ReportInsert)
      if (!savedReport) throw new Error('Failed to create report')
      reportId = savedReport.id
      currentReportId.value = reportId
    }

    // 3. Save Items
    const reportItems: ReportItemInsert[] = items.value
      .filter((i) => i.content && i.content.trim() !== '')
      .map((i, index) => ({
        item_type: (i.item_type || 'detail') as ReportItemInsert['item_type'],
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

const getItemLabel = (type: string) => {
  const labels: Record<string, string> = {
    submission_method: '繳交方式',
    detail: '內容說明',
    note: '備註項目',
    meeting_time: '會議時間',
    link: '雲端連結',
    agenda: '報告事項',
  }
  return labels[type] || '項目'
}
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-8 pb-20">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-3xl font-extrabold tracking-tightest text-cream-text">建立新通報</h2>
        <p class="text-cream-muted text-sm mt-1">選擇模式並填寫資訊，系統將自動產生 LINE 格式</p>
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
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              @click="currentTemplate = 'meeting'"
              class="px-4 py-3 text-sm font-bold border-2 rounded-xl transition-all"
              :class="
                currentTemplate === 'meeting'
                  ? 'border-brand bg-brand/5 text-brand'
                  : 'border-cream-border text-cream-muted hover:border-cream-muted'
              "
            >
              處務會議
            </button>
            <button
              @click="currentTemplate = 'weekly_report'"
              class="px-4 py-3 text-sm font-bold border-2 rounded-xl transition-all"
              :class="
                currentTemplate === 'weekly_report'
                  ? 'border-brand bg-brand/5 text-brand'
                  : 'border-cream-border text-cream-muted hover:border-cream-muted'
              "
            >
              市長週報
            </button>
            <button
              @click="currentTemplate = 'briefing'"
              class="px-4 py-3 text-sm font-bold border-2 rounded-xl transition-all"
              :class="
                currentTemplate === 'briefing'
                  ? 'border-brand bg-brand/5 text-brand'
                  : 'border-cream-border text-cream-muted hover:border-cream-muted'
              "
            >
              市長面報
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

            <div v-if="activeTab !== 'announcement'" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-cream-text uppercase tracking-wider mb-2"
                  >通報單位</label
                >
                <input
                  v-model="form.department"
                  type="text"
                  class="w-full bg-cream-bg border border-cream-border rounded-xl px-4 py-3 text-cream-text focus:ring-2 focus:ring-brand focus:outline-none"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-cream-text uppercase tracking-wider mb-2"
                  >繳交期限</label
                >
                <input
                  v-model="form.announced_due_at"
                  type="datetime-local"
                  class="w-full bg-cream-bg border border-cream-border rounded-xl px-4 py-3 text-cream-text focus:ring-2 focus:ring-brand focus:outline-none"
                />
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
                  <!-- 預設/自定義切換按鈕 -->
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

              <!-- 繳交方式快速選項 -->
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
          {{ isSubmitting ? '處理中...' : '產生通報文字並建立案件' }}
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
