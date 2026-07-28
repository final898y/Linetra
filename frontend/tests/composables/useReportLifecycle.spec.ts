import { describe, expect, it } from 'vitest'
import { getInitialReportStatus, getSentAtForSave } from '@/composables/useReportLifecycle'

describe('useReportLifecycle', () => {
  it('marks non-tracking modes as completed when created', () => {
    expect(getInitialReportStatus('meeting_simple')).toBe('completed')
    expect(getInitialReportStatus('announcement')).toBe('completed')
  })

  it('marks tracking modes as pending when created', () => {
    expect(getInitialReportStatus('general')).toBe('pending')
    expect(getInitialReportStatus('task')).toBe('pending')
  })

  it('records sent_at only when a report is first created', () => {
    const copiedAt = new Date('2026-07-28T08:00:00.000Z')

    expect(getSentAtForSave(true, copiedAt)).toBe('2026-07-28T08:00:00.000Z')
    expect(getSentAtForSave(false, copiedAt)).toBeUndefined()
  })
})
