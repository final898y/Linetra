export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      reports: {
        Row: {
          id: string
          user_id: string
          template_type: 'general' | 'meeting' | 'weekly_report' | 'briefing' | 'announcement'
          department: string | null
          subject: string
          formatted_content: string | null
          actual_due_at: string | null
          announced_due_at: string | null
          sent_at: string | null
          importance_flag: boolean
          status: 'pending' | 'completed' | 'overdue' | 'archived'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          template_type: 'general' | 'meeting' | 'weekly_report' | 'briefing' | 'announcement'
          department?: string | null
          subject: string
          formatted_content?: string | null
          actual_due_at?: string | null
          announced_due_at?: string | null
          sent_at?: string | null
          importance_flag?: boolean
          status?: 'pending' | 'completed' | 'overdue' | 'archived'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          template_type?: 'general' | 'meeting' | 'weekly_report' | 'briefing' | 'announcement'
          department?: string | null
          subject?: string
          formatted_content?: string | null
          actual_due_at?: string | null
          announced_due_at?: string | null
          sent_at?: string | null
          importance_flag?: boolean
          status?: 'pending' | 'completed' | 'overdue' | 'archived'
          created_at?: string
          updated_at?: string
        }
      }
      report_items: {
        Row: {
          id: string
          report_id: string
          item_type: 'submission_method' | 'detail' | 'note' | 'agenda' | 'link' | 'meeting_time'
          content: string
          sort_order: number
        }
        Insert: {
          id?: string
          report_id: string
          item_type: 'submission_method' | 'detail' | 'note' | 'agenda' | 'link' | 'meeting_time'
          content: string
          sort_order: number
        }
        Update: {
          id?: string
          report_id?: string
          item_type?: 'submission_method' | 'detail' | 'note' | 'agenda' | 'link' | 'meeting_time'
          content?: string
          sort_order?: number
        }
      }
    }
  }
}
