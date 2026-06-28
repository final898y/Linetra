import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import ReportSearchInput from '@/components/common/ReportSearchInput.vue'

// keyword 是 module-level 的 ref，讓測試能直接觀察其值
const keyword = ref('')

vi.mock('@/composables/useReportFilters', () => ({
  useReportFilters: () => ({ keyword }),
}))

describe('ReportSearchInput.vue', () => {
  beforeEach(() => {
    keyword.value = ''
  })

  it('should render the search input and magnifying glass icon', () => {
    const wrapper = mount(ReportSearchInput)
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
  })

  it('should NOT show clear button when input is empty', () => {
    const wrapper = mount(ReportSearchInput)
    // X 按鈕只在有輸入值時顯示
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('should show clear button when input has a value', async () => {
    const wrapper = mount(ReportSearchInput)
    await wrapper.find('input').setValue('案件')
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('should clear the input and keyword when clear button is clicked', async () => {
    const wrapper = mount(ReportSearchInput)
    await wrapper.find('input').setValue('重要')
    expect(wrapper.find('button').exists()).toBe(true)

    await wrapper.find('button').trigger('click')

    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('')
    expect(keyword.value).toBe('')
  })

  it('should update keyword when external keyword ref is cleared', async () => {
    keyword.value = '外部設定'
    const wrapper = mount(ReportSearchInput)

    // 模擬外部（例如 clearFilters）清空 keyword
    keyword.value = ''
    await wrapper.vm.$nextTick()

    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('')
  })
})
