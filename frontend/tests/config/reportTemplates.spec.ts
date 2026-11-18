import { describe, expect, it } from 'vitest'
import { REPORT_TEMPLATES } from '@/config/reportTemplates'

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
})
