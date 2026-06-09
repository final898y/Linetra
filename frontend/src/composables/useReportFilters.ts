import { ref, computed, watch } from 'vue'
import type { ReportStatus, TemplateType } from '@/types/models'

export interface FilterOptions {
  statuses: ReportStatus[]
  templateTypes: TemplateType[]
}

// 從 localStorage 載入初始值
const STORAGE_KEY_STATUS = 'linetra_filter_statuses'
const STORAGE_KEY_TEMPLATE = 'linetra_filter_templates'

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
  }

  const filterOptions = computed<FilterOptions>(() => ({
    statuses: selectedStatuses.value,
    templateTypes: selectedTemplateTypes.value,
  }))

  return {
    selectedStatuses,
    selectedTemplateTypes,
    toggleStatus,
    toggleTemplateType,
    clearFilters,
    filterOptions,
  }
}
