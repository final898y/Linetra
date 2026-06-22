import { describe, it, expect } from 'vitest'
import { useReportItemFormatter } from '@/composables/useReportItemFormatter'

describe('useReportItemFormatter', () => {
  const { formatMeetingTime, formatItemContent } = useReportItemFormatter()

  describe('formatMeetingTime', () => {
    it('should format ISO datetime string to custom Chinese format', () => {
      const input = '2026-06-22T14:30:00'
      const expected = '2026-06-22 (一) 14:30'
      expect(formatMeetingTime(input)).toBe(expected)
    })

    it('should return empty string if input is empty or whitespace', () => {
      expect(formatMeetingTime('')).toBe('')
      expect(formatMeetingTime('   ')).toBe('')
    })

    it('should return raw input if it is not a valid date', () => {
      expect(formatMeetingTime('明天下午兩點')).toBe('明天下午兩點')
      expect(formatMeetingTime('invalid-date')).toBe('invalid-date')
    })
  })

  describe('formatItemContent', () => {
    it('should format meeting_time content using formatMeetingTime', () => {
      const input = '2026-06-22T14:30:00'
      const expected = '2026-06-22 (一) 14:30'
      expect(formatItemContent('meeting_time', input)).toBe(expected)
    })

    it('should return other item type contents as-is', () => {
      expect(formatItemContent('location', '會議室 A')).toBe('會議室 A')
      expect(formatItemContent('participants', '張三, 李四')).toBe('張三, 李四')
    })

    it('should return empty string if content is empty', () => {
      expect(formatItemContent('meeting_time', '')).toBe('')
      expect(formatItemContent('location', '')).toBe('')
    })
  })
})
