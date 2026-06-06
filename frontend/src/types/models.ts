import type { Database } from './database.types'

export type Report = Database['public']['Tables']['reports']['Row']
export type ReportInsert = Database['public']['Tables']['reports']['Insert']
export type ReportUpdate = Database['public']['Tables']['reports']['Update']

export type ReportItem = Database['public']['Tables']['report_items']['Row']
export type ReportItemInsert = Database['public']['Tables']['report_items']['Insert']

export enum TemplateType {
  General = 'general',
  Meeting = 'meeting',
  Weekly = 'weekly_report',
  Briefing = 'briefing',
  Announcement = 'announcement',
}

export type ReportStatus = 'pending' | 'completed' | 'overdue' | 'archived'
