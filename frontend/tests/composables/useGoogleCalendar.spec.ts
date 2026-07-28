import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useGoogleCalendar } from '@/composables/useGoogleCalendar'

const initTokenClient = vi.fn()
const requestAccessToken = vi.fn()
const fetchMock = vi.fn()

const setGoogle = () => {
  Object.assign(window, {
    google: {
      accounts: {
        oauth2: { initTokenClient },
      },
    },
  })
}

describe('useGoogleCalendar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setGoogle()
    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal('alert', vi.fn())
    vi.stubGlobal('open', vi.fn())
    initTokenClient.mockImplementation((config) => {
      requestAccessToken.mockImplementation(() => config.callback({ access_token: 'token' }))
      return { requestAccessToken }
    })
    fetchMock.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ htmlLink: 'https://calendar.google.com/event' }),
    })
  })

  it('creates a one-day all-day event for a tracked report deadline', async () => {
    const { addEvent, loading } = useGoogleCalendar()

    await addEvent('client-id', {
      summary: '測試案件',
      description: '測試說明',
      startAt: '2026-08-05',
      allDay: true,
    })

    expect(fetchMock).toHaveBeenCalledOnce()
    const request = fetchMock.mock.calls[0][1]
    expect(JSON.parse(request.body)).toMatchObject({
      start: { date: '2026-08-05' },
      end: { date: '2026-08-06' },
    })
    expect(window.open).toHaveBeenCalledWith('https://calendar.google.com/event', '_blank')
    expect(loading.value).toBe(false)
  })

  it('defaults a meeting event to one hour when no end time is supplied', async () => {
    const { addEvent } = useGoogleCalendar()

    await addEvent('client-id', {
      summary: '一般會議',
      startAt: '2026-08-05T10:00',
    })

    const request = fetchMock.mock.calls[0][1]
    expect(JSON.parse(request.body)).toMatchObject({
      start: { dateTime: expect.stringContaining('T10:00:00') },
      end: { dateTime: expect.stringContaining('T11:00:00') },
    })
  })

  it('uses the supplied meeting end time', async () => {
    const { addEvent } = useGoogleCalendar()

    await addEvent('client-id', {
      summary: '一般會議',
      startAt: '2026-08-05T10:00',
      endAt: '2026-08-05T11:30',
    })

    const request = fetchMock.mock.calls[0][1]
    expect(JSON.parse(request.body)).toMatchObject({
      end: { dateTime: expect.stringContaining('T11:30:00') },
    })
  })

  it('rejects a missing start time before requesting an OAuth token', async () => {
    const { addEvent } = useGoogleCalendar()

    await addEvent('client-id', { summary: '無時間案件', startAt: '' })

    expect(initTokenClient).not.toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
    expect(window.alert).toHaveBeenCalledWith('加入 Google 日曆失敗，請確認 API 設定是否正確')
  })

  it('clears loading and reports an error when GIS fails to load', async () => {
    delete (window as Window & { google?: unknown }).google
    const appendChild = vi
      .spyOn(document.head, 'appendChild')
      .mockImplementation((node) => {
        node.dispatchEvent(new Event('error'))
        return node
      })
    const { addEvent, loading } = useGoogleCalendar()
    await addEvent('client-id', { summary: '測試案件', startAt: '2026-08-05' })

    expect(window.alert).toHaveBeenCalledWith('加入 Google 日曆失敗，請確認 API 設定是否正確')
    expect(loading.value).toBe(false)
    appendChild.mockRestore()
  })
})
