import { describe, it, expect } from 'vitest'
import { useTimeFormatter } from '@/composables/useTimeFormatter'
import dayjs from 'dayjs'

describe('useTimeFormatter', () => {
  const { formatRelative, formatFull } = useTimeFormatter()

  describe('formatFull', () => {
    it('should format date string to YYYY/MM/DD HH:mm', () => {
      const date = '2026-06-09T16:00:00Z'
      // 注意：這取決於執行測試環境的時區。
      // 如果是 UTC+8，應該是 2026/06/10 00:00
      // 這裡我們用正則匹配基本格式，或者驗證解析後的結果
      const result = formatFull(date)
      expect(result).toMatch(/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/)
    })

    it('should return "-" for null input', () => {
      expect(formatFull(null)).toBe('-')
    })
  })

  describe('formatRelative', () => {
    it('should return "今天" with weekday for today', () => {
      // 使用今天稍晚的時間，確保不會觸發「已過期」邏輯
      const today = dayjs().add(1, 'hour').format('YYYY-MM-DDTHH:mm:ss')
      const result = formatRelative(today)
      expect(result).toContain('今天')
      expect(result).toMatch(/\(週.*\)/)
    })

    it('should return "明天" with weekday for tomorrow', () => {
      const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DDTHH:mm:ss')
      const result = formatRelative(tomorrow)
      expect(result).toContain('明天')
      expect(result).toMatch(/\(週.*\)/)
    })

    it('should return "已逾期" for past dates', () => {
      const past = dayjs().subtract(2, 'day').format('YYYY-MM-DDTHH:mm:ss')
      const result = formatRelative(past)
      expect(result).toContain('已逾期 2 天')
    })

    it('should return "-" for null input', () => {
      expect(formatRelative(null)).toBe('-')
    })
  })
})
