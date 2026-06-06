<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useReportStore } from '@/stores/reports'
import { useAuthStore } from '@/stores/auth'
import { useReportTemplate } from '@/composables/useReportTemplate'

const router = useRouter()
const reportStore = useReportStore()
const authStore = useAuthStore()
const { generateLineText } = useReportTemplate()

const form = reactive({
  template_type: 'general' as const,
  department: '',
  subject: '',
  actual_due_at: '',
  announced_due_at: '',
  importance_flag: false,
})

const items = ref([
  { item_type: 'submission_method' as const, content: '', sort_order: 1 },
  { item_type: 'detail' as const, content: '', sort_order: 1 },
])

const addItem = (type: 'submission_method' | 'detail' | 'note') => {
  items.value.push({
    item_type: type,
    content: '',
    sort_order: items.value.filter((i) => i.item_type === type).length + 1,
  })
}

const removeItem = (index: number) => {
  items.value.splice(index, 1)
}

const previewText = computed(() => {
  return generateLineText(form, items.value)
})

const isSubmitting = ref(false)
const showPreview = ref(false)

const handleCopyAndSave = async () => {
  if (!form.subject) return alert('請填寫案由')

  isSubmitting.value = true
  try {
    // 1. Copy to clipboard
    await navigator.clipboard.writeText(previewText.value)

    // 2. Save to Supabase
    const reportData = {
      ...form,
      user_id: authStore.user?.id,
      formatted_content: previewText.value,
      status: 'pending',
    }

    const savedReport = await reportStore.createReport(reportData)

    // 3. Save Items
    const reportItems = items.value
      .filter((i) => i.content.trim() !== '')
      .map((i) => ({
        ...i,
        report_id: savedReport.id,
      }))

    if (reportItems.length > 0) {
      await reportStore.createReportItems(reportItems)
    }

    alert('已複製並儲存成功！')
    router.push('/')
  } catch (error) {
    console.error('Failed to save:', error)
    alert('發生錯誤，請稍後再試')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-8 pb-20">
    <div class="flex justify-between items-center">
      <h2 class="text-3xl font-extrabold tracking-tightest text-cream-text">建立新通報</h2>
      <div class="flex gap-4">
        <button
          @click="showPreview = !showPreview"
          class="text-sm font-bold text-brand hover:underline"
        >
          {{ showPreview ? '隱藏預覽' : '顯示預覽' }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <!-- Form Section -->
      <div class="space-y-6">
        <section class="bg-cream-surface border border-cream-border rounded-2xl p-6 space-y-4">
          <h3
            class="text-xs font-bold text-cream-muted uppercase tracking-widest border-b border-cream-border pb-2"
          >
            基本資訊
          </h3>

          <div class="space-y-4 pt-2">
            <div>
              <label class="block text-xs font-bold text-cream-text uppercase tracking-wider mb-2"
                >案由 (必填)</label
              >
              <input
                v-model="form.subject"
                type="text"
                placeholder="例如：本週處務會議資料填報"
                class="w-full bg-cream-bg border border-cream-border rounded-xl px-4 py-3 text-cream-text focus:ring-2 focus:ring-brand focus:outline-none"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-cream-text uppercase tracking-wider mb-2"
                >通報單位</label
              >
              <input
                v-model="form.department"
                type="text"
                placeholder="例如：主計處"
                class="w-full bg-cream-bg border border-cream-border rounded-xl px-4 py-3 text-cream-text focus:ring-2 focus:ring-brand focus:outline-none"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-cream-text uppercase tracking-wider mb-2"
                  >公告期限</label
                >
                <input
                  v-model="form.announced_due_at"
                  type="datetime-local"
                  class="w-full bg-cream-bg border border-cream-border rounded-xl px-4 py-3 text-cream-text focus:ring-2 focus:ring-brand focus:outline-none"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-cream-text uppercase tracking-wider mb-2"
                  >真實截止</label
                >
                <input
                  v-model="form.actual_due_at"
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
                class="w-5 h-5 rounded border-cream-border text-brand focus:ring-brand"
              />
              <label for="importance" class="text-sm font-bold text-status-overdue"
                >標記為重要案件 (@All)</label
              >
            </div>
          </div>
        </section>

        <!-- Dynamic Items -->
        <section class="bg-cream-surface border border-cream-border rounded-2xl p-6 space-y-4">
          <div class="flex justify-between items-center border-b border-cream-border pb-2">
            <h3 class="text-xs font-bold text-cream-muted uppercase tracking-widest">
              通報內容項目
            </h3>
            <div class="flex gap-2">
              <button
                @click="addItem('submission_method')"
                class="text-[10px] font-bold text-brand bg-brand/10 px-2 py-1 rounded-md"
              >
                + 繳交方式
              </button>
              <button
                @click="addItem('detail')"
                class="text-[10px] font-bold text-brand bg-brand/10 px-2 py-1 rounded-md"
              >
                + 詳細說明
              </button>
            </div>
          </div>

          <div class="space-y-4 pt-2">
            <div v-for="(item, index) in items" :key="index" class="flex gap-2 items-start">
              <div class="flex-1">
                <span
                  class="text-[10px] font-bold text-cream-muted uppercase tracking-tighter mb-1 block"
                >
                  {{ item.item_type === 'submission_method' ? '繳交方式' : '詳細說明' }}
                </span>
                <input
                  v-model="item.content"
                  type="text"
                  class="w-full bg-cream-bg border border-cream-border rounded-xl px-4 py-2 text-sm text-cream-text focus:ring-1 focus:ring-brand focus:outline-none"
                />
              </div>
              <button
                @click="removeItem(index)"
                class="mt-5 text-cream-muted hover:text-status-overdue"
              >
                ×
              </button>
            </div>
          </div>
        </section>

        <button
          @click="handleCopyAndSave"
          :disabled="isSubmitting"
          class="w-full bg-cream-text text-dark-text py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-xl shadow-cream-text/10 disabled:opacity-50"
        >
          {{ isSubmitting ? '處理中...' : '複製通報並建立案件' }}
        </button>
      </div>

      <!-- Preview Section -->
      <div v-if="showPreview" class="sticky top-24 h-fit">
        <h3 class="text-xs font-bold text-cream-muted uppercase tracking-widest mb-4">
          LINE 預覽效果
        </h3>
        <div
          class="bg-[#F0F2F5] rounded-2xl p-6 font-mono text-sm whitespace-pre-wrap border border-cream-border shadow-inner"
        >
          {{ previewText }}
        </div>
        <p class="mt-4 text-[10px] text-cream-muted text-center italic">
          ※ 點擊按鈕後將自動複製以上文字至剪貼簿
        </p>
      </div>
    </div>
  </div>
</template>
