import { ref, reactive, computed, watch } from 'vue'
import { REPORT_TEMPLATES } from '@/config/reportTemplates'
import { COMMON_TAGS } from '@/config/reportTypes'
import type { ReportItemInsert, TemplateType, ReportStatus, ReportInsert } from '@/types/models'
import { useReportTemplate } from '@/composables/useReportTemplate'

export const useReportForm = () => {
  const { generateLineText } = useReportTemplate()

  // State
  const tabs = [
    { id: 'general', name: '一般模式' },
    { id: 'template', name: '模板模式' },
    { id: 'announcement', name: '公告模式' },
    { id: 'task', name: '任務模式' },
  ] as const

  const activeTab = ref<(typeof tabs)[number]['id']>('general')
  const currentReportId = ref<string | null>(null)
  const currentTemplate = ref<TemplateType>('meeting')
  const useDefaultValue = reactive<Record<string, boolean>>({})
  const isInitializing = ref(false)

  const form = reactive({
    template_type: 'general' as TemplateType,
    department: '',
    subject: '',
    remarks: '',
    tags: [] as string[],
    actual_due_at: '',
    announced_due_at: '',
    importance_flag: false,
    status: 'pending' as ReportStatus,
  })

  const items = ref<Partial<ReportItemInsert & { isCustomizable?: boolean }>[]>([])

  // Logic
  const ITEM_ORDER_WEIGHTS: Record<string, number> = {
    submission_method: 10,
    detail: 20,
    meeting_time: 30,
    link: 40,
    agenda: 50,
    note: 100,
  }

  const sortedItems = computed(() => {
    return [...items.value]
      .map((item, originalIndex) => ({ item, originalIndex }))
      .sort((a, b) => {
        const weightA = ITEM_ORDER_WEIGHTS[a.item.item_type || ''] || 999
        const weightB = ITEM_ORDER_WEIGHTS[b.item.item_type || ''] || 999
        return weightA - weightB
      })
  })

  const applyTemplate = (type: TemplateType) => {
    const config = REPORT_TEMPLATES[type]
    if (!config) return

    form.template_type = type
    currentTemplate.value = type
    form.subject = config.defaultSubject

    items.value = config.items.map((item, idx) => {
      const key = `${type}_${item.item_type}`
      if (useDefaultValue[key] === undefined) useDefaultValue[key] = true
      const savedCustomValue = localStorage.getItem(`custom_val_${key}`)
      return {
        ...item,
        content: useDefaultValue[key] ? item.content : savedCustomValue || item.content,
        sort_order: idx + 1,
      }
    })
  }

  const updateMode = (tabId: (typeof tabs)[number]['id']) => {
    activeTab.value = tabId
    if (isInitializing.value) return

    if (tabId === 'general') {
      form.template_type = 'general'
      form.subject = ''
      items.value = [
        { item_type: 'submission_method', content: '紙本核章', sort_order: 1 },
        { item_type: 'detail', content: '', sort_order: 2 },
      ]
    } else if (tabId === 'template') {
      form.department = ''
      applyTemplate(currentTemplate.value)
    } else if (tabId === 'announcement') {
      form.template_type = 'announcement'
      form.subject = ''
      form.department = ''
      items.value = [{ item_type: 'detail', content: '', sort_order: 1 }]
    } else if (tabId === 'task') {
      form.template_type = 'task'
      form.subject = ''
      form.department = ''
      items.value = []
    }
  }

  const toggleDefault = (item: Partial<ReportItemInsert & { isCustomizable?: boolean }>) => {
    const key = `${currentTemplate.value}_${item.item_type}`
    useDefaultValue[key] = !useDefaultValue[key]
    if (useDefaultValue[key]) {
      const config = REPORT_TEMPLATES[currentTemplate.value]
      const original = config?.items.find((i) => i.item_type === item.item_type)
      if (original) item.content = original.content
    }
  }

  const addItem = (type: ReportItemInsert['item_type']) => {
    items.value.push({
      item_type: type,
      content: '',
      sort_order: items.value.length + 1,
    })
  }

  const removeItem = (index: number) => {
    items.value.splice(index, 1)
  }

  const previewText = computed(() => {
    const reportData: Partial<ReportInsert> = { ...form }
    if (form.template_type === 'announcement') {
      reportData.formatted_content =
        items.value.find((i) => i.item_type === 'detail')?.content || ''
    }
    return generateLineText(reportData, items.value as ReportItemInsert[])
  })

  // Watchers
  watch(
    items,
    (newItems) => {
      if (activeTab.value !== 'template') return
      const type = currentTemplate.value
      newItems.forEach((item) => {
        const key = `${type}_${item.item_type}`
        if (item.isCustomizable && !useDefaultValue[key]) {
          localStorage.setItem(`custom_val_${key}`, item.content || '')
        }
      })
    },
    { deep: true }
  )

  watch(activeTab, (newTab) => {
    updateMode(newTab)
  })

  watch(currentTemplate, (newType) => {
    if (isInitializing.value) return
    if (activeTab.value === 'template') {
      applyTemplate(newType)
    }
  })

  return {
    tabs,
    activeTab,
    currentReportId,
    currentTemplate,
    useDefaultValue,
    form,
    items,
    sortedItems,
    isInitializing,
    updateMode,
    applyTemplate,
    toggleDefault,
    addItem,
    removeItem,
    previewText,
    getItemLabel: (type: string) => {
      const labels: Record<string, string> = {
        submission_method: '繳交方式',
        detail: '內容說明',
        note: '備註項目',
        meeting_time: '會議時間',
        link: '雲端連結',
        agenda: '報告事項',
      }
      return labels[type] || '項目'
    },
    commonTags: COMMON_TAGS,
    toggleTag: (tag: string) => {
      const index = form.tags.indexOf(tag)
      if (index === -1) {
        form.tags.push(tag)
      } else {
        form.tags.splice(index, 1)
      }
    },
  }
}
