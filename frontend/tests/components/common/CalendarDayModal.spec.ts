import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CalendarDayModal from '@/components/common/CalendarDayModal.vue'
import type { Report } from '@/types/models'

describe('CalendarDayModal.vue', () => {
  const mockReports: Report[] = [
    { id: '1', subject: 'Report 1', status: 'pending', department: 'Dept A' } as Report,
    { id: '2', subject: 'Report 2', status: 'completed', department: 'Dept B' } as Report,
  ]

  it('should render correctly when open', () => {
    const wrapper = mount(CalendarDayModal, {
      props: {
        date: '2026-06-14',
        reports: mockReports,
        isOpen: true,
      },
      global: {
        stubs: {
          RouterLink: {
            template: '<a :href="to"><slot /></a>',
            props: ['to']
          }
        },
      },
    })

    expect(wrapper.text()).toContain('2026-06-14 行程清單')
    expect(wrapper.text()).toContain('Report 1')
    expect(wrapper.text()).toContain('Report 2')
    const links = wrapper.findAll('a')
    expect(links.length).toBe(2)
  })

  it('should not render when isOpen is false', () => {
    const wrapper = mount(CalendarDayModal, {
      props: {
        date: '2026-06-14',
        reports: mockReports,
        isOpen: false,
      },
      global: {
        stubs: ['RouterLink'],
      },
    })

    expect(wrapper.find('.fixed').exists()).toBe(false)
  })

  it('should emit close event when overlay is clicked', async () => {
    const wrapper = mount(CalendarDayModal, {
      props: {
        date: '2026-06-14',
        reports: mockReports,
        isOpen: true,
      },
      global: {
        stubs: ['RouterLink'],
      },
    })

    await wrapper.find('.absolute.inset-0').trigger('click')
    expect(wrapper.emitted()).toHaveProperty('close')
  })
})
