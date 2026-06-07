import { describe, it, expect, vi } from 'vitest'
import { useReportTemplate } from '@/composables/useReportTemplate'
import { strategies } from '@/composables/useReportStrategies'

// Mock the strategies to verify selection
vi.mock('@/composables/useReportStrategies', () => ({
  strategies: {
    general: { generate: vi.fn(() => 'general_output') },
    meeting: { generate: vi.fn(() => 'meeting_output') },
    weekly_report: { generate: vi.fn(() => 'weekly_output') },
    briefing: { generate: vi.fn(() => 'briefing_output') },
    announcement: { generate: vi.fn(() => 'announcement_output') },
  }
}))

describe('useReportTemplate', () => {
  const { generateLineText } = useReportTemplate()

  it('should call general strategy by default', () => {
    const result = generateLineText({ template_type: 'general' }, [])
    expect(strategies.general.generate).toHaveBeenCalled()
    expect(result).toBe('general_output')
  })

  it('should call the correct strategy based on template_type', () => {
    const result = generateLineText({ template_type: 'meeting' }, [])
    expect(strategies.meeting.generate).toHaveBeenCalled()
    expect(result).toBe('meeting_output')
  })

  it('should fallback to general strategy if type is unknown', () => {
    // @ts-expect-error - testing invalid type fallback
    const result = generateLineText({ template_type: 'invalid' }, [])
    expect(strategies.general.generate).toHaveBeenCalled()
    expect(result).toBe('general_output')
  })
})
