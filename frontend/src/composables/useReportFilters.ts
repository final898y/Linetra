import { ref, computed, watch } from 'vue'
import type { ReportStatus, TemplateType } from '@/types/models'

export interface FilterOptions {
  statuses: ReportStatus[]
  templateTypes: TemplateType[]
  sortOrder: 'asc' | 'desc'
  hideAnnouncements: boolean
}

// 從 localStorage 載入初始值
const STORAGE_KEY_STATUS = 'linetra_filter_statuses'
const STORAGE_KEY_TEMPLATE = 'linetra_filter_templates'
const STORAGE_KEY_SORT = 'linetra_filter_sort'
const STORAGE_KEY_HIDE_ANNOUNCEMENTS = 'linetra_filter_hide_announcements'

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
const sortOrder = ref<'asc' | 'desc'>(loadFromStorage(STORAGE_KEY_SORT, 'asc'))
const hideAnnouncements = ref<boolean>(loadFromStorage(STORAGE_KEY_HIDE_ANNOUNCEMENTS, false))

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

watch(sortOrder, (newVal) => {
  localStorage.setItem(STORAGE_KEY_SORT, JSON.stringify(newVal))
})

watch(hideAnnouncements, (newVal) => {
  localStorage.setItem(STORAGE_KEY_HIDE_ANNOUNCEMENTS, JSON.stringify(newVal))
})

export const useReportFilters = () => {
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

  const clearFilters = () => {
    selectedStatuses.value = []
    selectedTemplateTypes.value = []
    sortOrder.value = 'asc'
    hideAnnouncements.value = false
  }

  const filterOptions = computed<FilterOptions>(() => ({
    statuses: selectedStatuses.value,
    templateTypes: selectedTemplateTypes.value,
    sortOrder: sortOrder.value,
    hideAnnouncements: hideAnnouncements.value,
  }))

  return {
    selectedStatuses,
    selectedTemplateTypes,
    sortOrder,
    hideAnnouncements,
    toggleStatus,
    toggleTemplateType,
    clearFilters,
    filterOptions,
  }
}
