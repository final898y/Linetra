import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'

export interface CalendarDay {
  date: Dayjs
  isCurrentMonth: boolean
  isToday: boolean
}

export const useCalendar = () => {
  const currentDate = ref(dayjs().startOf('month'))

  const nextMonth = () => {
    currentDate.value = currentDate.value.add(1, 'month')
  }

  const prevMonth = () => {
    currentDate.value = currentDate.value.subtract(1, 'month')
  }

  const goToToday = () => {
    currentDate.value = dayjs().startOf('month')
  }

  const isToday = (date: Dayjs) => {
    return date.isSame(dayjs(), 'day')
  }

  const calendarDays = computed<CalendarDay[]>(() => {
    const days: CalendarDay[] = []

    // 找出目前月份的第一天
    const firstDayOfMonth = currentDate.value.startOf('month')

    // 找出該月第一天是週幾 (0 為週日, 1 為週一...)
    // 我們預設週一為一週的第一天
    let startDay: number = firstDayOfMonth.day()
    if (startDay === 0) startDay = 7 // 週日轉為 7

    // 計算需要往前補幾天 (為了從週一開始)
    const paddingDays = startDay - 1

    // 矩陣起點日期
    const startDate = firstDayOfMonth.subtract(paddingDays, 'day')

    // 產生 42 天 (6 週)
    for (let i = 0; i < 42; i++) {
      const date = startDate.add(i, 'day')
      days.push({
        date,
        isCurrentMonth: date.isSame(currentDate.value, 'month'),
        isToday: isToday(date),
      })
    }

    return days
  })

  return {
    currentDate,
    calendarDays,
    nextMonth,
    prevMonth,
    goToToday,
    isToday,
  }
}
