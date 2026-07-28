import { ref } from 'vue'
import dayjs from 'dayjs'

interface CalendarEventData {
  summary: string
  description?: string
  startAt: string
  endAt?: string
  allDay?: boolean
}

interface GoogleAccounts {
  oauth2: {
    initTokenClient: (config: {
      client_id: string
      scope: string
      callback: (response: { access_token?: string; error?: string }) => void
    }) => { requestAccessToken: () => void }
  }
}

interface TokenResponse {
  access_token?: string
  error?: string
}

export function useGoogleCalendar() {
  const loading = ref(false)

  const loadGIS = (): Promise<void> =>
    new Promise<void>((resolve, reject) => {
      if ((window as unknown as Record<string, unknown>).google) {
        resolve()
        return
      }
      const s = document.createElement('script')
      s.src = 'https://accounts.google.com/gsi/client'
      s.onload = () => resolve()
      s.onerror = () => reject(new Error('Failed to load Google Identity Services'))
      document.head.appendChild(s)
    })

  const getToken = (clientId: string): Promise<string> =>
    new Promise<string>((resolve, reject) => {
      const g = (window as unknown as Record<string, unknown>).google as
        | { accounts: GoogleAccounts }
        | undefined
      if (!g?.accounts?.oauth2) {
        reject(new Error('Google Identity Services not loaded'))
        return
      }
      const client = g.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/calendar.events',
        callback: (r: TokenResponse) =>
          r.access_token ? resolve(r.access_token) : reject(new Error(r.error || 'No token')),
      })
      client.requestAccessToken()
    })

  const addEvent = async (clientId: string, event: CalendarEventData) => {
    loading.value = true
    try {
      const startAt = dayjs(event.startAt)
      if (!startAt.isValid()) throw new Error('Invalid event start date')

      await loadGIS()
      const token = await getToken(clientId)
      const body = {
        summary: event.summary,
        description: event.description || '',
        ...(event.allDay
          ? {
              start: { date: startAt.format('YYYY-MM-DD') },
              end: { date: startAt.add(1, 'day').format('YYYY-MM-DD') },
            }
          : (() => {
              const endAt = event.endAt ? dayjs(event.endAt) : startAt.add(1, 'hour')
              if (!endAt.isValid() || !endAt.isAfter(startAt)) {
                throw new Error('Invalid event end date')
              }
              return {
                start: { dateTime: startAt.format('YYYY-MM-DDTHH:mm:ssZ') },
                end: { dateTime: endAt.format('YYYY-MM-DDTHH:mm:ssZ') },
              }
            })()),
      }

      const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error('Calendar API error')
      const data = (await res.json()) as { htmlLink?: string }
      if (data.htmlLink) window.open(data.htmlLink, '_blank')
      alert('已建立日曆事件')
    } catch (error) {
      console.error('Failed to add Google Calendar event:', error)
      alert('加入 Google 日曆失敗，請確認 API 設定是否正確')
    } finally {
      loading.value = false
    }
  }

  return { loading, addEvent }
}
