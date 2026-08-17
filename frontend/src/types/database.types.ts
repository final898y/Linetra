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
          sent_at: string | null
          status: 'pending' | 'completed' | 'overdue' | 'archived' | 'deleted'
          subject: string
          template_type:
            | 'general'
            | 'meeting'
            | 'meeting_simple'
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
          sent_at?: string | null
          status?: 'pending' | 'completed' | 'overdue' | 'archived' | 'deleted'
          subject: string
          template_type:
            | 'general'
            | 'meeting'
            | 'meeting_simple'
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
          sent_at?: string | null
          status?: 'pending' | 'completed' | 'overdue' | 'archived' | 'deleted'
          subject?: string
          template_type?:
            | 'general'
            | 'meeting'
            | 'meeting_simple'
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
      tags: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      report_tags: {
        Row: {
          report_id: string
          tag_id: string
        }
        Insert: {
          report_id: string
          tag_id: string
        }
        Update: {
          report_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'report_tags_report_id_fkey'
            columns: ['report_id']
            isOneToOne: false
            referencedRelation: 'reports'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'report_tags_tag_id_fkey'
            columns: ['tag_id']
            isOneToOne: false
            referencedRelation: 'tags'
            referencedColumns: ['id']
          },
        ]
      }
      report_items: {
        Row: {
          content: string
          id: string
          item_type:
            | 'submission_method'
            | 'detail'
            | 'note'
            | 'agenda'
            | 'link'
            | 'meeting_time'
            | 'meeting_end_time'
            | 'location'
            | 'participants'
            | 'materials'
          report_id: string
          sort_order: number
        }
        Insert: {
          content: string
          id?: string
          item_type:
            | 'submission_method'
            | 'detail'
            | 'note'
            | 'agenda'
            | 'link'
            | 'meeting_time'
            | 'meeting_end_time'
            | 'location'
            | 'participants'
            | 'materials'
          report_id: string
          sort_order: number
        }
        Update: {
          content?: string
          id?: string
          item_type?:
            | 'submission_method'
            | 'detail'
            | 'note'
            | 'agenda'
            | 'link'
            | 'meeting_time'
            | 'meeting_end_time'
            | 'location'
            | 'participants'
            | 'materials'
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
      document_templates: {
        Row: {
          id: string
          user_id: string
          name: string
          category: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          category?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          category?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'document_templates_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      document_template_versions: {
        Row: {
          id: string
          template_id: string
          version_no: number
          content_markdown: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          template_id: string
          version_no: number
          content_markdown: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          template_id?: string
          version_no?: number
          content_markdown?: string
          created_by?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'document_template_versions_template_id_fkey'
            columns: ['template_id']
            isOneToOne: false
            referencedRelation: 'document_templates'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'document_template_versions_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      key_notes: {
        Row: {
          id: string
          user_id: string
          title: string
          category: 'procedure' | 'leader_instruction' | 'reminder' | 'website'
          content: string
          is_pinned: boolean
          sort_order: number
          status: 'active' | 'archived'
          valid_from: string | null
          valid_until: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          category: 'procedure' | 'leader_instruction' | 'reminder' | 'website'
          content?: string
          is_pinned?: boolean
          sort_order?: number
          status?: 'active' | 'archived'
          valid_from?: string | null
          valid_until?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          category?: 'procedure' | 'leader_instruction' | 'reminder' | 'website'
          content?: string
          is_pinned?: boolean
          sort_order?: number
          status?: 'active' | 'archived'
          valid_from?: string | null
          valid_until?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'key_notes_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      key_note_links: {
        Row: {
          id: string
          note_id: string
          label: string
          url: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          note_id: string
          label: string
          url: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          note_id?: string
          label?: string
          url?: string
          sort_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'key_note_links_note_id_fkey'
            columns: ['note_id']
            isOneToOne: false
            referencedRelation: 'key_notes'
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
