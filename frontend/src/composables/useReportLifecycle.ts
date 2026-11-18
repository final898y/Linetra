import type { ReportStatus, TemplateType } from '@/types/models'
import { REPORT_TEMPLATES } from '@/config/reportTemplates'

export const getInitialReportStatus = (templateType: TemplateType): ReportStatus => {
  return (
    REPORT_TEMPLATES[templateType]?.behavior?.initialStatus ??
    (templateType === 'announcement' ? 'completed' : 'pending')
  )
}

export const getSentAtForSave = (isNewReport: boolean, now = new Date()): string | undefined => {
  return isNewReport ? now.toISOString() : undefined
}
