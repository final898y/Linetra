import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/api/supabase'
import type {
  Report,
  ReportInsert,
  ReportItemInsert,
  ReportStatus,
  ReportItem,
} from '@/types/models'
import type { FilterOptions } from '@/composables/useReportFilters'

export const useReportStore = defineStore('report', () => {
  const reports = ref<Report[]>([])
  const loading = ref(false)

  const fetchReports = async (options?: FilterOptions) => {
    loading.value = true
    try {
      let query = supabase
        .from('reports')
        .select('*')
        .order('announced_due_at', { ascending: true })

      // 處理狀態多選 (若無選擇，預設排除 archived/deleted)
      if (options?.statuses && options.statuses.length > 0) {
        query = query.in('status', options.statuses)
      } else {
        query = query.not('status', 'in', '("archived","deleted")')
      }

      // 處理模板多選
      if (options?.templateTypes && options.templateTypes.length > 0) {
        query = query.in('template_type', options.templateTypes)
      }

      const { data, error } = await query
      if (error) throw error
      reports.value = (data as Report[]) || []
    } finally {
      loading.value = false
    }
  }

  const fetchReportById = async (id: string) => {
    const { data, error } = await supabase.from('reports').select('*').eq('id', id).single()
    if (error) throw error
    return data as Report
  }

  const fetchReportItemsById = async (reportId: string) => {
    const { data, error } = await supabase
      .from('report_items')
      .select('*')
      .eq('report_id', reportId)
      .order('sort_order', { ascending: true })
    if (error) throw error
    return data as ReportItem[]
  }

  const createReport = async (reportData: ReportInsert) => {
    const { data, error } = await supabase.from('reports').insert(reportData).select().single()

    if (error) throw error
    const newReport = data as Report
    if (newReport) {
      reports.value.unshift(newReport)
    }
    return newReport
  }

  const createReportItems = async (items: ReportItemInsert[]) => {
    const { error } = await supabase.from('report_items').insert(items)

    if (error) throw error
  }

  const updateStatus = async (id: string, status: ReportStatus) => {
    try {
      const { error } = await supabase.from('reports').update({ status }).eq('id', id)
      if (error) throw error

      const index = reports.value.findIndex((r) => r.id === id)
      if (index !== -1) {
        reports.value[index].status = status
      }
    } catch (error) {
      console.error('Error updating status:', error)
      throw error
    }
  }

  const updateReport = async (id: string, reportData: Partial<ReportInsert>) => {
    const { data, error } = await supabase
      .from('reports')
      .update(reportData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    const updatedReport = data as Report
    const index = reports.value.findIndex((r) => r.id === id)
    if (index !== -1 && updatedReport) {
      reports.value[index] = updatedReport
    }
    return updatedReport
  }

  const deleteReportItems = async (reportId: string) => {
    const { error } = await supabase.from('report_items').delete().eq('report_id', reportId)

    if (error) throw error
  }

  return {
    reports,
    loading,
    fetchReports,
    fetchReportById,
    fetchReportItemsById,
    createReport,
    updateReport,
    createReportItems,
    deleteReportItems,
    updateStatus,
  }
})
