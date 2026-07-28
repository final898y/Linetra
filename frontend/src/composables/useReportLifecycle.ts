import type { ReportStatus, TemplateType } from '@/types/models'

export const getInitialReportStatus = (templateType: TemplateType): ReportStatus => {
  return templateType === 'meeting_simple' || templateType === 'announcement'
    ? 'completed'
    : 'pending'
}

export const getSentAtForSave = (isNewReport: boolean, now = new Date()): string | undefined => {
  return isNewReport ? now.toISOString() : undefined
}
