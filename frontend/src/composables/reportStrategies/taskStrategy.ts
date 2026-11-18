import type { ReportData, ReportStrategy } from './types'
import { BaseStrategy, SEPARATOR } from './baseStrategy'

export class TaskStrategy extends BaseStrategy implements ReportStrategy {
  generate({ report }: ReportData): string {
    const lines: string[] = []
    lines.push('`【 臨 時 任 務 】`')
    lines.push(SEPARATOR)
    lines.push(`任務： \`${report.subject}\``)
    lines.push(`期限： \`${this.formatDetailedDeadline(report.announced_due_at)}\``)
    lines.push(SEPARATOR)

    return lines.join('\n')
  }
}
