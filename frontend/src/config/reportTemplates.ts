import type { ItemType, ReportStatus, ReportTemplateType, TemplateType } from '@/types/models'

export type TemplateInputType = 'text' | 'textarea' | 'datetime-local'

export interface TemplateBehavior {
  showDepartment?: boolean
  showDueDates?: boolean
  calendarMode?: 'none' | 'deadline' | 'meeting'
  initialStatus?: ReportStatus
}

export interface TemplateConfig {
  id: ReportTemplateType
  name: string
  defaultSubject: string
  defaultDepartment?: string
  defaultAnnouncedDueAt?: string
  behavior?: TemplateBehavior
  items: {
    item_type: ItemType
    content: string
    isCustomizable?: boolean // 是否允許切換預設/自定義
    inputType?: TemplateInputType
  }[]
}

export const REPORT_TEMPLATES: Record<ReportTemplateType, TemplateConfig> = {
  meeting: {
    id: 'meeting',
    name: '處務會議',
    defaultSubject: '處務會議資料填報',
    behavior: {
      showDepartment: false,
      showDueDates: true,
      calendarMode: 'deadline',
      initialStatus: 'completed',
    },
    items: [
      {
        item_type: 'meeting_time',
        content: '明天(4/28)下午02:00',
        isCustomizable: true,
      },
      {
        item_type: 'link',
        content:
          'https://docs.google.com/spreadsheets/d/1oaWz0Q3MNVgLg8vlyP4eTFUhvGQB2FImqHsTscltRpM/edit?gid=1569821820#gid=1569821820',
        isCustomizable: true,
      },
    ],
  },
  meeting_simple: {
    id: 'meeting_simple',
    name: '一般會議',
    defaultSubject: '會議通知',
    behavior: {
      showDepartment: false,
      showDueDates: false,
      calendarMode: 'meeting',
      initialStatus: 'completed',
    },
    items: [
      {
        item_type: 'meeting_time',
        content: '',
        isCustomizable: false,
        inputType: 'datetime-local',
      },
      {
        item_type: 'meeting_end_time',
        content: '',
        isCustomizable: false,
        inputType: 'datetime-local',
      },
      {
        item_type: 'location',
        content: '',
        isCustomizable: false,
      },
      {
        item_type: 'participants',
        content: '',
        isCustomizable: false,
      },
      {
        item_type: 'materials',
        content: '',
        isCustomizable: false,
      },
    ],
  },
  weekly_report: {
    id: 'weekly_report',
    name: '市長週報',
    defaultSubject: '本週市長週報',
    behavior: {
      showDepartment: false,
      showDueDates: true,
      calendarMode: 'deadline',
      initialStatus: 'completed',
    },
    items: [
      {
        item_type: 'link',
        content:
          'https://docs.google.com/spreadsheets/d/1oaWz0Q3MNVgLg8vlyP4eTFUhvGQB2FImqHsTscltRpM/edit?gid=1569821820#gid=1569821820',
        isCustomizable: true,
      },
    ],
  },
  briefing: {
    id: 'briefing',
    name: '市長面報',
    defaultSubject: '本周產業發展處市長面報簡報資料',
    behavior: {
      showDepartment: false,
      showDueDates: true,
      calendarMode: 'deadline',
      initialStatus: 'completed',
    },
    items: [
      {
        item_type: 'agenda',
        content: '1. 風箏節目前進度\n2. 科技產業論壇籌辦進度',
      },
    ],
  },
  youth_policy_update: {
    id: 'youth_policy_update',
    name: '青年政策及資源定期更新',
    defaultSubject: '定期更新本中心官網相關青年政策及資源',
    defaultDepartment: '新竹市青年發展中心115年9月21日竹市青年字第1150002864號',
    defaultAnnouncedDueAt: '2026-09-30T12:00',
    behavior: {
      showDepartment: true,
      showDueDates: true,
      calendarMode: 'deadline',
      initialStatus: 'pending',
    },
    items: [
      {
        item_type: 'submission_method',
        content: '線上表單',
        isCustomizable: false,
      },
      {
        item_type: 'detail',
        content:
          '如有新增相關青年政策及宣傳資源，請於本年9月30日（星期三）前逕上雲端表單（網址：https://reurl.cc/4YYMvK）填寫，如係原有政策內容異動請一併更新並填寫更新日期，過期資訊請於雲端表單中自行刪除。',
        isCustomizable: false,
      },
      {
        item_type: 'detail',
        content: '逾期未填報者，視為無辦理青年相關政策及資源',
        isCustomizable: false,
      },
    ],
  },
}

export const isReportTemplateType = (type: string): type is ReportTemplateType =>
  type in REPORT_TEMPLATES

const DEFAULT_REPORT_BEHAVIOR: TemplateBehavior = {
  showDepartment: true,
  showDueDates: true,
  calendarMode: 'deadline',
  initialStatus: 'pending',
}

export const getReportBehavior = (type: TemplateType): TemplateBehavior => ({
  ...DEFAULT_REPORT_BEHAVIOR,
  ...(isReportTemplateType(type) ? REPORT_TEMPLATES[type].behavior : {}),
})

export const REPORT_ITEM_LABELS: Record<string, string> = {
  submission_method: '繳交方式',
  detail: '內容說明',
  note: '備註項目',
  meeting_time: '會議時間',
  meeting_end_time: '結束時間',
  link: '雲端連結',
  agenda: '報告事項',
  location: '會議地點',
  participants: '參加人員',
  materials: '相關資料',
}
