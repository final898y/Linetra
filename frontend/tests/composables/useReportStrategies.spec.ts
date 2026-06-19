import { describe, it, expect, vi } from 'vitest'
import { strategies } from '@/composables/useReportStrategies'
import type { ReportData } from '@/composables/useReportStrategies'

// Mock useTimeFormatter to get consistent results
vi.mock('@/composables/useTimeFormatter', () => ({
  useTimeFormatter: () => ({
    formatDeadlineDetailed: (date: string) => `formatted_detailed_${date}`
  })
}))

describe('Report Strategies', () => {
  const commonReport = {
    subject: '測試案由',
    announced_due_at: '2026-06-07T12:00:00',
    importance_flag: false,
    department: '測試單位'
  }

  describe('GeneralStrategy', () => {
    it('should generate correct text with basic info and items', () => {
      const data: ReportData = {
        report: commonReport,
        items: [
          { item_type: 'submission_method', content: '紙本' },
          { item_type: 'detail', content: '說明 1' },
          { item_type: 'note', content: '備註 1' }
        ]
      }
      const result = strategies.general.generate(data)
      expect(result).toContain('【 案 件 通 報 】')
      expect(result).toContain('案由： `測試案由`')
      expect(result).toContain('期限： `formatted_detailed_2026-06-07T12:00:00`')
      expect(result).toContain('- 紙本')
      expect(result).toContain('1. 說明 1')
      expect(result).toContain('1. 備註 1')
    })

    it('should show importance flag when enabled', () => {
      const data: ReportData = {
        report: { ...commonReport, importance_flag: true },
        items: []
      }
      const result = strategies.general.generate(data)
      expect(result).toContain('`【重要】`')
    })

    it('should hide notes section when no notes provided', () => {
      const data: ReportData = {
        report: commonReport,
        items: [{ item_type: 'detail', content: '說明' }]
      }
      const result = strategies.general.generate(data)
      expect(result).not.toContain('備註：')
    })
  })

  describe('MeetingStrategy', () => {
    it('should generate meeting specific format', () => {
      const data: ReportData = {
        report: commonReport,
        items: [
          { item_type: 'meeting_time', content: '週一 14:00' },
          { item_type: 'link', content: 'https://test.com' }
        ]
      }
      const result = strategies.meeting.generate(data)
      expect(result).toContain('本週處務會議 `訂於週一 14:00`')
      expect(result).toContain('https://test.com')
    })
  })

  describe('MeetingSimpleStrategy', () => {
    it('should generate simple meeting format with all optional items', () => {
      const data: ReportData = {
        report: commonReport,
        items: [
          { item_type: 'meeting_time', content: '2026-06-22T14:00' },
          { item_type: 'location', content: '第三會議室' },
          { item_type: 'participants', content: '小明, 小華' },
          { item_type: 'materials', content: '簡報連結' },
          { item_type: 'note', content: '備註 1' }
        ]
      }
      const result = strategies.meeting_simple.generate(data)
      expect(result).toContain('【 會 議 通 報 】')
      expect(result).toContain('會議名稱： `測試案由`')
      expect(result).toContain('時間： `2026-06-22 (一) 14:00`')
      expect(result).toContain('地點： `第三會議室`')
      expect(result).toContain('參加人員： `小明, 小華`')
      expect(result).toContain('相關資料： `簡報連結`')
      expect(result).toContain('1. 備註 1')
    })

    it('should omit empty optional fields from output', () => {
      const data: ReportData = {
        report: commonReport,
        items: [
          { item_type: 'meeting_time', content: '2026-06-22T14:00' }
        ]
      }
      const result = strategies.meeting_simple.generate(data)
      expect(result).toContain('會議名稱： `測試案由`')
      expect(result).toContain('時間： `2026-06-22 (一) 14:00`')
      expect(result).not.toContain('地點')
      expect(result).not.toContain('參加人員')
      expect(result).not.toContain('相關資料')
    })

    it('should pass through non-ISO time strings as-is', () => {
      const data: ReportData = {
        report: commonReport,
        items: [
          { item_type: 'meeting_time', content: '週三下午兩點' }
        ]
      }
      const result = strategies.meeting_simple.generate(data)
      expect(result).toContain('時間： `週三下午兩點`')
    })
  })

  describe('WeeklyStrategy', () => {
    it('should generate weekly report specific format', () => {
      const data: ReportData = {
        report: commonReport,
        items: [
          { item_type: 'link', content: 'https://weekly.com' }
        ]
      }
      const result = strategies.weekly_report.generate(data)
      expect(result).toContain('繳交方式：\n- 線上表單')
      expect(result).toContain('請至「https://weekly.com」 填妥本週週報內容')
    })
  })

  describe('BriefingStrategy', () => {
    it('should generate briefing specific format', () => {
      const data: ReportData = {
        report: commonReport,
        items: [
          { item_type: 'agenda', content: '1. 進度 A' },
          { item_type: 'agenda', content: '2. 進度 B' }
        ]
      }
      const result = strategies.briefing.generate(data)
      expect(result).toContain('通報單位： 產發處處長')
      expect(result).toContain('1. 進度 A\n2. 進度 B')
    })
  })

  describe('AnnouncementStrategy', () => {
    it('should generate announcement specific format', () => {
      const data: ReportData = {
        report: {
          ...commonReport,
          template_type: 'announcement',
          formatted_content: '這是公告內容'
        },
        items: []
      }
      const result = strategies.announcement.generate(data)
      expect(result).toContain('【 公 告 通 知 】')
      expect(result).toContain('標題： `測試案由`')
      expect(result).toContain('這是公告內容')
    })
  })

  describe('TaskStrategy', () => {
    it('should generate minimal task specific format', () => {
      const data: ReportData = {
        report: commonReport,
        items: []
      }
      const result = strategies.task.generate(data)
      expect(result).toContain('【 臨 時 任 務 】')
      expect(result).toContain('任務： `測試案由`')
      expect(result).toContain('期限： `formatted_detailed_2026-06-07T12:00:00`')
      expect(result).not.toContain('通報單位')
    })
  })
})
