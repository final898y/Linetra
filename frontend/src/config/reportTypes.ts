import type { TemplateType } from '@/types/models'

export const ALL_REPORT_TYPES: { id: TemplateType; name: string }[] = [
  { id: 'general', name: '一般案件' },
  { id: 'meeting', name: '處務會議' },
  { id: 'weekly_report', name: '市長週報' },
  { id: 'briefing', name: '市長面報' },
  { id: 'announcement', name: '公告通知' },
]
