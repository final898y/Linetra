import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useReportStore } from '@/stores/reports'
import { supabase } from '@/api/supabase'
import type { Report } from '@/types/models'

// Mock Supabase
vi.mock('@/api/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  }
}))

describe('ReportStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should fetch reports', async () => {
    const store = useReportStore()
    const mockData: Report[] = [{ id: '1', subject: 'Test', user_id: 'u1', status: 'pending', template_type: 'general', created_at: '2026-06-09T00:00:00Z', updated_at: '2026-06-09T00:00:00Z' } as Report]

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      then: (fn: (res: { data: Report[], error: null }) => void) => fn({ data: mockData, error: null })
    } as unknown as ReturnType<typeof supabase.from>)

    await store.fetchReports()
    expect(store.reports).toEqual(mockData)
  })

  it('should update report status', async () => {
    const store = useReportStore()
    store.reports = [{ id: '1', status: 'pending' } as Report]

    vi.mocked(supabase.from).mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null })
    } as unknown as ReturnType<typeof supabase.from>)

    await store.updateStatus('1', 'completed')
    expect(store.reports[0].status).toBe('completed')
  })
})
