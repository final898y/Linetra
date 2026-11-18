import type { ReportData, ReportStrategy } from './types'
import { BaseStrategy, SEPARATOR } from './baseStrategy'

export class BriefingStrategy extends BaseStrategy implements ReportStrategy {
  generate({ report, items }: ReportData): string {
    const lines: string[] = []
    lines.push(this.formatHeader(report, '【 案 件 通 報 】'))

    lines.push('通報單位： 產發處處長')
    lines.push(`案由： \`${report.subject}\``)
    lines.push(`期限： \`${this.formatDetailedDeadline(report.announced_due_at)}\``)
    lines.push(SEPARATOR)

    lines.push('繳交方式：')
    lines.push('- 檔案回傳')
    lines.push(SEPARATOR)

    lines.push('本週產發處例會報告事項：')
    const agendas = items.filter((i) => i.item_type === 'agenda')
    if (agendas.length > 0) {
      agendas.forEach((a) => lines.push(a.content || ''))
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
