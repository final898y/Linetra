import type { ReportStatus, TemplateType } from '@/types/models'
import { isReportTemplateType, REPORT_TEMPLATES } from '@/config/reportTemplates'

export const getInitialReportStatus = (templateType: TemplateType): ReportStatus => {
  return (
    (isReportTemplateType(templateType)
      ? REPORT_TEMPLATES[templateType].behavior?.initialStatus
      : undefined) ??
    (templateType === 'announcement' ? 'completed' : 'pending')
  )
}

export const getSentAtForSave = (isNewReport: boolean, now = new Date()): string | undefined => {
  return isNewReport ? now.toISOString() : undefined
}
