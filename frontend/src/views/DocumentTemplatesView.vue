<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { DocumentTextIcon, PlusIcon, ArchiveBoxIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useKnowledgeStore } from '@/stores/knowledge'
import type { DocumentTemplate } from '@/types/models'

const authStore = useAuthStore()
const knowledgeStore = useKnowledgeStore()
const selectedId = ref<string | null>(null)
const showArchived = ref(false)
const isSaving = ref(false)
const form = reactive({ name: '', category: '', contentMarkdown: '' })

const visibleTemplates = computed(() =>
  knowledgeStore.templates.filter((template) => showArchived.value || template.is_active)
)
const selectedTemplate = computed(
  () => knowledgeStore.templates.find((template) => template.id === selectedId.value) || null
)
const selectedVersions = computed(() =>
  knowledgeStore.templateVersions
    .filter((version) => version.template_id === selectedId.value)
    .sort((a, b) => b.version_no - a.version_no)
)
const selectedVersionNo = computed(() => selectedVersions.value[0]?.version_no || 0)

const resetForm = () => {
  selectedId.value = null
  form.name = ''
  form.category = ''
  form.contentMarkdown = '# 公文範本\n\n請在此輸入 Markdown 內容。'
}

const selectTemplate = (template: DocumentTemplate) => {
  selectedId.value = template.id
  form.name = template.name
  form.category = template.category || ''
  form.contentMarkdown =
    knowledgeStore.latestTemplateVersion.get(template.id)?.content_markdown || ''
}

const saveTemplate = async () => {
  if (!authStore.user) return alert('請先登入')
  if (!form.name.trim() || !form.contentMarkdown.trim()) return alert('請填寫範本名稱與內容')

  isSaving.value = true
  try {
    if (selectedId.value) {
      await knowledgeStore.updateTemplate({
        id: selectedId.value,
        userId: authStore.user.id,
        name: form.name.trim(),
        category: form.category.trim() || null,
        contentMarkdown: form.contentMarkdown,
      })
      alert('範本已更新並建立新版本')
    } else {
      const created = await knowledgeStore.createTemplate({
        userId: authStore.user.id,
        name: form.name.trim(),
        category: form.category.trim() || null,
        contentMarkdown: form.contentMarkdown,
      })
      selectedId.value = created.id
      alert('範本已建立')
    }
  } catch (error) {
    console.error('Failed to save document template:', error)
    alert('儲存範本失敗，請稍後再試')
  } finally {
    isSaving.value = false
  }
}

const archiveTemplate = async () => {
  if (!selectedId.value || !confirm('確定要停用這個公文範本嗎？')) return
  try {
    await knowledgeStore.archiveTemplate(selectedId.value)
    alert('範本已停用')
  } catch (error) {
    console.error('Failed to archive document template:', error)
    alert('停用範本失敗，請稍後再試')
  }
}

onMounted(async () => {
  await knowledgeStore.fetchTemplates()
  resetForm()
})
</script>

