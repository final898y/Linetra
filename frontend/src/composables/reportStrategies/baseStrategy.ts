import type { Report, ReportItem } from '@/types/models'
import { useTimeFormatter } from '../useTimeFormatter'

const { formatDeadlineDetailed } = useTimeFormatter()
export const SEPARATOR = '~~~~~~~~~~~~~~~~~~~~~~'

export class BaseStrategy {
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

  protected formatDetailedDeadline(date: string | null | undefined): string {
    return formatDeadlineDetailed(date || null)
  }
}
