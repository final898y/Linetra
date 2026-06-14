import { ref, computed, watch } from 'vue'
import type { ReportStatus, TemplateType } from '@/types/models'

export interface FilterOptions {
  statuses: ReportStatus[]
  templateTypes: TemplateType[]
  tags: string[]
  sortOrder: 'asc' | 'desc'
  hideAnnouncements: boolean
  hideCompleted: boolean
}

// 從 localStorage 載入初始值
const STORAGE_KEY_STATUS = 'linetra_filter_statuses'
const STORAGE_KEY_TEMPLATE = 'linetra_filter_templates'
const STORAGE_KEY_TAGS = 'linetra_filter_tags'
const STORAGE_KEY_SORT = 'linetra_filter_sort'
const STORAGE_KEY_HIDE_ANNOUNCEMENTS = 'linetra_filter_hide_announcements'
const STORAGE_KEY_HIDE_COMPLETED = 'linetra_filter_hide_completed'

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(key)
  if (!stored) return defaultValue
  try {
    return JSON.parse(stored) as T
  } catch (e) {
    console.error(`Failed to parse filter storage for ${key}`, e)
    return defaultValue
  }
}

const selectedStatuses = ref<ReportStatus[]>(loadFromStorage(STORAGE_KEY_STATUS, []))
const selectedTemplateTypes = ref<TemplateType[]>(loadFromStorage(STORAGE_KEY_TEMPLATE, []))
const selectedTags = ref<string[]>(loadFromStorage(STORAGE_KEY_TAGS, []))
const sortOrder = ref<'asc' | 'desc'>(loadFromStorage(STORAGE_KEY_SORT, 'asc'))
const hideAnnouncements = ref<boolean>(loadFromStorage(STORAGE_KEY_HIDE_ANNOUNCEMENTS, false))
const hideCompleted = ref<boolean>(loadFromStorage(STORAGE_KEY_HIDE_COMPLETED, false))

// 監聽變動並存入 localStorage
watch(
  selectedStatuses,
  (newVal) => {
    localStorage.setItem(STORAGE_KEY_STATUS, JSON.stringify(newVal))
  },
  { deep: true }
)

watch(
  selectedTemplateTypes,
  (newVal) => {
    localStorage.setItem(STORAGE_KEY_TEMPLATE, JSON.stringify(newVal))
  },
  { deep: true }
)

watch(
  selectedTags,
  (newVal) => {
    localStorage.setItem(STORAGE_KEY_TAGS, JSON.stringify(newVal))
  },
  { deep: true }
)

watch(sortOrder, (newVal) => {
  localStorage.setItem(STORAGE_KEY_SORT, JSON.stringify(newVal))
})

watch(hideAnnouncements, (newVal) => {
  localStorage.setItem(STORAGE_KEY_HIDE_ANNOUNCEMENTS, JSON.stringify(newVal))
})

watch(hideCompleted, (newVal) => {
  localStorage.setItem(STORAGE_KEY_HIDE_COMPLETED, JSON.stringify(newVal))
})

export const useReportFilters = () => {
  // ... toggle functions ...
  const toggleStatus = (status: ReportStatus) => {
    const index = selectedStatuses.value.indexOf(status)
    if (index === -1) {
      selectedStatuses.value.push(status)
    } else {
      selectedStatuses.value.splice(index, 1)
    }
  }

  const toggleTemplateType = (type: TemplateType) => {
    const index = selectedTemplateTypes.value.indexOf(type)
    if (index === -1) {
      selectedTemplateTypes.value.push(type)
    } else {
      selectedTemplateTypes.value.splice(index, 1)
    }
  }

  const toggleTag = (tag: string) => {
    const index = selectedTags.value.indexOf(tag)
    if (index === -1) {
      selectedTags.value.push(tag)
    } else {
      selectedTags.value.splice(index, 1)
    }
  }

  const clearFilters = () => {
    selectedStatuses.value = []
    selectedTemplateTypes.value = []
    selectedTags.value = []
    sortOrder.value = 'asc'
    hideAnnouncements.value = false
    hideCompleted.value = false
  }

  const filterOptions = computed<FilterOptions>(() => ({
    statuses: selectedStatuses.value,
    templateTypes: selectedTemplateTypes.value,
    tags: selectedTags.value,
    sortOrder: sortOrder.value,
    hideAnnouncements: hideAnnouncements.value,
    hideCompleted: hideCompleted.value,
  }))

  return {
    selectedStatuses,
    selectedTemplateTypes,
    selectedTags,
    sortOrder,
    hideAnnouncements,
    hideCompleted,
    toggleStatus,
    toggleTemplateType,
    toggleTag,
    clearFilters,
    filterOptions,
  }
}
