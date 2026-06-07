import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import ReportCard from '@/components/common/ReportCard.vue'
import type { Report } from '@/types/models'

// Mock composables and stores
vi.mock('@/composables/useTimeFormatter', () => ({
  useTimeFormatter: () => ({
    formatRelative: vi.fn(() => '2 days ago'),
    getRemainingTimeColor: vi.fn(() => 'text-cream-text')
  })
}))

vi.mock('@/stores/reports', () => ({
  useReportStore: () => ({
    updateStatus: vi.fn()
  })
}))

describe('ReportCard.vue', () => {
  setActivePinia(createPinia())

  const mockReport: Report = {
    id: '1',
    user_id: 'user1',
    template_type: 'general',
    department: 'HR',
    subject: 'Test Report',
    actual_due_at: '2026-06-07T12:00:00Z',
    announced_due_at: '2026-06-07T12:00:00Z',
    formatted_content: null,
    sent_at: null,
    importance_flag: false,
    status: 'pending',
    created_at: '2026-06-07T00:00:00Z',
    updated_at: '2026-06-07T00:00:00Z'
  }

  it('renders report subject', () => {
    const wrapper = mount(ReportCard, {
      props: { report: mockReport }
    })
    expect(wrapper.text()).toContain('Test Report')
  })

  it('renders department if provided', () => {
    const wrapper = mount(ReportCard, {
      props: { report: mockReport }
    })
    expect(wrapper.text()).toContain('HR')
  })
})
