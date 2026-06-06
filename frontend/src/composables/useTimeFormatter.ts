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

    if (target.isBefore(now)) {
      const days = now.diff(target, 'day')
      return days === 0 ? '今天已過期' : `已逾期 ${days} 天`
    }

    const timeStr = target.format('HH:mm')
    const weekStr = target.format('週dd')

    if (diffDays === 0) {
      if (timeStr === '12:00') return '今天中午前'
      if (timeStr >= '17:00' && timeStr <= '18:00') return '今天下班前'
      return `今天 ${timeStr} 前`
    }

    if (diffDays === 1) {
      return `明天（${weekStr}）${timeStr} 前`
    }

    if (diffDays >= 2 && diffDays <= 6) {
      return `下${weekStr} ${timeStr} 前`
    }

    return `${target.format('MM/DD')}（${weekStr}）${timeStr} 前`
  }

  const getRemainingTimeColor = (dateStr: string | null, isCompleted: boolean): string => {
    if (isCompleted) return 'text-status-archived'
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
