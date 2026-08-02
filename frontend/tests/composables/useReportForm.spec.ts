import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useReportForm } from '@/composables/useReportForm'

// Mock useReportTemplate
vi.mock('@/composables/useReportTemplate', () => ({
  useReportTemplate: () => ({
    generateLineText: vi.fn().mockReturnValue('mocked preview text'),
  }),
}))

describe('useReportForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('should initialize with default values', () => {
    const { form, activeTab } = useReportForm()
    expect(form.template_type).toBe('general')
    expect(form.subject).toBe('')
    expect(form.tags).toEqual([])
    expect(form.remarks).toBe('')
    expect(activeTab.value).toBe('general')
  })

  it('should update mode and reset fields', async () => {
    const { form, activeTab, updateMode } = useReportForm()

    updateMode('task')
    expect(activeTab.value).toBe('task')
    expect(form.template_type).toBe('task')

    updateMode('announcement')
    expect(activeTab.value).toBe('announcement')
    expect(form.template_type).toBe('announcement')
  })

  it('should apply template correctly', () => {
    const { form, currentTemplate, applyTemplate, items } = useReportForm()

    applyTemplate('meeting')
    expect(currentTemplate.value).toBe('meeting')
    expect(form.template_type).toBe('meeting')
    expect(form.subject).toBe('處務會議資料填報')
    expect(items.value.length).toBeGreaterThan(0)
  })

  it('should clear an existing report when starting a new report', () => {
    const { form, items, currentReportId, activeTab, resetForm } = useReportForm()

    currentReportId.value = 'report-1'
    activeTab.value = 'template'
    form.template_type = 'meeting'
    form.subject = '既有案件'
    form.department = '業務單位'
    form.remarks = '既有備註'
    form.tags.push('重要')
    form.actual_due_at = '2026-08-02T10:00'
    form.announced_due_at = '2026-08-01T10:00'
    form.importance_flag = true
    form.status = 'completed'
    items.value = [{ item_type: 'detail', content: '既有內容' }]

    resetForm()

    expect(currentReportId.value).toBeNull()
    expect(activeTab.value).toBe('general')
    expect(form.template_type).toBe('general')
    expect(form.subject).toBe('')
    expect(form.department).toBe('')
    expect(form.remarks).toBe('')
    expect(form.tags).toEqual([])
    expect(form.actual_due_at).toBe('')
    expect(form.announced_due_at).toBe('')
    expect(form.importance_flag).toBe(false)
    expect(form.status).toBe('pending')
    expect(items.value).toEqual([
      { item_type: 'submission_method', content: '紙本核章', sort_order: 1 },
      { item_type: 'detail', content: '', sort_order: 2 },
    ])
  })

  it('should default a simple meeting to completed because it is not tracked', () => {
    const { form, applyTemplate, items } = useReportForm()

    applyTemplate('meeting_simple')

    expect(form.status).toBe('completed')
    expect(items.value.some((item) => item.item_type === 'meeting_end_time')).toBe(true)
  })

  it('should default an announcement to completed and a task to pending', () => {
    const { form, updateMode } = useReportForm()

    updateMode('announcement')
    expect(form.status).toBe('completed')

    updateMode('task')
    expect(form.status).toBe('pending')
  })

  it('should manage tags correctly', () => {
    const { form, toggleTag, addCustomTag } = useReportForm()

    // Toggle predefined tag
    toggleTag('會議通知')
    expect(form.tags).toContain('會議通知')

    toggleTag('會議通知')
    expect(form.tags).not.toContain('會議通知')

    // Add custom tag
    addCustomTag('專案A')
    expect(form.tags).toContain('專案A')

    // Should not add duplicate tag
    addCustomTag('專案A')
    expect(form.tags.filter((t) => t === '專案A').length).toBe(1)

    // Should not add empty tag
    addCustomTag('  ')
    expect(form.tags).not.toContain('')
  })

  it('should add and remove dynamic items', () => {
    const { items, addItem, removeItem } = useReportForm()

    const initialLength = items.value.length
    addItem('detail')
    expect(items.value.length).toBe(initialLength + 1)
    expect(items.value[items.value.length - 1].item_type).toBe('detail')

    removeItem(0)
    expect(items.value.length).toBe(initialLength)
  })
})
