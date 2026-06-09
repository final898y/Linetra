import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useReportStore } from '@/stores/reports'
import { supabase } from '@/api/supabase'

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
    const mockData = [{ id: '1', subject: 'Test' }]
    
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      // @ts-ignore
      then: (fn) => fn({ data: mockData, error: null })
    } as any)

    await store.fetchReports()
    expect(store.reports).toEqual(mockData)
  })

  it('should update report status', async () => {
    const store = useReportStore()
    store.reports = [{ id: '1', status: 'pending' }] as any

    vi.mocked(supabase.from).mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null })
    } as any)

    await store.updateStatus('1', 'completed')
    expect(store.reports[0].status).toBe('completed')
  })
})
