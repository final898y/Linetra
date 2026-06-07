import type { Report, ReportItem, TemplateType } from '@/types/models'
import { useTimeFormatter } from './useTimeFormatter'

export interface ReportData {
  report: Partial<Report>
  items: Partial<ReportItem>[]
}

export interface ReportStrategy {
  generate(data: ReportData): string
}

const { formatRelative } = useTimeFormatter()
const SEPARATOR = '~~~~~~~~~~~~~~~~~~~~~~~~~~'

class BaseStrategy {
  protected formatHeader(report: Partial<Report>, title: string): string {
    const important = report.importance_flag ? '`【重要】` \n' : ''
    return `${important}\`${title}\`
${SEPARATOR}`
  }

  protected formatNotes(items: Partial<ReportItem>[]): string | null {
    const notes = items
      .filter((i) => i.item_type === 'note' && i.content && i.content.trim() !== '')
      .map((i) => i.content)
    if (notes.length === 0) return null
    return notes.map((note, index) => `${index + 1}. ${note}`).join('\n')
  }

  protected formatDeadline(date: string | null | undefined): string {
    if (!date) return '未設定期限'
    return formatRelative(date)
  }
}

class GeneralStrategy extends BaseStrategy implements ReportStrategy {
  generate({ report, items }: ReportData): string {
    const lines: string[] = []
    lines.push(this.formatHeader(report, '【 案 件 通 報 】'))

    if (report.department) lines.push(`通報單位： ${report.department}`)
    lines.push(`案由： \`${report.subject}\``)
    lines.push(`期限： \`${this.formatDeadline(report.announced_due_at)}\``)
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

class MeetingStrategy extends BaseStrategy implements ReportStrategy {
  generate({ report, items }: ReportData): string {
    const lines: string[] = []
    lines.push(this.formatHeader(report, '【 案 件 通 報 】'))

    lines.push(`案由： \`${report.subject}\``)
    lines.push(`期限： \`${this.formatDeadline(report.announced_due_at)}\``)
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

class WeeklyStrategy extends BaseStrategy implements ReportStrategy {
  generate({ report, items }: ReportData): string {
    const lines: string[] = []
    lines.push(this.formatHeader(report, '【 案 件 通 報 】'))

    lines.push(`案由： \`${report.subject}\``)
    lines.push(`期限： \`${this.formatDeadline(report.announced_due_at)}\``)
    lines.push(SEPARATOR)

    lines.push('繳交方式：')
    lines.push('- 線上表單')
    lines.push(SEPARATOR)

    lines.push('詳細說明：')
    const link = items.find((i) => i.item_type === 'link')?.content
    lines.push(`1. 請至「${link || '尚未提供'}」 填妥本週週報內容。`)

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

class BriefingStrategy extends BaseStrategy implements ReportStrategy {
  generate({ report, items }: ReportData): string {
    const lines: string[] = []
    lines.push(this.formatHeader(report, '【 案 件 通 報 】'))

    lines.push('通報單位： 產發處處長')
    lines.push(`案由： \`${report.subject}\``)
    lines.push(`期限： \`${this.formatDeadline(report.announced_due_at)}\``)
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

class AnnouncementStrategy extends BaseStrategy implements ReportStrategy {
  generate({ report }: ReportData): string {
    const lines: string[] = []
    const important = report.importance_flag ? '`【重要】` \n' : ''
    lines.push(`${important}\`【 公 告 通 知 】\`\n`)

    lines.push(`標題： \`${report.subject}\`\n`)
    lines.push('內容：')
    lines.push(report.formatted_content || '無') // Announcement stores content in formatted_content or we use items

    return lines.join('\n')
  }
}

export const strategies: Record<TemplateType, ReportStrategy> = {
  general: new GeneralStrategy(),
  meeting: new MeetingStrategy(),
  weekly_report: new WeeklyStrategy(),
  briefing: new BriefingStrategy(),
  announcement: new AnnouncementStrategy(),
}
