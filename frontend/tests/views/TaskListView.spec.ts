import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import TaskListView from '@/views/TaskListView.vue'

const mocks = vi.hoisted(() => ({
  reportStore: {
    reports: [
      { id: 'task-1', template_type: 'task', subject: '待完成任務', status: 'pending' },
      { id: 'task-2', template_type: 'task', subject: '已完成任務', status: 'completed' },
    ],
    loading: false,
    fetchReports: vi.fn().mockResolvedValue(undefined),
    createReport: vi.fn().mockResolvedValue({ id: 'task-3' }),
  },
  authStore: { user: { id: 'user-1' } },
  generateLineText: vi.fn().mockReturnValue('任務通報文字'),
}))

vi.mock('@/stores/reports', () => ({
  useReportStore: () => mocks.reportStore,
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => mocks.authStore,
}))

vi.mock('@/composables/useReportTemplate', () => ({
  useReportTemplate: () => ({ generateLineText: mocks.generateLineText }),
}))

describe('TaskListView.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('alert', vi.fn())
  })

  it('loads only pending and overdue task reports', async () => {
    const wrapper = mount(TaskListView, {
      global: { stubs: { RouterLink: true, ReportCard: true } },
    })
    await flushPromises()

    expect(mocks.reportStore.fetchReports).toHaveBeenCalledWith({
      statuses: ['pending', 'overdue'],
      templateTypes: ['task'],
      tags: [],
      sortOrder: 'asc',
      hideAnnouncements: true,
      hideCompleted: true,
    })
    expect(wrapper.text()).toContain('1 項')
  })

  it('creates a pending task with its deadline and internal note', async () => {
    const wrapper = mount(TaskListView, {
      global: { stubs: { RouterLink: true, ReportCard: true } },
    })
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('確認活動場地')
    await inputs[1].setValue('2026-08-03T10:30')
    await wrapper.find('textarea').setValue('請聯繫場地方')
    await wrapper.find('input[type="checkbox"]').setValue(true)
    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(mocks.reportStore.createReport).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-1',
        template_type: 'task',
        subject: '確認活動場地',
        remarks: '請聯繫場地方',
        importance_flag: true,
        status: 'pending',
        formatted_content: '任務通報文字',
        sent_at: expect.any(String),
        announced_due_at: expect.any(String),
      })
    )
  })
})