<template>
  <div class="space-y-8 pb-20">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 class="text-3xl font-extrabold tracking-tightest text-cream-text">公文範本</h2>
        <p class="mt-1 text-sm font-bold uppercase tracking-widest text-cream-muted">
          個人 Markdown 範本與版本歷程
        </p>
      </div>
      <div class="flex gap-2">
        <button
          @click="showArchived = !showArchived"
          class="rounded-xl border border-cream-border bg-cream-surface px-3 py-2 text-xs font-bold text-cream-text hover:bg-cream-hover"
        >
          {{ showArchived ? '隱藏停用範本' : '顯示停用範本' }}
        </button>
        <button
          @click="resetForm"
          class="flex items-center gap-1.5 rounded-xl bg-brand px-3 py-2 text-xs font-bold text-white hover:bg-brand/90"
        >
          <PlusIcon class="size-4" /> 新增範本
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <section class="space-y-3 lg:col-span-4">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold uppercase tracking-widest text-cream-muted">範本清單</h3>
          <span class="text-xs font-bold text-cream-muted">{{ visibleTemplates.length }} 筆</span>
        </div>
        <div
          v-if="visibleTemplates.length === 0"
          class="rounded-2xl border border-dashed border-cream-border bg-cream-surface p-8 text-center text-sm text-cream-muted"
        >
          尚未建立公文範本
        </div>
        <button
          v-for="template in visibleTemplates"
          :key="template.id"
          @click="selectTemplate(template)"
          class="w-full rounded-2xl border p-4 text-left transition-all"
          :class="
            selectedId === template.id
              ? 'border-brand bg-brand/10 shadow-sm'
              : 'border-cream-border bg-cream-surface hover:bg-cream-hover'
          "
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="truncate font-bold text-cream-text">{{ template.name }}</p>
              <p class="mt-1 text-xs text-cream-muted">{{ template.category || '未分類' }}</p>
            </div>
            <span
              class="rounded-full px-2 py-0.5 text-[10px] font-bold"
              :class="
                template.is_active
                  ? 'bg-status-completed/10 text-status-completed'
                  : 'bg-cream-bg text-cream-muted'
              "
            >
              {{ template.is_active ? '啟用' : '停用' }}
            </span>
          </div>
        </button>
      </section>

      <section
        class="rounded-2xl border border-cream-border bg-cream-surface p-5 sm:p-6 lg:col-span-8"
      >
        <div class="mb-5 flex items-center gap-3 border-b border-cream-border pb-4">
          <div class="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <DocumentTextIcon class="size-5" />
          </div>
          <div>
            <h3 class="font-bold text-cream-text">{{ selectedId ? '編輯範本' : '建立範本' }}</h3>
            <p class="text-xs text-cream-muted">內容以 Markdown 保存，每次編輯都會建立新版本</p>
          </div>
        </div>

        <div class="space-y-4">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label class="text-xs font-bold text-cream-text">
              範本名稱
              <input
                v-model="form.name"
                type="text"
                placeholder="例如：會議通知公文"
                class="mt-2 w-full rounded-xl border border-cream-border bg-cream-bg px-4 py-3 text-cream-text focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </label>
            <label class="text-xs font-bold text-cream-text">
              分類
              <input
                v-model="form.category"
                type="text"
                placeholder="例如：會議、函文、簽呈"
                class="mt-2 w-full rounded-xl border border-cream-border bg-cream-bg px-4 py-3 text-cream-text focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </label>
          </div>

          <label class="block text-xs font-bold text-cream-text">
            Markdown 內容
            <textarea
              v-model="form.contentMarkdown"
              rows="14"
              class="mt-2 w-full rounded-xl border border-cream-border bg-cream-bg px-4 py-3 font-mono text-sm text-cream-text focus:outline-none focus:ring-2 focus:ring-brand"
            ></textarea>
          </label>

          <div class="rounded-xl border border-cream-border bg-cream-bg p-4">
            <p class="mb-2 text-[10px] font-bold uppercase tracking-widest text-cream-muted">
              Markdown 原文預覽
            </p>
            <pre class="whitespace-pre-wrap break-words text-sm text-cream-text">{{
              form.contentMarkdown
            }}</pre>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-3">
            <button
              v-if="selectedId && selectedTemplate?.is_active"
              @click="archiveTemplate"
              class="flex items-center gap-1.5 rounded-xl border border-status-overdue/30 px-3 py-2 text-xs font-bold text-status-overdue hover:bg-status-overdue/5"
            >
              <ArchiveBoxIcon class="size-4" /> 停用範本
            </button>
            <span v-else></span>
            <button
              @click="saveTemplate"
              :disabled="isSaving"
              class="rounded-xl bg-cream-text px-5 py-3 text-sm font-bold text-dark-text hover:opacity-90 disabled:opacity-50"
            >
              {{ isSaving ? '儲存中...' : selectedId ? '儲存並建立新版本' : '建立範本' }}
            </button>
          </div>

          <div v-if="selectedId" class="border-t border-cream-border pt-4">
            <p class="mb-2 text-[10px] font-bold uppercase tracking-widest text-cream-muted">
              版本歷程（目前 v{{ selectedVersionNo }}）
            </p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="version in selectedVersions"
                :key="version.id"
                class="rounded-lg border border-cream-border bg-cream-bg px-2 py-1 text-xs font-bold text-cream-muted"
              >
                v{{ version.version_no }} ·
                {{ new Date(version.created_at).toLocaleDateString('zh-TW') }}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
