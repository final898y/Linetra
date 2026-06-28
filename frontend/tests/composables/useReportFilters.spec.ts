import { describe, it, expect, beforeEach } from 'vitest'
import { useReportFilters } from '@/composables/useReportFilters'

describe('useReportFilters', () => {
  beforeEach(() => {
    // Reset filters before each test
    const { clearFilters } = useReportFilters()
    clearFilters()
  })

  it('should toggle statuses correctly', () => {
    const { selectedStatuses, toggleStatus } = useReportFilters()
    toggleStatus('pending')
    expect(selectedStatuses.value).toContain('pending')
    toggleStatus('pending')
    expect(selectedStatuses.value).not.toContain('pending')
  })

  it('should toggle template types correctly', () => {
    const { selectedTemplateTypes, toggleTemplateType } = useReportFilters()
    toggleTemplateType('meeting')
    expect(selectedTemplateTypes.value).toContain('meeting')
    toggleTemplateType('meeting')
    expect(selectedTemplateTypes.value).not.toContain('meeting')
  })

  it('should clear all filters', () => {
    const { selectedStatuses, selectedTemplateTypes, keyword, toggleStatus, toggleTemplateType, clearFilters } = useReportFilters()
    toggleStatus('pending')
    toggleTemplateType('meeting')
    keyword.value = 'test-query'
    clearFilters()
    expect(selectedStatuses.value).toHaveLength(0)
    expect(selectedTemplateTypes.value).toHaveLength(0)
    expect(keyword.value).toBe('')
  })

  it('should reflect filter options in computed property', () => {
    const { toggleStatus, toggleTemplateType, keyword, filterOptions } = useReportFilters()
    toggleStatus('completed')
    toggleTemplateType('briefing')
    keyword.value = 'search-word'
    expect(filterOptions.value.statuses).toContain('completed')
    expect(filterOptions.value.templateTypes).toContain('briefing')
    expect(filterOptions.value.keyword).toBe('search-word')
  })
})
