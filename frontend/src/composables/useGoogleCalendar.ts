import { ref } from 'vue'

interface CalendarEventData {
  summary: string
  description?: string
  due: string
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
    new Promise<void>((resolve) => {
      if ((window as unknown as Record<string, unknown>).google) {
        resolve()
        return
      }
      const s = document.createElement('script')
      s.src = 'https://accounts.google.com/gsi/client'
      s.onload = () => resolve()
      document.head.appendChild(s)
    })

  const getToken = (clientId: string): Promise<string> =>
    new Promise<string>((resolve, reject) => {
      const g = (window as unknown as Record<string, unknown>).google as
        | { accounts: GoogleAccounts }
        | undefined
      if (!g) {
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
      await loadGIS()
      const token = await getToken(clientId)

      const body = {
        summary: event.summary,
        description: event.description || '',
        start: { date: event.due.split('T')[0] },
        end: { date: event.due.split('T')[0] },
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
      const data = await res.json()
      window.open(data.htmlLink, '_blank')
      alert('已建立日曆事件')
    } catch {
      alert('加入 Google 日曆失敗，請確認 API 設定是否正確')
    } finally {
      loading.value = false
    }
  }

  return { loading, addEvent }
}
