import type { Report, ReportItem } from '@/types/models'

export interface ReportData {
  report: Partial<Report>
  items: Partial<ReportItem>[]
}

export interface ReportStrategy {
  generate(data: ReportData): string
}
