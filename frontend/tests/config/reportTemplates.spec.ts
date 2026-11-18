import { describe, expect, it } from 'vitest'
import { getReportBehavior, REPORT_TEMPLATES } from '@/config/reportTemplates'

describe('REPORT_TEMPLATES', () => {
  it('keeps each registry key aligned with its template id', () => {
    Object.entries(REPORT_TEMPLATES).forEach(([key, template]) => {
      expect(template.id).toBe(key)
    })
  })

  it('uses unique template ids and valid item definitions', () => {
    const templates = Object.values(REPORT_TEMPLATES)
    const ids = templates.map((template) => template.id)

    expect(new Set(ids).size).toBe(ids.length)

    templates.forEach((template) => {
      expect(template.name).toBeTruthy()
      expect(template.defaultSubject).toBeTruthy()
      expect(template.items.length).toBeGreaterThan(0)
      template.items.forEach((item) => {
        expect(item.item_type).toBeTruthy()
        expect(typeof item.content).toBe('string')
      })
    })
  })

  it('describes the special behavior of simple meetings', () => {
    expect(REPORT_TEMPLATES.meeting_simple.behavior).toEqual({
      showDepartment: false,
      showDueDates: false,
      calendarMode: 'meeting',
      initialStatus: 'completed',
    })
    expect(
      REPORT_TEMPLATES.meeting_simple.items
        .filter((item) => item.item_type.endsWith('_time'))
        .map((item) => item.inputType)
    ).toEqual(['datetime-local', 'datetime-local'])
  })

  it('defines lifecycle and calendar behavior for every template', () => {
    Object.values(REPORT_TEMPLATES).forEach((template) => {
      expect(template.behavior?.initialStatus).toBeDefined()
      expect(template.behavior?.calendarMode).toBeDefined()
    })
  })

  it('provides default downstream behavior for non-template report types', () => {
    expect(getReportBehavior('general')).toMatchObject({
      showDueDates: true,
      calendarMode: 'deadline',
    })
    expect(getReportBehavior('meeting_simple')).toMatchObject({
      showDueDates: false,
      calendarMode: 'meeting',
    })
  })
})
