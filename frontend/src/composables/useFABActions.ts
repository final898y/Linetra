import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useReportStore } from '@/stores/reports'
import { useGoogleCalendar } from '@/composables/useGoogleCalendar'
import { PlusIcon, DocumentDuplicateIcon, CalendarDaysIcon } from '@heroicons/vue/24/outline'
import type { Component } from 'vue'

export interface FABAction {
  icon: Component
  label: string
  handler: () => void
}

export function useFABActions() {
  const route = useRoute()
  const router = useRouter()
  const reportStore = useReportStore()
  const { addEvent } = useGoogleCalendar()

  const actions = computed<FABAction[]>(() => {
    switch (route.name) {
      case 'report-detail': {
        const report = reportStore.currentReport
        return [
          {
            icon: DocumentDuplicateIcon,
            label: '複製通報內容',
            handler: async () => {
              if (!report) return
              const text = report.formatted_content
              if (!text) {
                alert('此案件無格式化內容')
                return
              }
              await navigator.clipboard.writeText(text)
              alert('已複製通報內容')
            },
          },
          {
            icon: CalendarDaysIcon,
            label: '加入 Google 日曆',
            handler: () => {
              if (!report) return
              const clientId = import.meta.env.VITE_GOOGLE_CALENDAR_CLIENT_ID
              if (!clientId) {
                alert('請先設定 Google Calendar Client ID')
                return
              }
              const meetingStart = reportStore.currentItems.find(
                (item) => item.item_type === 'meeting_time'
              )?.content
              const meetingEnd = reportStore.currentItems.find(
                (item) => item.item_type === 'meeting_end_time'
              )?.content
              if (report.template_type === 'meeting_simple' && !meetingStart) {
                alert('請先設定會議時間')
                return
              }
              addEvent(clientId, {
                summary: report.subject,
                description: report.formatted_content || '',
                startAt:
                  report.template_type === 'meeting_simple'
                    ? meetingStart!
                    : report.announced_due_at || report.actual_due_at || '',
                endAt: report.template_type === 'meeting_simple' ? meetingEnd : undefined,
                allDay: report.template_type !== 'meeting_simple',
              })
            },
          },
        ]
      }
      case 'dashboard':
      case 'calendar':
        return [
          {
            icon: PlusIcon,
            label: '建立新通報',
            handler: () => router.push('/reports/new'),
          },
        ]
      default:
        return []
    }
  })

  return { actions }
}
