import type { Report, ReportItem } from '@/types/models'
import { strategies } from './useReportStrategies'

export const useReportTemplate = () => {
  const generateLineText = (report: Partial<Report>, items: Partial<ReportItem>[]): string => {
    const type = report.template_type || 'general'
    const strategy = strategies[type]

    if (!strategy) {
      console.warn(`No strategy found for template type: ${type}`)
      return strategies.general.generate({ report, items })
    }

    return strategy.generate({ report, items })
  }

  return {
    generateLineText,
  }
}
