<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { PlusIcon } from '@heroicons/vue/24/outline'
import type { FABAction } from '@/composables/useFABActions'

defineProps<{
  items: FABAction[]
}>()

const open = ref(false)
const fabRef = ref<HTMLElement | null>(null)

const toggle = () => {
  open.value = !open.value
}

const handleAction = (action: FABAction) => {
  action.handler()
  open.value = false
}

const handleClickOutside = (e: MouseEvent) => {
  if (fabRef.value && !fabRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape') open.value = false
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
})
</script>

<template>
  <div ref="fabRef" class="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
    <TransitionGroup name="fab-action" tag="div" class="flex flex-col items-end gap-3">
      <button
        v-for="(action, index) in items"
        v-show="open"
        :key="action.label"
        :style="{ transitionDelay: `${index * 50}ms` }"
        class="flex items-center gap-3"
        @click="handleAction(action)"
      >
        <span
          class="px-3 py-1.5 bg-cream-surface border border-cream-border rounded-lg text-sm font-bold text-cream-text shadow-sm whitespace-nowrap"
        >
          {{ action.label }}
        </span>
        <span
          class="w-10 h-10 rounded-full bg-cream-surface border border-cream-border flex items-center justify-center shadow-sm text-cream-text hover:bg-cream-hover"
        >
          <component :is="action.icon" class="size-5" />
        </span>
      </button>
    </TransitionGroup>

    <button
      @click="toggle"
      class="w-14 h-14 rounded-full bg-brand text-white shadow-lg flex items-center justify-center hover:bg-brand-hover transition-transform duration-200"
      :class="{ 'rotate-45': open }"
    >
      <PlusIcon class="size-7" />
    </button>
  </div>
</template>

<style scoped>
.fab-action-enter-active {
  transition: all 0.2s ease-out;
}
.fab-action-leave-active {
  transition: all 0.15s ease-in;
}
.fab-action-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.fab-action-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
