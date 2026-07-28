import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import type { Report, ReportItem } from '@/types/models'
import ReportDetailView from '@/views/ReportDetailView.vue'

const mockReport: Report = {
  id: 'report-1',
  user_id: 'user-1',
  template_type: 'general',
  department: null,
  subject: '期限顯示測試',
  actual_due_at: '2026-08-01T09:00:00Z',
  announced_due_at: '2026-07-31T09:00:00Z',
  formatted_content: null,
  remarks: null,
  sent_at: null,
  importance_flag: false,
  status: 'pending',
  created_at: '2026-07-01T00:00:00Z',
  updated_at: '2026-07-01T00:00:00Z',
}

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: 'report-1' } }),
  useRouter: () => ({ back: vi.fn(), push: vi.fn() }),
}))

vi.mock('@/stores/reports', () => ({
  useReportStore: () => ({
    fetchReportById: vi.fn().mockResolvedValue(mockReport),
    fetchReportItemsById: vi.fn().mockResolvedValue([] as ReportItem[]),
    setCurrentReport: vi.fn(),
    setCurrentItems: vi.fn(),
    updateStatus: vi.fn(),
  }),
}))

vi.mock('@/composables/useTimeFormatter', () => ({
  useTimeFormatter: () => ({
    formatFull: vi.fn((date: string) => `日期 ${date}`),
    formatRelative: vi.fn((date: string) => `說明 ${date}`),
    getRemainingTimeColor: vi.fn(() => 'text-cream-text'),
  }),
}))

vi.mock('@/composables/useReportItemFormatter', () => ({
  useReportItemFormatter: () => ({ formatItemContent: vi.fn() }),
}))

describe('ReportDetailView.vue', () => {
  it('shows the absolute date and relative description for both deadlines', async () => {
    const wrapper = mount(ReportDetailView, {
      global: { stubs: { RouterLink: true } },
    })
    await flushPromises()

    expect(wrapper.text()).toContain('日期 2026-07-31T09:00:00Z')
    expect(wrapper.text()).toContain('說明 2026-07-31T09:00:00Z')
    expect(wrapper.text()).toContain('日期 2026-08-01T09:00:00Z')
    expect(wrapper.text()).toContain('說明 2026-08-01T09:00:00Z')
  })
})
