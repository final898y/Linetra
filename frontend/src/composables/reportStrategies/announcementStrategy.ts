import type { ReportData, ReportStrategy } from './types'
import { BaseStrategy } from './baseStrategy'

export class AnnouncementStrategy extends BaseStrategy implements ReportStrategy {
  generate({ report }: ReportData): string {
    const lines: string[] = []
    const important = report.importance_flag ? '`【重要】` \n' : ''
    lines.push(`${important}\`【 公 告 通 知 】\`\n`)

    lines.push(`標題： \`${report.subject}\`\n`)
    const content = report.formatted_content?.trim()
    if (content) {
      lines.push('內容：')
      lines.push(content)
    }

    return lines.join('\n')
  }
}
