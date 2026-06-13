export interface Database {
  public: {
    Tables: {
      reports: {
        Row: {
          actual_due_at: string | null
          announced_due_at: string | null
          created_at: string
          department: string | null
          formatted_content: string | null
          id: string
          importance_flag: boolean
          remarks: string | null
          tags: string[] | null
          sent_at: string | null
          status: 'pending' | 'completed' | 'overdue' | 'archived' | 'deleted'
          subject: string
          template_type:
            | 'general'
            | 'meeting'
            | 'weekly_report'
            | 'briefing'
            | 'announcement'
            | 'task'
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_due_at?: string | null
          announced_due_at?: string | null
          created_at?: string
          department?: string | null
          formatted_content?: string | null
          id?: string
          importance_flag?: boolean
          remarks?: string | null
          tags?: string[] | null
          sent_at?: string | null
          status?: 'pending' | 'completed' | 'overdue' | 'archived' | 'deleted'
          subject: string
          template_type:
            | 'general'
            | 'meeting'
            | 'weekly_report'
            | 'briefing'
            | 'announcement'
            | 'task'
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_due_at?: string | null
          announced_due_at?: string | null
          created_at?: string
          department?: string | null
          formatted_content?: string | null
          id?: string
          importance_flag?: boolean
          remarks?: string | null
          tags?: string[] | null
          sent_at?: string | null
          status?: 'pending' | 'completed' | 'overdue' | 'archived' | 'deleted'
          subject?: string
          template_type?:
            | 'general'
            | 'meeting'
            | 'weekly_report'
            | 'briefing'
            | 'announcement'
            | 'task'
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'reports_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      report_items: {
        Row: {
          content: string
          id: string
          item_type: 'submission_method' | 'detail' | 'note' | 'agenda' | 'link' | 'meeting_time'
          report_id: string
          sort_order: number
        }
        Insert: {
          content: string
          id?: string
          item_type: 'submission_method' | 'detail' | 'note' | 'agenda' | 'link' | 'meeting_time'
          report_id: string
          sort_order: number
        }
        Update: {
          content?: string
          id?: string
          item_type?: 'submission_method' | 'detail' | 'note' | 'agenda' | 'link' | 'meeting_time'
          report_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: 'report_items_report_id_fkey'
            columns: ['report_id']
            isOneToOne: false
            referencedRelation: 'reports'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
