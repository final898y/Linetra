import { describe, it, expect } from 'vitest'
import { useTimeFormatter } from '@/composables/useTimeFormatter'
import dayjs from 'dayjs'

describe('useTimeFormatter', () => {
  const { formatRelative, formatFull, formatDeadlineDetailed } = useTimeFormatter()

  describe('formatFull', () => {
    it('should format date string to YYYY/MM/DD HH:mm', () => {
      const date = '2026-06-09T16:00:00Z'
      const result = formatFull(date)
      expect(result).toMatch(/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/)
    })

    it('should return "-" for null input', () => {
      expect(formatFull(null)).toBe('-')
    })
  })

  describe('formatRelative', () => {
    it('should return "今天" with weekday for today', () => {
      const today = dayjs().add(1, 'minute').format('YYYY-MM-DD HH:mm:ss')
      const result = formatRelative(today)
      expect(result).toContain('今天')
      expect(result).toMatch(/\(週.*\)/)
    })

    it('should return "明天" with weekday for tomorrow', () => {
      const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD HH:mm:ss')
      const result = formatRelative(tomorrow)
      expect(result).toContain('明天')
      expect(result).toMatch(/明天\(週.*\)/)
    })

    it('should return "(本週X)" or "(下週X)" for dates in current or next week', () => {
      // 找出一個不是今天也不是明天的日期，但在本週或下週
      const future = dayjs().add(3, 'day').format('YYYY-MM-DD HH:mm:ss')
      const result = formatRelative(future)
      expect(result).toMatch(/\((本週|下週|週).*\)/)
    })

    it('should return "已逾期" for past dates', () => {
      const past = dayjs().subtract(2, 'day').format('YYYY-MM-DD HH:mm:ss')
      const result = formatRelative(past)
      expect(result).toContain('已逾期 2 天')
    })

    it('should return "-" for null input', () => {
      expect(formatRelative(null)).toBe('-')
    })
  })

  describe('formatDeadlineDetailed', () => {
    it('should format with full date, relative time and suffix', () => {
      const date = '2026-06-11 17:00'
      const result = formatDeadlineDetailed(date)
      
      expect(result).toContain('2026/06/11 17:00')
      expect(result).toMatch(/(今天|明天|下週|週)/)
      expect(result).toContain('下班前')
    })

    it('should add "中午前" for 12:00', () => {
      const date = '2026-06-11 12:00'
      const result = formatDeadlineDetailed(date)
      expect(result).toContain('中午前')
    })

    it('should return "未設定期限" for null input', () => {
      expect(formatDeadlineDetailed(null)).toBe('未設定期限')
    })
  })
})
