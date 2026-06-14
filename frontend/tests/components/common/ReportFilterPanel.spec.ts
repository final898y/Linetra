import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ReportFilterPanel from '@/components/common/ReportFilterPanel.vue'

vi.mock('@/stores/reports', () => ({
  useReportStore: () => ({
    allUniqueTags: ['A', 'B', 'C', 'D', 'E', 'F'],
    topTags: ['A', 'B']
  })
}))

vi.mock('@/composables/useReportFilters', () => ({
  useReportFilters: () => ({
    selectedStatuses: [],
    selectedTemplateTypes: [],
    selectedTags: [],
    toggleStatus: vi.fn(),
    toggleTemplateType: vi.fn(),
    toggleTag: vi.fn(),
    clearFilters: vi.fn(),
  }),
}))

describe('ReportFilterPanel.vue', () => {
  it('should render popular tags and searchable input', () => {
    const wrapper = mount(ReportFilterPanel)

    expect(wrapper.text()).toContain('常用標籤')
    expect(wrapper.text()).toContain('A')
    expect(wrapper.text()).toContain('B')
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
  })

  it('should filter tags based on search query', async () => {
    const wrapper = mount(ReportFilterPanel)

    const input = wrapper.find('input[type="text"]')
    await input.setValue('A')
    
    expect(wrapper.text()).toContain('A')
    expect(wrapper.text()).not.toContain('B')
  })
})
