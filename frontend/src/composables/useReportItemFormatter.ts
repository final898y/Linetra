import dayjs from 'dayjs'

const WEEKDAY_MAP: Record<number, string> = {
  0: '日',
  1: '一',
  2: '二',
  3: '三',
  4: '四',
  5: '五',
  6: '六',
}

export const formatMeetingTime = (raw: string): string => {
  if (!raw || raw.trim() === '') return ''
  const parsed = dayjs(raw)
  // Check if it looks like an ISO string or a date string that is valid
  // If it's something like "明天下午" dayjs might treat it as invalid, or maybe valid depending on browser.
  // isValid() checks dayjs validity.
  if (!parsed.isValid() || isNaN(parsed.date())) return raw
  const weekday = WEEKDAY_MAP[parsed.day()]
  return parsed.format(`YYYY-MM-DD (${weekday}) HH:mm`)
}

export const useReportItemFormatter = () => {
  const formatItemContent = (itemType: string, content: string): string => {
    if (!content) return ''
    if (itemType === 'meeting_time') {
      return formatMeetingTime(content)
    }
    return content
  }

  return {
    formatMeetingTime,
    formatItemContent,
  }
}
