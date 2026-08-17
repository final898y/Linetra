import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { buildKeywordFilter, useReportStore } from '@/stores/reports'
import { supabase } from '@/api/supabase'
import type { Report, ReportWithTags } from '@/types/models'

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
  },
}))

describe('ReportStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should fetch reports', async () => {
    const store = useReportStore()
    const mockData: Report[] = [
      {
        id: '1',
        subject: 'Test',
        user_id: 'u1',
        status: 'pending',
        template_type: 'general',
        created_at: '2026-06-09T00:00:00Z',
        updated_at: '2026-06-09T00:00:00Z',
      } as Report,
    ]

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      then: (fn: (res: { data: Report[]; error: null }) => void) =>
        fn({ data: mockData, error: null }),
    } as unknown as ReturnType<typeof supabase.from>)

    await store.fetchReports()
    expect(store.reports).toEqual(mockData)
  })

  it('should update report status', async () => {
    const store = useReportStore()
    store.reports = [{ id: '1', status: 'pending' } as Report]

    vi.mocked(supabase.from).mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    } as unknown as ReturnType<typeof supabase.from>)

    await store.updateStatus('1', 'completed')
    expect(store.reports[0].status).toBe('completed')
  })

  it('should group reports by date correctly in reportsByDate', () => {
    const store = useReportStore()
    const report1 = {
      id: '1',
      announced_due_at: '2026-06-10T10:00:00Z',
      subject: 'Report 1',
    } as Report
    const report2 = {
      id: '2',
      announced_due_at: '2026-06-10T15:00:00Z',
      subject: 'Report 2',
    } as Report
    const report3 = {
      id: '3',
      announced_due_at: '2026-06-11T10:00:00Z',
      subject: 'Report 3',
    } as Report

    store.reports = [report1, report2, report3]

    const grouped = store.reportsByDate

    expect(grouped.get('2026-06-10')).toHaveLength(2)
    const group10 = grouped.get('2026-06-10')!
    expect(group10.some((r) => r.id === '1')).toBe(true)
    expect(group10.some((r) => r.id === '2')).toBe(true)

    expect(grouped.get('2026-06-11')).toHaveLength(1)
    expect(grouped.get('2026-06-11')![0].id).toBe('3')
    expect(grouped.has('2026-06-12')).toBe(false)
  })

  it('should calculate unique and top tags correctly', () => {
    const store = useReportStore()
    const report1 = {
      id: '1',
      report_tags: [{ tags: { name: 'A' } }, { tags: { name: 'B' } }],
    } as ReportWithTags
    const report2 = {
      id: '2',
      report_tags: [{ tags: { name: 'B' } }, { tags: { name: 'C' } }],
    } as ReportWithTags
    const report3 = { id: '3', report_tags: [{ tags: { name: 'B' } }] } as ReportWithTags

    store.reports = [report1, report2, report3]

    expect(store.allUniqueTags).toEqual(['A', 'B', 'C'])
    expect(store.topTags).toEqual(['B', 'A', 'C'])
  })

  it('should apply keyword filter when keyword is provided', async () => {
    const store = useReportStore()
    const orMock = vi.fn().mockResolvedValue({ data: [], error: null })

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      or: orMock,
    } as unknown as ReturnType<typeof supabase.from>)

    await store.fetchReports({
      statuses: [],
      templateTypes: [],
      tags: [],
      sortOrder: 'asc',
      hideAnnouncements: false,
      hideCompleted: false,
      keyword: '測試',
    })

    expect(orMock).toHaveBeenCalledWith('subject.ilike."%測試%",remarks.ilike."%測試%"')
  })

  it('should escape special characters in keyword filters', () => {
    expect(buildKeywordFilter('a,b(50%)_\\"')).toBe(
      'subject.ilike."%a,b(50\\%)\\_\\\\\\"%",remarks.ilike."%a,b(50\\%)\\_\\\\\\"%"'
    )
  })

  it('should not hide completed reports when completed is explicitly selected', async () => {
    const store = useReportStore()
    const inMock = vi.fn().mockReturnThis()
    const neqMock = vi.fn().mockReturnThis()

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      in: inMock,
      neq: neqMock,
      then: (fn: (res: { data: Report[]; error: null }) => void) => fn({ data: [], error: null }),
    } as unknown as ReturnType<typeof supabase.from>)

    await store.fetchReports({
      statuses: ['completed'],
      templateTypes: [],
      tags: [],
      sortOrder: 'asc',
      hideAnnouncements: false,
      hideCompleted: true,
    })

    expect(inMock).toHaveBeenCalledWith('status', ['completed'])
    expect(neqMock).not.toHaveBeenCalledWith('status', 'completed')
  })

  it('should keep results from the latest concurrent request', async () => {
    const store = useReportStore()
    let resolveFirst!: (value: { data: Report[]; error: null }) => void
    let resolveSecond!: (value: { data: Report[]; error: null }) => void
    const firstResponse = new Promise<{ data: Report[]; error: null }>((resolve) => {
      resolveFirst = resolve
    })
    const secondResponse = new Promise<{ data: Report[]; error: null }>((resolve) => {
      resolveSecond = resolve
    })
    const createQuery = (response: Promise<{ data: Report[]; error: null }>) => ({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      then: (onFulfilled: (value: { data: Report[]; error: null }) => void) =>
        response.then(onFulfilled),
    })

    vi.mocked(supabase.from)
      .mockImplementationOnce(() => createQuery(firstResponse) as never)
      .mockImplementationOnce(() => createQuery(secondResponse) as never)

    const options = (keyword: string) => ({
      statuses: [],
      templateTypes: [],
      tags: [],
      sortOrder: 'asc' as const,
      hideAnnouncements: false,
      hideCompleted: false,
      keyword,
    })
    const firstRequest = store.fetchReports(options('第一次'))
    const secondRequest = store.fetchReports(options('第二次'))

    resolveSecond({ data: [{ id: 'latest' } as Report], error: null })
    await secondRequest
    resolveFirst({ data: [{ id: 'stale' } as Report], error: null })
    await firstRequest

    expect(store.reports.map((report) => report.id)).toEqual(['latest'])
  })

  it('should NOT call or() when keyword is empty', async () => {
    const store = useReportStore()
    const orMock = vi.fn().mockResolvedValue({ data: [], error: null })

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      not: vi.fn().mockResolvedValue({ data: [], error: null }),
      or: orMock,
    } as unknown as ReturnType<typeof supabase.from>)

    await store.fetchReports({
      statuses: [],
      templateTypes: [],
      tags: [],
      sortOrder: 'asc',
      hideAnnouncements: false,
      hideCompleted: false,
      keyword: '',
    })

    expect(orMock).not.toHaveBeenCalled()
  })
})
