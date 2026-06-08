<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { isConfigured } from '@/api/supabase'
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

const authStore = useAuthStore()

onMounted(() => {
  if (isConfigured) {
    authStore.initialize()
  }
})
</script>

<template>
  <!-- Missing Configuration Error Screen -->
  <div
    v-if="!isConfigured"
    class="min-h-screen flex items-center justify-center bg-cream-bg p-6 text-center"
  >
    <div class="max-w-md bg-white border border-status-overdue/20 rounded-3xl p-10 shadow-xl">
      <div
        class="w-16 h-16 bg-status-overdue/10 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <ExclamationTriangleIcon class="size-10 text-status-overdue" />
      </div>
      <h1 class="text-2xl font-black text-cream-text mb-4">環境變數缺失</h1>
      <p class="text-cream-muted font-medium mb-8 leading-relaxed">
        偵測到缺少 Supabase 配置。請確認專案根目錄下的
        <code class="bg-cream-surface px-2 py-1 rounded text-status-overdue font-bold">.env</code>
        檔案包含正確的 URL 與 API Key。
      </p>
      <div class="bg-cream-surface rounded-2xl p-4 text-left text-xs font-mono space-y-2">
        <p class="text-cream-muted border-b border-cream-border pb-2 mb-2 font-bold uppercase">
          所需變數範例：
        </p>
        <p class="text-brand">VITE_SUPABASE_URL=...</p>
        <p class="text-brand">VITE_SUPABASE_PUBLISHABLE_KEY=...</p>
      </div>
    </div>
  </div>

  <template v-else>
    <div v-if="authStore.loading" class="min-h-screen flex items-center justify-center bg-cream-bg">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
    </div>
    <router-view v-else />
  </template>
</template>

<style>
/* Global styles if needed */
</style>
