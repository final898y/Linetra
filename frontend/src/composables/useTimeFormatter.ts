import dayjs from 'dayjs'
import 'dayjs/locale/zh-tw'
import relativeTime from 'dayjs/plugin/relativeTime'
import calendar from 'dayjs/plugin/calendar'
import weekday from 'dayjs/plugin/weekday'

dayjs.extend(relativeTime)
dayjs.extend(calendar)
dayjs.extend(weekday)
dayjs.locale('zh-tw')

export const useTimeFormatter = () => {
  const formatRelative = (dateStr: string | null): string => {
    if (!dateStr) return '-'

    const now = dayjs()
    const target = dayjs(dateStr)
    const diffDays = target.startOf('day').diff(now.startOf('day'), 'day')

    // 判斷是否為同一個日曆週 (dayjs 預設週日為一週開始)
    const isSameWeek = target.isSame(now, 'week')
    const isNextWeek = target.isSame(now.add(1, 'week'), 'week')

    if (target.isBefore(now)) {
      const days = now.diff(target, 'day')
      return days === 0 ? '今天已過期' : `已逾期 ${days} 天`
    }

    const timeStr = target.format('HH:mm')
    const weekStr = target.format('週dd')
    const mmdd = target.format('MM/DD')

    if (diffDays === 0) {
      if (timeStr === '12:00') return `今天 ${mmdd}(${weekStr}) 中午前`
      if (timeStr >= '17:00' && timeStr <= '18:00') return `今天 ${mmdd}(${weekStr}) 下班前`
      return `今天 ${mmdd}(${weekStr}) ${timeStr} 前`
    }

    if (diffDays === 1) {
      return `明天 ${mmdd}(${weekStr}) ${timeStr} 前`
    }

    let prefix = ''
    if (isSameWeek) {
      prefix = '本週 '
    } else if (isNextWeek) {
      prefix = '下週 '
    }

    return `${prefix}${mmdd}(${weekStr}) ${timeStr} 前`
  }

  const getRemainingTimeColor = (dateStr: string | null, isNeutral: boolean): string => {
    if (isNeutral) return 'text-status-archived'
    if (!dateStr) return 'text-cream-muted'

    const now = dayjs()
    const target = dayjs(dateStr)
    const hoursDiff = target.diff(now, 'hour')

    if (hoursDiff < 0) return 'text-status-overdue'
    if (hoursDiff < 24) return 'text-status-overdue' // 24小時內也算紅色警示
    if (hoursDiff < 72) return 'text-status-warning' // 3天內橙色
    return 'text-status-completed' // 3天以上綠色
  }

  return {
    formatRelative,
    getRemainingTimeColor,
  }
}
