<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  authStore.initialize()
})
</script>

<template>
  <div v-if="authStore.loading" class="min-h-screen flex items-center justify-center bg-cream-bg">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
  </div>
  <router-view v-else />
</template>

<style>
/* Global styles if needed */
</style>
