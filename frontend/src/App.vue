<script setup lang="ts">
// 這是基本首頁，展示雙色調佈局與組件規範
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- 頂部導覽列 (Cream Navigation) -->
    <nav
      class="sticky top-0 z-50 bg-cream-bg/90 backdrop-blur-xl border-b border-cream-border px-6 py-4"
    >
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <h1 class="text-2xl font-extrabold tracking-tightest text-cream-text">LINETRA</h1>
        <div class="flex gap-6 items-center">
          <a
            href="#"
            class="text-sm font-medium text-cream-muted hover:text-brand transition-colors"
            >案件看板</a
          >
          <a
            href="#"
            class="text-sm font-medium text-cream-muted hover:text-brand transition-colors"
            >數據統計</a
          >
          <button
            class="bg-cream-text text-dark-text px-5 py-2 rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            建立報表
          </button>
        </div>
      </div>
    </nav>

    <main class="flex-1">
      <!-- 淺色區段 (Cream Section): 歡迎與數據概覽 -->
      <section class="bg-cream-bg px-6 py-12 lg:py-16">
        <div class="max-w-7xl mx-auto">
          <div class="mb-12">
            <h2 class="text-4xl lg:text-5xl font-extrabold tracking-tightest text-cream-text mb-4">
              Hello, Linetra Dev
            </h2>
            <p class="text-lg text-cream-muted max-w-2xl">
              這是 Linetra 的前端基礎框架，已整合雙色調視覺規範與 Tailwind CSS。
            </p>
          </div>

          <!-- Metric 看板卡片 -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              class="bg-cream-surface border border-cream-border rounded-2xl p-6 hover:bg-cream-hover transition-all"
            >
              <p class="text-4xl font-bold tracking-tight text-cream-text tabular-nums">42</p>
              <p class="text-xs font-medium tracking-widest uppercase text-cream-muted mt-2">
                本週待辦案件
              </p>
            </div>
            <div
              class="bg-cream-surface border border-cream-border rounded-2xl p-6 hover:bg-cream-hover transition-all"
            >
              <p class="text-4xl font-bold tracking-tight text-status-overdue tabular-nums">05</p>
              <p class="text-xs font-medium tracking-widest uppercase text-cream-muted mt-2">
                已逾期案件
              </p>
            </div>
            <div
              class="bg-cream-surface border border-cream-border rounded-2xl p-6 hover:bg-cream-hover transition-all"
            >
              <p class="text-4xl font-bold tracking-tight text-status-completed tabular-nums">
                128
              </p>
              <p class="text-xs font-medium tracking-widest uppercase text-cream-muted mt-2">
                本月完成總數
              </p>
            </div>
            <div
              class="bg-cream-surface border border-cream-border rounded-2xl p-6 hover:bg-cream-hover transition-all"
            >
              <p class="text-4xl font-bold tracking-tight text-brand tabular-nums">98%</p>
              <p class="text-xs font-medium tracking-widest uppercase text-cream-muted mt-2">
                準時回報率
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- 深色區段 (Dark Section): 快速動作或狀態 -->
      <section class="bg-dark-bg px-6 py-12 lg:py-20 text-dark-text">
        <div class="max-w-7xl mx-auto">
          <div class="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <span
                class="inline-block px-3 py-1 bg-brand/15 text-brand text-xs font-bold tracking-widest uppercase rounded-full border border-brand/20 mb-4"
              >
                Dashboard Overview
              </span>
              <h2 class="text-3xl lg:text-4xl font-extrabold tracking-tightest">即時看板數據</h2>
            </div>
            <button
              class="bg-brand text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-hover transition-colors shadow-lg shadow-brand/20"
            >
              進入全螢幕模式
            </button>
          </div>

          <!-- 深色資料卡 -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div
              v-for="i in 3"
              :key="i"
              class="bg-dark-surface border border-dark-border rounded-2xl p-6 hover:bg-dark-elevated transition-colors group"
            >
              <div class="flex justify-between items-start mb-6">
                <div
                  class="w-10 h-10 rounded-lg bg-dark-border flex items-center justify-center group-hover:bg-brand/20 transition-colors"
                >
                  <div class="w-2 h-2 rounded-full bg-brand"></div>
                </div>
                <span
                  class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-400/15 text-emerald-300 border border-emerald-400/25"
                >
                  已更新
                </span>
              </div>
              <h3 class="text-xl font-bold mb-2">系統模組 {{ i }}</h3>
              <p class="text-dark-muted text-sm leading-relaxed">
                這是深色區段的卡片樣式，參考 Throxy 的深色 UI 設計，帶有輕微的暖紫色調。
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 頁尾 -->
    <footer class="bg-cream-bg border-t border-cream-border px-6 py-8">
      <div class="max-w-7xl mx-auto flex justify-between items-center text-cream-muted text-sm">
        <p>© 2026 Linetra Project.</p>
        <p>Design inspired by Throxy</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* 局部樣式 */
</style>
