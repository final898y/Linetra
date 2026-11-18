import type { ReportData, ReportStrategy } from './types'
import { BaseStrategy, SEPARATOR } from './baseStrategy'
import { formatMeetingTime } from '../useReportItemFormatter'
export class MeetingSimpleStrategy extends BaseStrategy implements ReportStrategy {
  generate({ report, items }: ReportData): string {
    const lines: string[] = []
    lines.push(this.formatHeader(report, '【 會 議 通 報 】'))

    lines.push(`會議名稱： \`${report.subject}\``)

    const time = items.find((i) => i.item_type === 'meeting_time')?.content
    if (time && time.trim() !== '') {
      lines.push(`時間： \`${formatMeetingTime(time)}\``)
    }

    const endTime = items.find((i) => i.item_type === 'meeting_end_time')?.content
    if (endTime && endTime.trim() !== '') {
      lines.push(`結束時間： \`${formatMeetingTime(endTime)}\``)
    }

    const location = items.find((i) => i.item_type === 'location')?.content
    if (location && location.trim() !== '') {
      lines.push(`地點： \`${location}\``)
    }

    const participants = items.find((i) => i.item_type === 'participants')?.content
    if (participants && participants.trim() !== '') {
      lines.push(`參加人員： \`${participants}\``)
    }

    const materials = items.find((i) => i.item_type === 'materials')?.content
    if (materials && materials.trim() !== '') {
      lines.push(`相關資料： \`${materials}\``)
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
