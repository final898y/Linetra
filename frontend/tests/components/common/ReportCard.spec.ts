import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import ReportCard from '@/components/common/ReportCard.vue'
import type { Report } from '@/types/models'

// ... (rest of mocks)

vi.mock('@/composables/useTimeFormatter', () => ({
  useTimeFormatter: () => ({
    formatRelative: vi.fn(() => '明天(週三)'),
    formatFull: vi.fn(() => '2026/06/10 16:00'),
    getRemainingTimeColor: vi.fn(() => 'text-cream-text')
  })
}))

const mockUpdateStatus = vi.fn()
vi.mock('@/stores/reports', () => ({
  useReportStore: () => ({
    updateStatus: mockUpdateStatus
  })
}))

describe('ReportCard.vue', () => {
  setActivePinia(createPinia())

  // Mock window.alert and console.error
  if (typeof window.alert === 'undefined') {
    window.alert = vi.fn()
  }
  const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

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

  it('renders full time and relative time', () => {
    const wrapper = mount(ReportCard, {
      props: { report: mockReport }
    })
    expect(wrapper.text()).toContain('2026/06/10 16:00')
    expect(wrapper.text()).toContain('明天(週三)')
  })

  it('handles completion error gracefully', async () => {
    mockUpdateStatus.mockRejectedValueOnce(new Error('Update failed'))

    const wrapper = mount(ReportCard, {
      props: { report: mockReport }
    })

    const button = wrapper.find('button[title="標記完成"]')
    await button.trigger('click')
    await flushPromises()

    expect(consoleSpy).toHaveBeenCalled()
    expect(alertSpy).toHaveBeenCalledWith('更新狀態失敗，請稍後再試')
  })
})
