<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const navigation = [
  { name: '案件看板', href: '/', icon: 'dashboard' },
  { name: '建立通報', href: '/reports/new', icon: 'add' },
  { name: '行事曆', href: '/calendar', icon: 'calendar' },
]

const handleSignOut = async () => {
  await authStore.signOut()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-cream-bg flex">
    <!-- Sidebar -->
    <aside
      class="w-64 bg-cream-surface border-r border-cream-border flex flex-col sticky top-0 h-screen"
    >
      <div class="p-6">
        <h1 class="text-2xl font-extrabold tracking-tightest text-cream-text">LINETRA</h1>
      </div>

      <nav class="flex-1 px-4 space-y-2 mt-4">
        <router-link
          v-for="item in navigation"
          :key="item.name"
          :to="item.href"
          class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all"
          :class="[
            $route.path === item.href
              ? 'bg-cream-bg text-brand border-r-2 border-brand shadow-sm shadow-cream-border/50'
              : 'text-cream-muted hover:bg-cream-hover hover:text-cream-text',
          ]"
        >
          {{ item.name }}
        </router-link>
      </nav>

      <div class="p-4 border-t border-cream-border">
        <div class="flex items-center gap-3 px-4 py-3">
          <img
            v-if="authStore.user?.user_metadata?.avatar_url"
            :src="authStore.user.user_metadata.avatar_url"
            class="w-8 h-8 rounded-full border border-cream-border"
          />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-bold text-cream-text truncate">
              {{ authStore.user?.user_metadata?.full_name || '使用者' }}
            </p>
          </div>
        </div>
        <button
          @click="handleSignOut"
          class="w-full mt-2 text-xs font-bold text-rose-500 hover:bg-rose-50 py-2 rounded-lg transition-colors"
        >
          登出系統
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col">
      <!-- Top Bar (Optional) -->
      <header
        class="h-16 bg-cream-bg/80 backdrop-blur-md border-b border-cream-border sticky top-0 z-10 px-8 flex items-center justify-between"
      >
        <div class="text-sm font-medium text-cream-muted">
          {{ $route.name === 'dashboard' ? '待辦案件清單' : '' }}
          {{ $route.name === 'report-create' ? '建立新通報' : '' }}
          {{ $route.name === 'calendar' ? '工作行事曆' : '' }}
        </div>
        <div class="flex items-center gap-4">
          <!-- Notification Placeholder -->
          <button
            class="w-8 h-8 rounded-full bg-cream-surface border border-cream-border flex items-center justify-center text-cream-muted"
          >
            <span class="text-xs">🔔</span>
          </button>
        </div>
      </header>

      <div class="p-8 max-w-7xl w-full mx-auto">
        <router-view />
      </div>
    </main>
  </div>
</template>
