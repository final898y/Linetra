import type { TemplateType } from '@/types/models'

export const ALL_REPORT_TYPES: { id: TemplateType; name: string }[] = [
  { id: 'general', name: '一般案件' },
  { id: 'meeting', name: '處務會議' },
  { id: 'weekly_report', name: '市長週報' },
  { id: 'briefing', name: '市長面報' },
  { id: 'announcement', name: '公告通知' },
  { id: 'task', name: '臨時任務' },
]

export const COMMON_TAGS = ['會議通知', '經常性事項', '議會事項', '緊急交辦', '例行工作']
