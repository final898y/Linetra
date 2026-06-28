<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { useReportFilters } from '@/composables/useReportFilters'

const { keyword } = useReportFilters()
const localValue = ref(keyword.value)

// 監聽外部 keyword 的變更（例如：清除全部篩選時）
watch(
  () => keyword.value,
  (newVal) => {
    if (localValue.value !== newVal) {
      localValue.value = newVal || ''
    }
  }
)

let debounceTimer: number | null = null

watch(localValue, (newVal) => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  debounceTimer = window.setTimeout(() => {
    keyword.value = newVal
  }, 300)
})

onUnmounted(() => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
})

const handleClear = () => {
  localValue.value = ''
  keyword.value = ''
}
</script>

<template>
  <div class="relative w-full">
    <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
      <MagnifyingGlassIcon class="size-4 text-cream-muted" aria-hidden="true" />
    </div>
    <input
      v-model="localValue"
      type="text"
      placeholder="搜尋案件標題或描述..."
      class="block w-full rounded-xl border border-cream-border bg-cream-surface py-2 pl-9 pr-9 text-xs font-semibold text-cream-text placeholder:text-cream-muted focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none transition-all shadow-sm shadow-cream-border/20"
    />
    <button
      v-if="localValue"
      type="button"
      @click="handleClear"
      class="absolute inset-y-0 right-0 flex items-center pr-3 text-cream-muted hover:text-rose-500 transition-colors"
      title="清除搜尋"
    >
      <XMarkIcon class="size-4" aria-hidden="true" />
    </button>
  </div>
</template>
