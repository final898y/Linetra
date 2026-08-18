<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  ArchiveBoxIcon,
  LightBulbIcon,
  LinkIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useKnowledgeStore } from '@/stores/knowledge'
import type { KeyNoteCategory } from '@/types/models'

const authStore = useAuthStore()
const knowledgeStore = useKnowledgeStore()

const categories: Array<{ id: KeyNoteCategory; label: string }> = [
  { id: 'procedure', label: '作業流程' },
  { id: 'leader_instruction', label: '長官要求' },
  { id: 'reminder', label: '注意事項' },
  { id: 'website', label: '常用網站' },
]

const form = reactive({
  id: null as string | null,
  title: '',
  category: 'procedure' as KeyNoteCategory,
  content: '',
  isPinned: false,
  sortOrder: 0,
  validFrom: '',
  validUntil: '',
  links: [{ label: '', url: '' }],
})
const searchQuery = ref('')
const categoryFilter = ref<'all' | KeyNoteCategory>('all')
const showArchived = ref(false)
const isSaving = ref(false)

const visibleNotes = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return knowledgeStore.notes.filter((note) => {
    if (!showArchived.value && note.status === 'archived') return false
    if (categoryFilter.value !== 'all' && note.category !== categoryFilter.value) return false
    if (!query) return true
    return `${note.title} ${note.content}`.toLowerCase().includes(query)
  })
})

const selectedNote = computed(() => knowledgeStore.notes.find((note) => note.id === form.id))

function resetForm() {
  form.id = null
  form.title = ''
  form.category = 'procedure'
  form.content = ''
  form.isPinned = false
  form.sortOrder = 0
  form.validFrom = ''
  form.validUntil = ''
  form.links = [{ label: '', url: '' }]
}

function selectNote(note: (typeof knowledgeStore.notes)[number]) {
  form.id = note.id
  form.title = note.title
  form.category = note.category
  form.content = note.content
  form.isPinned = note.is_pinned
  form.sortOrder = note.sort_order
  form.validFrom = note.valid_from ?? ''
  form.validUntil = note.valid_until ?? ''
  const noteLinks = note.key_note_links ?? []
  form.links = noteLinks.length
    ? noteLinks.map((link) => ({ label: link.label, url: link.url }))
    : [{ label: '', url: '' }]
}

function addLink() {
  form.links.push({ label: '', url: '' })
}

function removeLink(index: number) {
  if (form.links.length === 1) return
  form.links.splice(index, 1)
}

