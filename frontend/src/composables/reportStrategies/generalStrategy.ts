import type { ReportData, ReportStrategy } from './types'
import { BaseStrategy, SEPARATOR } from './baseStrategy'

export class GeneralStrategy extends BaseStrategy implements ReportStrategy {
  generate({ report, items }: ReportData): string {
    const lines: string[] = []
    lines.push(this.formatHeader(report, '【 案 件 通 報 】'))

    if (report.department) lines.push(`通報單位： ${report.department}`)
    lines.push(`案由： \`${report.subject}\``)
    lines.push(`期限： \`${this.formatDetailedDeadline(report.announced_due_at)}\``)
    lines.push(SEPARATOR)

    const methods = items.filter((i) => i.item_type === 'submission_method')
    lines.push('繳交方式：')
    if (methods.length > 0) {
      methods.forEach((m) => lines.push(`- ${m.content}`))
    } else {
      lines.push('- 未指定')
    }
    lines.push(SEPARATOR)

    const details = items.filter((i) => i.item_type === 'detail')
    lines.push('詳細說明：')
    if (details.length > 0) {
      details.forEach((d, i) => lines.push(`${i + 1}. ${d.content}`))
    } else {
      lines.push('無')
    }

    const noteText = this.formatNotes(items)
    if (noteText) {
      lines.push('')
      lines.push('備註：')
      lines.push(noteText)
    }
    lines.push(SEPARATOR)

    return lines.join('\n')
  }
}
