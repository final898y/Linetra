<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter, useRoute } from 'vue-router'
import {
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  Squares2X2Icon,
  PlusIcon,
  CalendarIcon,
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const isMobileMenuOpen = ref(false)

const navigation = [
  { name: '案件看板', href: '/', icon: Squares2X2Icon },
  { name: '建立通報', href: '/reports/new', icon: PlusIcon },
  { name: '行事曆', href: '/calendar', icon: CalendarIcon },
]

const handleSignOut = async () => {
  await authStore.signOut()
  router.push('/login')
}

// 當路由改變時，自動關閉手機選單
watch(
  () => route.path,
  () => {
    isMobileMenuOpen.value = false
  }
)

// 監聽選單狀態，控制 body 滾動
watch(isMobileMenuOpen, (val) => {
  if (val) {
    document.body.classList.add('overflow-hidden')
  } else {
    document.body.classList.remove('overflow-hidden')
  }
})
</script>

<template>
  <div class="min-h-screen bg-cream-bg flex flex-col md:flex-row">
    <!-- Mobile Header -->
    <header
      class="md:hidden h-16 bg-cream-surface border-b border-cream-border px-4 flex items-center justify-between sticky top-0 z-30"
    >
      <div class="flex items-center gap-3">
        <button
          @click="isMobileMenuOpen = true"
          class="p-2 -ml-2 text-cream-text hover:bg-cream-hover rounded-lg transition-colors"
        >
          <Bars3Icon class="size-6" />
        </button>
        <h1 class="text-xl font-extrabold tracking-tightest text-cream-text">LINETRA</h1>
      </div>
      <div class="flex items-center gap-2">
        <img
          v-if="authStore.user?.user_metadata?.avatar_url"
          :src="authStore.user.user_metadata.avatar_url"
          class="w-8 h-8 rounded-full border border-cream-border"
        />
      </div>
    </header>

    <!-- Sidebar Backdrop (Mobile Only) -->
    <div
      v-if="isMobileMenuOpen"
      @click="isMobileMenuOpen = false"
      class="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
    ></div>

    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 w-72 bg-cream-surface border-r border-cream-border flex flex-col z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:w-64"
      :class="isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="p-6 flex items-center justify-between">
        <h1 class="text-2xl font-extrabold tracking-tightest text-cream-text">LINETRA</h1>
        <button
          @click="isMobileMenuOpen = false"
          class="md:hidden p-2 text-cream-muted hover:text-cream-text transition-colors"
        >
          <XMarkIcon class="size-6" />
        </button>
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
          <component :is="item.icon" class="size-5" />
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
    <main class="flex-1 flex flex-col min-w-0">
      <!-- Top Bar (Desktop Only) -->
      <header
        class="hidden md:flex h-16 bg-cream-bg/80 backdrop-blur-md border-b border-cream-border sticky top-0 z-10 px-8 items-center justify-between"
      >
        <div class="text-sm font-medium text-cream-muted uppercase tracking-wider">
          {{ $route.name === 'dashboard' ? '待辦案件清單' : '' }}
          {{ $route.name === 'report-create' ? '建立新通報' : '' }}
          {{ $route.name === 'calendar' ? '工作行事曆' : '' }}
        </div>
        <div class="flex items-center gap-4">
          <button
            class="w-8 h-8 rounded-full bg-cream-surface border border-cream-border flex items-center justify-center text-cream-muted hover:bg-cream-hover transition-colors"
          >
            <BellIcon class="size-5" />
          </button>
        </div>
      </header>

      <!-- Page Content -->
      <div class="p-4 md:p-8 max-w-7xl w-full mx-auto">
        <!-- Mobile Breadcrumb/Title if needed -->
        <div class="md:hidden mb-4 px-2">
          <h2 class="text-lg font-bold text-cream-text">
            {{ $route.name === 'dashboard' ? '待辦案件清單' : '' }}
            {{ $route.name === 'report-create' ? '建立新通報' : '' }}
            {{ $route.name === 'calendar' ? '工作行事曆' : '' }}
          </h2>
        </div>

        <router-view />
      </div>
    </main>
  </div>
</template>
