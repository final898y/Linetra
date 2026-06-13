import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useReportForm } from '@/composables/useReportForm'
import { nextTick } from 'vue'

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
    expect(form.tags.filter(t => t === '專案A').length).toBe(1)
    
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
