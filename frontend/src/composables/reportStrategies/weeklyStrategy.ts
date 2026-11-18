import type { ReportData, ReportStrategy } from './types'
import { BaseStrategy, SEPARATOR } from './baseStrategy'

export class WeeklyStrategy extends BaseStrategy implements ReportStrategy {
  generate({ report, items }: ReportData): string {
    const lines: string[] = []
    lines.push(this.formatHeader(report, '【 案 件 通 報 】'))

    lines.push(`案由： \`${report.subject}\``)
    lines.push(`期限： \`${this.formatDetailedDeadline(report.announced_due_at)}\``)
    lines.push(SEPARATOR)

    lines.push('繳交方式：')
    lines.push('- 線上表單')
    lines.push(SEPARATOR)

    lines.push('詳細說明：')
    const link = items.find((i) => i.item_type === 'link')?.content
    lines.push(`1. 請至「${link || '尚未提供'}」 填寫案件最新進度填妥本週週報相關內容。`)

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
