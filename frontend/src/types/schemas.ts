import { z } from 'zod'

// --- Enums ---
export const TemplateTypeSchema = z.enum([
  'general',
  'meeting',
  'weekly_report',
  'briefing',
  'announcement',
])

export const ReportStatusSchema = z.enum(['pending', 'completed', 'overdue', 'archived', 'deleted'])

export const ItemTypeSchema = z.enum([
  'submission_method',
  'detail',
  'note',
  'agenda',
  'link',
  'meeting_time',
])

// --- Report Item ---
export const ReportItemSchema = z.object({
  id: z.string().uuid().optional(),
  report_id: z.string().uuid(),
  item_type: ItemTypeSchema,
  content: z.string().min(1, '內容不能為空'),
  sort_order: z.number().int().nonnegative(),
})

export const ReportItemInsertSchema = ReportItemSchema.omit({ id: true })

// --- Report ---
export const ReportSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  template_type: TemplateTypeSchema,
  department: z.string().nullable().optional(),
  subject: z.string().min(1, '案由不能為空'),
  formatted_content: z.string().nullable().optional(),
  actual_due_at: z.string().nullable().optional(),
  announced_due_at: z.string().nullable().optional(),
  sent_at: z.string().nullable().optional(),
  importance_flag: z.boolean().default(false),
  status: ReportStatusSchema.default('pending'),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export const ReportInsertSchema = ReportSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  id: z.string().uuid().optional(),
})

export const ReportUpdateSchema = ReportInsertSchema.partial()
