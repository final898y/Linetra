import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/api/supabase', () => ({
  supabase: { from: vi.fn() },
}))

import { useKnowledgeStore } from './knowledge'

describe('knowledge store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('selects the highest version as the latest template version', () => {
    const store = useKnowledgeStore()
    store.templates = [
      {
        id: 'template-1',
        user_id: 'user-1',
        name: '公文',
        category: '通知',
        is_active: true,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
    ]
    store.templateVersions = [
      {
        id: 'v1',
        template_id: 'template-1',
        version_no: 1,
        content_markdown: '舊',
        created_by: 'user-1',
        created_at: '2026-01-01T00:00:00Z',
      },
      {
        id: 'v2',
        template_id: 'template-1',
        version_no: 2,
        content_markdown: '新',
        created_by: 'user-1',
        created_at: '2026-01-02T00:00:00Z',
      },
    ]

    expect(store.latestTemplateVersion.get('template-1')?.content_markdown).toBe('新')
  })
})