async function saveNote() {
  if (!authStore.user?.id || !form.title.trim()) {
    window.alert('請填寫記事標題')
    return
  }
  const links = form.links
    .map((link, index) => ({ ...link, sortOrder: index }))
    .filter((link) => link.label.trim() && link.url.trim())
  if (links.some((link) => !/^https?:\/\//i.test(link.url.trim()))) {
    window.alert('網站連結必須以 http:// 或 https:// 開頭')
    return
  }
  isSaving.value = true
  try {
    const payload = {
      userId: authStore.user.id,
      title: form.title.trim(),
      category: form.category,
      content: form.content,
      isPinned: form.isPinned,
      sortOrder: form.sortOrder,
      validFrom: form.validFrom || null,
      validUntil: form.validUntil || null,
      links,
    }
    if (form.id) await knowledgeStore.updateNote({ id: form.id, ...payload })
    else await knowledgeStore.createNote(payload)
    window.alert('已儲存重點記事')
    resetForm()
  } catch (error) {
    console.error(error)
    window.alert('儲存失敗，請稍後再試')
  } finally {
    isSaving.value = false
  }
}

async function archiveNote() {
  if (!form.id || !window.confirm('確定要封存這則記事嗎？')) return
  await knowledgeStore.archiveNote(form.id)
  resetForm()
}

onMounted(() => knowledgeStore.fetchNotes(true))
</script>

<template>
  <div class="min-h-full bg-cream-bg p-4 md:p-6">
    <div class="mx-auto max-w-7xl space-y-4">
      <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-3">
          <div class="rounded-2xl bg-brand/10 p-3 text-brand">
            <LightBulbIcon class="h-7 w-7" />
          </div>
          <div>
            <h1 class="text-xl font-bold text-cream-text">重點記事</h1>
            <p class="text-sm text-cream-muted">記錄流程、要求、注意事項與常用網站</p>
          </div>
        </div>
        <button class="btn-primary flex items-center gap-2" @click="resetForm">
          <PlusIcon class="h-5 w-5" />新增記事
        </button>
      </header>

      <div class="flex flex-wrap gap-2">
        <input
          v-model="searchQuery"
          class="form-input mt-0 min-w-48 flex-1"
          placeholder="搜尋標題或內容"
        />
        <select v-model="categoryFilter" class="form-input mt-0 w-auto">
          <option value="all">全部分類</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.label }}
          </option>
        </select>
        <label
          class="flex items-center gap-2 rounded-xl border border-cream-border bg-cream-surface px-3 text-sm text-cream-muted"
          ><input v-model="showArchived" type="checkbox" />顯示封存</label
        >
      </div>

      <div class="grid gap-4 lg:grid-cols-12">
        <aside class="space-y-2 lg:col-span-4">
          <button
            v-for="note in visibleNotes"
            :key="note.id"
            class="w-full rounded-2xl border p-4 text-left transition"
            :class="
              form.id === note.id
                ? 'border-brand bg-brand/5'
                : 'border-cream-border bg-cream-surface hover:bg-cream-hover'
            "
            @click="selectNote(note)"
          >
            <div class="flex items-start justify-between gap-2">
              <h2 class="font-semibold text-cream-text">{{ note.title }}</h2>
              <span v-if="note.is_pinned" class="text-xs text-brand">置頂</span>
            </div>
            <p class="mt-1 text-xs text-cream-muted">
              {{ categories.find((item) => item.id === note.category)?.label }} ·
              {{ note.status === 'active' ? '生效中' : '已封存' }}
            </p>
            <p class="mt-2 line-clamp-2 text-sm text-cream-muted">
              {{ note.content || '（無文字內容）' }}
            </p>
          </button>
          <p
            v-if="!visibleNotes.length"
            class="rounded-2xl border border-dashed border-cream-border p-6 text-center text-sm text-cream-muted"
          >
            目前沒有符合條件的記事
          </p>
        </aside>

        <section
          class="rounded-2xl border border-cream-border bg-cream-surface p-4 shadow-sm sm:p-6 lg:col-span-8"
        >
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-lg font-bold text-cream-text">
              {{ form.id ? '編輯記事' : '建立記事' }}
            </h2>
            <button
              v-if="selectedNote && selectedNote.status === 'active'"
              class="btn-secondary flex items-center gap-2 text-red-600"
              @click="archiveNote"
            >
              <ArchiveBoxIcon class="h-5 w-5" />封存
            </button>
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <label class="sm:col-span-2"
              ><span class="form-label">標題</span
              ><input v-model="form.title" class="form-input" placeholder="例如：年度公文檢核流程"
            /></label>
            <label
              ><span class="form-label">分類</span
              ><select v-model="form.category" class="form-input">
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.label }}
                </option>
              </select></label
            >
            <label
              ><span class="form-label">排序</span
              ><input v-model.number="form.sortOrder" class="form-input" type="number" min="0"
            /></label>
            <label
              ><span class="form-label">生效日期（選填）</span
              ><input v-model="form.validFrom" class="form-input" type="date"
            /></label>
            <label
              ><span class="form-label">失效日期（選填）</span
              ><input v-model="form.validUntil" class="form-input" type="date"
            /></label>
            <label class="flex items-center gap-2 text-sm text-cream-text sm:col-span-2"
              ><input v-model="form.isPinned" type="checkbox" />置頂顯示</label
            >
            <label class="sm:col-span-2"
              ><span class="form-label">內容</span
              ><textarea
                v-model="form.content"
                class="form-input min-h-40"
                placeholder="補充流程、背景或注意事項"
              />
            </label>
          </div>

          <div class="mt-5 border-t border-cream-border pt-4">
            <div class="mb-2 flex items-center justify-between">
              <span class="form-label mb-0">網站連結（可多筆）</span
              ><button class="btn-secondary flex items-center gap-1" @click="addLink">
                <PlusIcon class="h-4 w-4" />新增連結
              </button>
            </div>
            <div
              v-for="(link, index) in form.links"
              :key="index"
              class="mb-2 flex flex-col gap-2 sm:flex-row"
            >
              <div class="relative flex-1">
                <LinkIcon class="absolute left-3 top-2.5 h-4 w-4 text-cream-muted" /><input
                  v-model="link.label"
                  class="form-input mt-0 w-full pl-9"
                  placeholder="連結名稱"
                />
              </div>
              <input
                v-model="link.url"
                class="form-input mt-0 flex-[2]"
                placeholder="https://example.com"
              /><button
                class="btn-secondary self-end p-2 text-red-600 sm:self-auto"
                :disabled="form.links.length === 1"
                @click="removeLink(index)"
              >
                <TrashIcon class="h-5 w-5" />
              </button>
            </div>
          </div>
          <div class="mt-5 flex justify-end">
            <button class="btn-primary" :disabled="isSaving" @click="saveNote">
              {{ isSaving ? '儲存中…' : '儲存記事' }}
            </button>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
