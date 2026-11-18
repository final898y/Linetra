import type { ReportData, ReportStrategy } from './types'
import { BaseStrategy, SEPARATOR } from './baseStrategy'

export class MeetingStrategy extends BaseStrategy implements ReportStrategy {
  generate({ report, items }: ReportData): string {
    const lines: string[] = []
    lines.push(this.formatHeader(report, '【 案 件 通 報 】'))

    lines.push(`案由： \`${report.subject}\``)
    lines.push(`期限： \`${this.formatDetailedDeadline(report.announced_due_at)}\``)
    lines.push(SEPARATOR)

    lines.push('詳細說明：')
    const meetingTime = items.find((i) => i.item_type === 'meeting_time')?.content
    lines.push(`1. 本週處務會議 \`訂於${meetingTime || '未定'}\``)

    const link = items.find((i) => i.item_type === 'link')?.content
    lines.push('2. 請各位填妥本週處務會議資料，雲端連結:')
    lines.push(link || '尚未提供')

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
