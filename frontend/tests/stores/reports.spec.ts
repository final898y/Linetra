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

  it('should group reports by date correctly in reportsByDate', () => {
    const store = useReportStore()
    const report1 = { id: '1', announced_due_at: '2026-06-10T10:00:00Z', subject: 'Report 1' } as Report
    const report2 = { id: '2', announced_due_at: '2026-06-10T15:00:00Z', subject: 'Report 2' } as Report
    const report3 = { id: '3', announced_due_at: '2026-06-11T10:00:00Z', subject: 'Report 3' } as Report
    
    store.reports = [report1, report2, report3]
    
    const grouped = store.reportsByDate
    
    expect(grouped.get('2026-06-10')).toHaveLength(2)
    const group10 = grouped.get('2026-06-10')!
    expect(group10.some(r => r.id === '1')).toBe(true)
    expect(group10.some(r => r.id === '2')).toBe(true)
    
    expect(grouped.get('2026-06-11')).toHaveLength(1)
    expect(grouped.get('2026-06-11')![0].id).toBe('3')
    expect(grouped.has('2026-06-12')).toBe(false)
  })
})
