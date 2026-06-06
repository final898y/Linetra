import type { Database } from './database.types'

export type Report = Database['public']['Tables']['reports']['Row']
export type ReportInsert = Database['public']['Tables']['reports']['Insert']
export type ReportUpdate = Database['public']['Tables']['reports']['Update']

export type ReportItem = Database['public']['Tables']['report_items']['Row']
export type ReportItemInsert = Database['public']['Tables']['report_items']['Insert']

export const TemplateType = {
  General: 'general',
  Meeting: 'meeting',
  Weekly: 'weekly_report',
  Briefing: 'briefing',
  Announcement: 'announcement',
} as const

export type TemplateType = (typeof TemplateType)[keyof typeof TemplateType]
export type ReportStatus = Database['public']['Tables']['reports']['Row']['status']
export type ItemType = Database['public']['Tables']['report_items']['Row']['item_type']
