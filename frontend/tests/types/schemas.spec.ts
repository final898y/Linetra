import { describe, expect, it } from 'vitest'
import { ItemType, TemplateType } from '@/types/models'
import { ItemTypeSchema, TemplateTypeSchema } from '@/types/schemas'

describe('report schemas', () => {
  it.each(Object.values(TemplateType))('accepts template type %s', (templateType) => {
    expect(TemplateTypeSchema.parse(templateType)).toBe(templateType)
  })

  it.each(Object.values(ItemType))('accepts item type %s', (itemType) => {
    expect(ItemTypeSchema.parse(itemType)).toBe(itemType)
  })
})
