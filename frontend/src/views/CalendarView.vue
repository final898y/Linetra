<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useReportStore } from '@/stores/reports'
import { useCalendar } from '@/composables/useCalendar'
import CalendarDay from '@/components/common/CalendarDay.vue'
import CalendarDayModal from '@/components/common/CalendarDayModal.vue'
import { ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon } from '@heroicons/vue/24/outline'
import type { Report } from '@/types/models'

const reportStore = useReportStore()
const { currentDate, calendarDays, nextMonth, prevMonth, goToToday } = useCalendar()

const isModalOpen = ref(false)
const selectedDateReports = ref<Report[]>([])
const selectedDateTitle = ref('')

const openModal = (dateStr: string, reports: Report[]) => {
  if (reports.length === 0) return
  selectedDateTitle.value = dateStr
  selectedDateReports.value = reports as Report[]
  isModalOpen.value = true
}

const weekDays = ['週一', '週二', '週三', '週四', '週五', '週六', '週日']

onMounted(async () => {
  // 抓取所有案件（包含已完成與逾期，但不包含刪除）
  await reportStore.fetchReports({
    statuses: ['pending', 'completed', 'overdue', 'archived'],
    templateTypes: [],
    tags: [],
    sortOrder: 'asc',
    hideAnnouncements: false,
    hideCompleted: false,
  })
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-brand/10 rounded-xl">
          <CalendarDaysIcon class="size-6 text-brand" />
        </div>
        <div>
          <h2 class="text-3xl font-extrabold tracking-tightest text-cream-text">
            {{ currentDate.format('YYYY年 MM月') }}
          </h2>
        </div>
      </div>

      <div
        class="flex items-center gap-2 bg-cream-surface p-1 rounded-xl border border-cream-border"
      >
        <button
          @click="prevMonth"
          class="p-2 hover:bg-cream-bg rounded-lg text-cream-muted hover:text-brand transition-all"
        >
          <ChevronLeftIcon class="size-5" />
        </button>
        <button
          @click="goToToday"
          class="px-4 py-1.5 text-xs font-bold text-cream-text hover:bg-cream-bg rounded-lg transition-all"
        >
          今天
        </button>
        <button
          @click="nextMonth"
          class="p-2 hover:bg-cream-bg rounded-lg text-cream-muted hover:text-brand transition-all"
        >
          <ChevronRightIcon class="size-5" />
        </button>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div
      class="bg-cream-surface border-l border-t border-cream-border rounded-3xl overflow-hidden shadow-sm"
    >
      <!-- Week Headers -->
      <div class="grid grid-cols-7 bg-cream-bg/30 border-b border-cream-border">
        <div
          v-for="day in weekDays"
          :key="day"
          class="py-3 text-center text-[10px] font-bold text-cream-muted uppercase tracking-widest"
        >
          {{ day }}
        </div>
      </div>

      <!-- Days Grid -->
      <div class="grid grid-cols-7">
        <div
          v-for="day in calendarDays"
          :key="day.date.toString()"
          class="relative cursor-pointer"
          @click="
            openModal(
              day.date.format('YYYY-MM-DD'),
              reportStore.reportsByDate.get(day.date.format('YYYY-MM-DD')) || []
            )
          "
        >
          <CalendarDay
            :day="day"
            :reports="
              (reportStore.reportsByDate.get(day.date.format('YYYY-MM-DD')) || []) as Report[]
            "
          />
        </div>
      </div>
    </div>

    <CalendarDayModal
      :date="selectedDateTitle"
      :reports="selectedDateReports"
      :is-open="isModalOpen"
      @close="isModalOpen = false"
    />

    <!-- Mobile Footer Info -->
    <div class="block md:hidden text-center text-[10px] text-cream-muted italic">
      ※ 點擊日期格子可查看當日待辦清單
    </div>
  </div>
</template>

<style scoped>
/* 確保網格線條完整 */
.grid > div:nth-child(7n) {
  border-right: none;
}
</style>
