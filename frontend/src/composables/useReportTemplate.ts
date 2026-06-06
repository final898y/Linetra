import type { Report, ReportItem } from '@/types/models'
import { useTimeFormatter } from './useTimeFormatter'

export const useReportTemplate = () => {
  const { formatRelative } = useTimeFormatter()

  const generateLineText = (report: Partial<Report>, items: Partial<ReportItem>[]): string => {
    const lines: string[] = []
    const separator = '~~~~~~~~~~~~~~~~~~~~~~~~~~'

    // 1. 重要旗標
    if (report.importance_flag) {
      lines.push('@All 【重要】')
    }

    // 2. 標題
    const isAnnouncement = report.template_type === 'announcement'
    lines.push(isAnnouncement ? '【 公 告 通 知 】' : '【 案 件 通 報 】')

    if (!isAnnouncement) {
      lines.push(separator)
    }

    // 3. 基本欄位
    if (report.department) {
      lines.push(`通報單位：${report.department}`)
    }
    lines.push(`案由：${report.subject}`)

    if (!isAnnouncement && report.announced_due_at) {
      lines.push(`期限：${formatRelative(report.announced_due_at)}`)
      lines.push(separator)
    }

    // 4. 分組項目
    const groupByType = (type: string) =>
      items.filter((i) => i.item_type === type).map((i) => i.content)

    const methods = groupByType('submission_method')
    if (methods.length > 0) {
      lines.push('繳交方式：')
      methods.forEach((m) => lines.push(`- ${m}`))
      lines.push(separator)
    }

    const details = groupByType('detail')
    if (details.length > 0) {
      lines.push('詳細說明：')
      details.forEach((d, i) => lines.push(`${i + 1}. ${d}`))
    }

    const notes = groupByType('note')
    if (notes.length > 0) {
      if (details.length > 0) lines.push('') // Add space if there were details
      lines.push('備註：')
      notes.forEach((n, i) => lines.push(`${i + 1}. ${n}`))
    }

    if (!isAnnouncement && (details.length > 0 || notes.length > 0)) {
      lines.push(separator)
    }

    return lines.join('\n')
  }

  return {
    generateLineText,
  }
}
