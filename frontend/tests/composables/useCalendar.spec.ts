import { describe, it, expect } from 'vitest'
import { useCalendar } from '@/composables/useCalendar'
import dayjs from 'dayjs'

describe('useCalendar', () => {
  it('should initialize with current month by default', () => {
    const { currentDate } = useCalendar()
    const now = dayjs()
    expect(currentDate.value.year()).toBe(now.year())
    expect(currentDate.value.month()).toBe(now.month())
  })

  it('should generate a 42-day matrix (6 weeks)', () => {
    const { calendarDays } = useCalendar()
    expect(calendarDays.value.length).toBe(42)
  })

  it('should navigate to next and previous month', () => {
    const { currentDate, nextMonth, prevMonth } = useCalendar()
    const initialMonth = currentDate.value.month()
    
    nextMonth()
    expect(currentDate.value.month()).toBe((initialMonth + 1) % 12)
    
    prevMonth()
    expect(currentDate.value.month()).toBe(initialMonth)
  })

  it('should correctly identify today', () => {
    const { isToday } = useCalendar()
    expect(isToday(dayjs())).toBe(true)
    expect(isToday(dayjs().add(1, 'day'))).toBe(false)
  })

  it('should generate correct dates for a specific month (e.g., June 2026)', () => {
    // 2026/06/01 是週一
    // 預期矩陣第一天應該是 2026/06/01 (或是 2026/05/31 如果週日開始)
    // 這裡我們預設週一開始
    const specificDate = dayjs('2026-06-01')
    const { currentDate, calendarDays } = useCalendar()
    
    currentDate.value = specificDate
    
    // 第一天應該是 2026-06-01 (因為 6/1 剛好是週一)
    expect(calendarDays.value[0].date.format('YYYY-MM-DD')).toBe('2026-06-01')
    expect(calendarDays.value[0].isCurrentMonth).toBe(true)
    
    // 最後一天應該是 2026-07-12 (42天後)
    expect(calendarDays.value[41].date.format('YYYY-MM-DD')).toBe('2026-07-12')
    expect(calendarDays.value[41].isCurrentMonth).toBe(false)
  })

  it('should handle leap years correctly (Feb 2024)', () => {
    const specificDate = dayjs('2024-02-01')
    const { currentDate, calendarDays } = useCalendar()
    currentDate.value = specificDate
    
    const feb29 = calendarDays.value.find(d => d.date.format('MM-DD') === '02-29')
    expect(feb29).toBeDefined()
    expect(feb29?.isCurrentMonth).toBe(true)
  })
})
