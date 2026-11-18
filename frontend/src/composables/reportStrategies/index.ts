import type { TemplateType } from '@/types/models'
import type { ReportStrategy } from './types'
import { AnnouncementStrategy } from './announcementStrategy'
import { BriefingStrategy } from './briefingStrategy'
import { GeneralStrategy } from './generalStrategy'
import { MeetingSimpleStrategy } from './meetingSimpleStrategy'
import { MeetingStrategy } from './meetingStrategy'
import { TaskStrategy } from './taskStrategy'
import { WeeklyStrategy } from './weeklyStrategy'

export const strategies: Record<TemplateType, ReportStrategy> = {
  general: new GeneralStrategy(),
  meeting: new MeetingStrategy(),
  meeting_simple: new MeetingSimpleStrategy(),
  weekly_report: new WeeklyStrategy(),
  briefing: new BriefingStrategy(),
  announcement: new AnnouncementStrategy(),
  task: new TaskStrategy(),
}
