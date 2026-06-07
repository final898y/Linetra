import type { TemplateType } from '@/types/models'

export interface TemplateConfig {
  id: TemplateType
  name: string
  defaultSubject: string
  items: {
    item_type: 'submission_method' | 'detail' | 'note' | 'agenda' | 'link' | 'meeting_time'
    content: string
    isCustomizable?: boolean // 是否允許切換預設/自定義
  }[]
}

export const REPORT_TEMPLATES: Record<string, TemplateConfig> = {
  meeting: {
    id: 'meeting',
    name: '處務會議',
    defaultSubject: '處務會議資料填報',
    items: [
      {
        item_type: 'meeting_time',
        content: '明天(4/28)下午02:00',
        isCustomizable: true,
      },
      {
        item_type: 'link',
        content: 'https://docs.google.com/spreadsheets/d/1oaWz0Q3MNVgLg8vlyP4eTFUhvGQB2FImqHsTscltRpM/edit?gid=1569821820#gid=1569821820',
        isCustomizable: true,
      },
    ],
  },
  weekly_report: {
    id: 'weekly_report',
    name: '市長週報',
    defaultSubject: '本週市長週報',
    items: [
      {
        item_type: 'link',
        content: 'https://docs.google.com/spreadsheets/d/1oaWz0Q3MNVgLg8vlyP4eTFUhvGQB2FImqHsTscltRpM/edit?gid=1569821820#gid=1569821820',
        isCustomizable: true,
      },
    ],
  },
  briefing: {
    id: 'briefing',
    name: '市長面報',
    defaultSubject: '本周產業發展處市長面報簡報資料',
    items: [
      {
        item_type: 'agenda',
        content: '1. 風箏節目前進度\n2. 科技產業論壇籌辦進度',
      },
    ],
  },
}
