import { ref, computed } from 'vue'
import type { ReportStatus, TemplateType } from '@/types/models'

export interface FilterOptions {
  statuses: ReportStatus[]
  templateTypes: TemplateType[]
}

export const useReportFilters = () => {
  const selectedStatuses = ref<ReportStatus[]>([])
  const selectedTemplateTypes = ref<TemplateType[]>([])

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
