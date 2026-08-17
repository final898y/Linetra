import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/api/supabase'
import type {
  DocumentTemplate,
  DocumentTemplateVersion,
  KeyNote,
  KeyNoteCategory,
  KeyNoteLink,
} from '@/types/models'

export type KeyNoteWithLinks = KeyNote & { key_note_links?: KeyNoteLink[] }

export const useKnowledgeStore = defineStore('knowledge', () => {
  const templates = ref<DocumentTemplate[]>([])
  const templateVersions = ref<DocumentTemplateVersion[]>([])
  const notes = ref<KeyNoteWithLinks[]>([])
  const loading = ref(false)

  const latestTemplateVersion = computed(() => {
    const latest = new Map<string, DocumentTemplateVersion>()
    templateVersions.value.forEach((version) => {
      const current = latest.get(version.template_id)
      if (!current || version.version_no > current.version_no) {
        latest.set(version.template_id, version)
      }
    })
    return latest
  })

  const fetchTemplates = async () => {
    loading.value = true
    try {
      const [
        { data: templateData, error: templateError },
        { data: versionData, error: versionError },
      ] = await Promise.all([
        supabase.from('document_templates').select('*').order('updated_at', { ascending: false }),
        supabase
          .from('document_template_versions')
          .select('*')
          .order('version_no', { ascending: false }),
      ])
      if (templateError) throw templateError
      if (versionError) throw versionError
      templates.value = (templateData as DocumentTemplate[]) || []
      templateVersions.value = (versionData as DocumentTemplateVersion[]) || []
    } finally {
      loading.value = false
    }
  }

  const createTemplate = async (input: {
    userId: string
    name: string
    category: string | null
    contentMarkdown: string
  }) => {
    const { data, error } = await supabase
      .from('document_templates')
      .insert({ user_id: input.userId, name: input.name, category: input.category })
      .select()
      .single()
    if (error) throw error

    const { error: versionError } = await supabase.from('document_template_versions').insert({
      template_id: data.id,
      version_no: 1,
      content_markdown: input.contentMarkdown,
      created_by: input.userId,
    })
    if (versionError) throw versionError
    await fetchTemplates()
    return data as DocumentTemplate
  }

  const updateTemplate = async (input: {
    id: string
    userId: string
    name: string
    category: string | null
    contentMarkdown: string
  }) => {
    const currentVersion = templateVersions.value
      .filter((version) => version.template_id === input.id)
      .reduce((max, version) => Math.max(max, version.version_no), 0)

    const { error: templateError } = await supabase
      .from('document_templates')
      .update({ name: input.name, category: input.category })
      .eq('id', input.id)
    if (templateError) throw templateError

    const { error: versionError } = await supabase.from('document_template_versions').insert({
      template_id: input.id,
      version_no: currentVersion + 1,
      content_markdown: input.contentMarkdown,
      created_by: input.userId,
    })
    if (versionError) throw versionError
    await fetchTemplates()
  }

  const archiveTemplate = async (id: string) => {
    const { error } = await supabase
      .from('document_templates')
      .update({ is_active: false })
      .eq('id', id)
    if (error) throw error
    const template = templates.value.find((item) => item.id === id)
    if (template) template.is_active = false
  }

  const fetchNotes = async (includeArchived = false) => {
    loading.value = true
    try {
      let query = supabase
        .from('key_notes')
        .select('*, key_note_links(*)')
        .order('is_pinned', { ascending: false })
        .order('sort_order', { ascending: true })
        .order('updated_at', { ascending: false })
      if (!includeArchived) query = query.eq('status', 'active')
      const { data, error } = await query
      if (error) throw error
      notes.value = (data as unknown as KeyNoteWithLinks[]) || []
    } finally {
      loading.value = false
    }
  }

  const createNote = async (input: {
    userId: string
    title: string
    category: KeyNoteCategory
    content: string
    isPinned: boolean
    sortOrder: number
    validFrom: string | null
    validUntil: string | null
    links: Array<{ label: string; url: string }>
  }) => {
    const { data, error } = await supabase
      .from('key_notes')
      .insert({
        user_id: input.userId,
        title: input.title,
        category: input.category,
        content: input.content,
        is_pinned: input.isPinned,
        sort_order: input.sortOrder,
        valid_from: input.validFrom,
        valid_until: input.validUntil,
      })
      .select()
      .single()
    if (error) throw error
    await replaceNoteLinks(data.id, input.links)
    await fetchNotes(true)
    return data as KeyNote
  }

  const updateNote = async (input: {
    id: string
    title: string
    category: KeyNoteCategory
    content: string
    isPinned: boolean
    sortOrder: number
    validFrom: string | null
    validUntil: string | null
    links: Array<{ label: string; url: string }>
  }) => {
    const { error } = await supabase
      .from('key_notes')
      .update({
        title: input.title,
        category: input.category,
        content: input.content,
        is_pinned: input.isPinned,
        sort_order: input.sortOrder,
        valid_from: input.validFrom,
        valid_until: input.validUntil,
      })
      .eq('id', input.id)
    if (error) throw error
    await replaceNoteLinks(input.id, input.links)
    await fetchNotes(true)
  }

  const archiveNote = async (id: string) => {
    const { error } = await supabase.from('key_notes').update({ status: 'archived' }).eq('id', id)
    if (error) throw error
    const note = notes.value.find((item) => item.id === id)
    if (note) note.status = 'archived'
  }

  const replaceNoteLinks = async (noteId: string, links: Array<{ label: string; url: string }>) => {
    const { error: deleteError } = await supabase
      .from('key_note_links')
      .delete()
      .eq('note_id', noteId)
    if (deleteError) throw deleteError
    if (links.length === 0) return
    const { error: insertError } = await supabase.from('key_note_links').insert(
      links.map((link, index) => ({
        note_id: noteId,
        label: link.label,
        url: link.url,
        sort_order: index,
      }))
    )
    if (insertError) throw insertError
  }

  return {
    templates,
    templateVersions,
    latestTemplateVersion,
    notes,
    loading,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    archiveTemplate,
    fetchNotes,
    createNote,
    updateNote,
    archiveNote,
  }
})
