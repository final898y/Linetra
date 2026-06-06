---
title: Linetra — 前端架構與實作規範 (Frontend Architecture & Specs)
version: v1.1
date: 2026-06-06
status: Active
author: Linetra Dev Team
---

# Linetra — 前端架構與實作規範 (Frontend Architecture & Specs)

本文件定義 Linetra 前端應用程式的技術架構、型別規範與實作細節。

| 屬性 (Metadata) | 內容 (Content) |
| :--- | :--- |
| **技術棧 (Tech Stack)** | Vue 3 (Composition API), Vite, TypeScript |
| **狀態管理 (State)** | Pinia |
| **路由 (Routing)** | Vue Router 4 |
| **樣式 (Styling)** | Tailwind CSS |
| **程式碼規範 (Linting)** | ESLint + Prettier |

---

## 1. 開發環境與工具配置 (Development Setup)

### 1.1 Vite 配置
*   使用 `@` 作為 `src` 目錄的別名 (Alias)。
*   開發伺服器預設埠位：`3000`。
*   啟用 `compression` 插件進行生產環境構建優化。

### 1.2 程式碼品質控制 (Linting & Formatting)
*   **ESLint**: 採用 `eslint-config-vue-typescript` 規範，嚴格執行 `no-explicit-any`。
*   **Prettier**: 
    *   `semi: false` (不使用分號)
    *   `singleQuote: true` (使用單引號)
    *   `printWidth: 100`
    *   `trailingComma: 'es5'`
*   **EditorConfig**: 統一縮進為 2 個空格。

---

## 2. 專案目錄結構 (Project Structure)

遵循模組化與職責分離原則：

```text
src/
├── api/            # Supabase Client 封裝與特定 API 呼叫 (Service Layer)
├── assets/         # 靜態資源 (Images, Global CSS)
├── components/     # 組件庫
│   ├── base/       # 原子組件 (BaseButton.vue, BaseInput.vue)
│   ├── layout/     # 佈局組件 (Navbar.vue, Sidebar.vue)
│   └── common/     # 業務通用組件 (CaseCard.vue, ReportForm.vue)
├── composables/    # 共享邏輯 (useAuth, useNotifications, useRelativeTime)
├── router/         # 路由配置 (index.ts, guards.ts)
├── stores/         # Pinia 狀態管理 (auth.ts, reports.ts)
├── types/          # TypeScript 型別定義 (database.types.ts, models.ts)
├── views/          # 頁面組件 (HomeView.vue, LoginView.vue)
├── utils/          # 工具函式 (formatters.ts, validators.ts)
└── App.vue         # 根組件
```

---

## 3. 路由設計 (Routing - Vue Router)

### 3.1 路由模組化
*   路徑命名：使用 `kebab-case` (例如 `/report-detail/:id`)。
*   懶加載 (Lazy Loading)：所有頁面組件應使用動態導入 `() => import('@/views/...')`。

### 3.2 導航守衛 (Navigation Guards)
*   `requiresAuth`: 需檢查 `useAuthStore` 中的 `session` 狀態。
*   `guestOnly`: 已登錄用戶訪問登錄頁時重定向至首頁。

---

## 4. 狀態管理 (State Management - Pinia)

### 4.1 核心 Store
*   **`useAuthStore`**: 管理用戶 Session、設定檔與權限。
*   **`useReportStore`**: 管理案件列表、篩選器與快取。
*   **`useUIStore`**: 管理全域 Modal、Toast 與 Loading 狀態。

### 4.2 實作規範
*   優先使用 `Setup Stores` 語法 (`defineStore('id', () => { ... })`) 以保持與 Composition API 一致。
*   禁止在組件中直接修改 Store 的 State，應透過 Actions 進行。

---

## 5. 樣式規範 (Styling - Tailwind CSS)

*   **實作優先**: 優先使用 Tailwind Utility Classes，減少撰寫自定義 CSS。
*   **命名慣例**: 若需自定義類別，遵循 BEM 規範。
*   **設計系統**: 在 `tailwind.config.js` 中定義 Linetra 品牌色系 (Primary, Secondary, Accent)。
*   **組件化**: 複雜的 Tailwind 組合應封裝成 Vue 組件，而非過度使用 `@apply`。

---

## 6. 組件開發規範 (Component Standards)

*   **SFC 結構**: 嚴格遵守 `<script setup lang="ts">` -> `<template>` -> `<style scoped>` 的順序。
*   **Props/Emits**: 
    *   使用 `defineProps<{ ... }>()` 定義具備型別的屬性。
    *   使用 `defineEmits<{ (e: 'change', id: number): void }>()` 定義事件。
*   **邏輯抽離**: 超過 100 行的業務邏輯應考慮抽離至 `composables/`。

---

## 7. 型別定義 (Type Definitions)

應利用 `supabase-js` 產生的型別為 Source of Truth：

```typescript
// src/types/models.ts
import type { Database } from './database.types';

export type Report = Database['public']['Tables']['reports']['Row'];
export type ReportInsert = Database['public']['Tables']['reports']['Insert'];
export type ReportItem = Database['public']['Tables']['report_items']['Row'];

export enum TemplateType {
  General = 'general',
  Meeting = 'meeting',
  Weekly = 'weekly_report',
  Briefing = 'briefing',
  Announcement = 'announcement'
}
```

---

## 8. 模板引擎設計 (Template Engine)

將 PRD 中的 T1-T5 邏輯封裝為獨立的服務層。

### 8.1 實作方式
```typescript
// src/utils/templateGenerator.ts
export const generateLineText = (report: Report, items: ReportItem[]): string => {
  const lines: string[] = [];
  // ... 實作邏輯 ...
  return lines.join('\n');
}
```

---

## 9. 時間處理與 UI/UX 規範

*   **時間儲存**: 一律使用 `ISO 8601 UTC`。
*   **時間顯示**: 使用 `dayjs` 處理時區與格式化。
*   **相對時間**: 實作 `useRelativeTime` composable。
*   **表單驗證**: 使用 `Vee-validate` + `Zod` 進行嚴格校驗。
*   **樂觀更新 (Optimistic UI)**: 提升操作流暢感。

---

## 10. API 與 Supabase Client

```typescript
// src/api/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```
建議所有的資料操作透過 `src/api/` 下的模組進行。
