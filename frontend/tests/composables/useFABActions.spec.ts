import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useFABActions } from '@/composables/useFABActions'

const state = vi.hoisted(() => ({
  addEvent: vi.fn(),
  currentReport: null as {
    template_type: string
    subject: string
    formatted_content: string | null
    announced_due_at: string | null
    actual_due_at: string | null
  } | null,
  currentItems: [] as { item_type: string; content: string }[],
}))

vi.mock('vue-router', () => ({
  useRoute: () => ({ name: 'report-detail' }),
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/stores/reports', () => ({
  useReportStore: () => ({
    currentReport: state.currentReport,
    currentItems: state.currentItems,
  }),
}))

vi.mock('@/composables/useGoogleCalendar', () => ({
  useGoogleCalendar: () => ({ addEvent: state.addEvent }),
}))

describe('useFABActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('alert', vi.fn())
    vi.stubEnv('VITE_GOOGLE_CALENDAR_CLIENT_ID', 'client-id')
  })

  it('uses general meeting start and end times for Google Calendar', () => {
    state.currentReport = {
      template_type: 'meeting_simple',
      subject: '專案會議',
      formatted_content: '會議內容',
      announced_due_at: null,
      actual_due_at: null,
    }
    state.currentItems = [
      { item_type: 'meeting_time', content: '2026-08-05T10:00' },
      { item_type: 'meeting_end_time', content: '2026-08-05T11:30' },
    ]

    const { actions } = useFABActions()
    actions.value.find((action) => action.label === '加入 Google 日曆')?.handler()

    expect(state.addEvent).toHaveBeenCalledWith(expect.any(String), {
      summary: '專案會議',
      description: '會議內容',
      startAt: '2026-08-05T10:00',
      endAt: '2026-08-05T11:30',
      allDay: false,
    })
  })
})
