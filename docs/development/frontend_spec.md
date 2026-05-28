---
title: Linetra — 前端架構與實作規範 (Frontend Architecture & Specs)
version: v1.0
date: 2026-05-29
status: Active
author: Linetra Dev Team
---

# Linetra — 前端架構與實作規範 (Frontend Architecture & Specs)

本文件定義 Linetra 前端應用程式 (Vue 3 + TypeScript) 的技術架構、型別規範與實作細節。

| 屬性 (Metadata) | 內容 (Content) |
| :--- | :--- |
| **文件版本 (Version)** | `v1.0` |
| **最後更新 (Last Updated)** | 2026-05-29 |
| **技術棧** | Vue 3, Vite, TypeScript, Pinia, Tailwind CSS |

---

## 1. 專案目錄結構 (Project Structure)

遵循模組化與職責分離原則：

```text
src/
├── api/            # Supabase Client 封裝與特定 API 呼叫
├── assets/         # 靜態資源 (Images, Global CSS)
├── components/     # 原子組件與公用組件 (BaseButton, BaseModal)
│   ├── layout/     # 佈局相關組件 (Navbar, Sidebar)
│   └── reports/    # 案件相關業務組件 (CaseCard, ReportForm)
├── composables/    # 共享邏輯 (useAuth, useNotifications, useRelativeTime)
├── stores/         # Pinia 狀態管理 (auth.ts, reports.ts, ui.ts)
├── types/          # TypeScript 型別定義 (database.types.ts, models.ts)
├── views/          # 頁面組件 (Home.vue, Login.vue, Calendar.vue)
└── utils/          # 工具函式 (formatters.ts, validators.ts)
```

---

## 2. 狀態管理 (State Management - Pinia)

### 2.1 `useAuthStore`
*   **State**: `user`, `session`, `loading`.
*   **Actions**: `signInWithGoogle()`, `signOut()`, `refreshUser()`.

### 2.2 `useReportStore`
*   **State**: `reports[]`, `currentReport`, `filters`.
*   **Actions**: `fetchReports()`, `createReport()`, `updateStatus()`, `deleteReport()`.
*   **Getters**: `pendingReports`, `overdueCount`, `calendarEvents`.

---

## 3. 型別定義 (Type Definitions)

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

## 4. 模板引擎設計 (Template Engine)

將 PRD 中的 T1-T5 邏輯封裝為獨立的服務層，不與 UI 耦合。

### 4.1 實作方式
```typescript
// src/utils/templateGenerator.ts
export const generateLineText = (report: Report, items: ReportItem[]): string => {
  const lines: string[] = [];
  
  // 1. 重要標記
  if (report.importance_flag) lines.push('@All 【重要】');
  
  // 2. 標題
  lines.push(report.template_type === 'announcement' ? '【 公 告 通 知 】' : '【 案 件 通 報 】');
  lines.push('~~~~~~~~~~~~~~~~~~~~~~~~~~');

  // 3. 根據模板類型插入特定欄位 (Switch Case)
  // ... 實作各模板邏輯 ...

  return lines.join('\n');
}
```

---

## 5. 時間處理規範 (Time Handling)

嚴格執行 PRD 第六章規範：
*   **儲存**: 一律轉為 `ISO 8601 UTC` 字串。
*   **顯示**: 使用 `dayjs` 或原生 `Intl` 轉換為使用者時區。
*   **相對時間**: 實作 `useRelativeTime` composable，將 `announced_due_at` 轉換為「今天下班前」、「下週二」等行政友善文字。

---

## 6. UI/UX 實作細節 (MVP)

*   **表單驗證**: 使用 `Vee-validate` 或簡單的 `ref` 綁定，落實 `announced_due < actual_due` 的警告機制。
*   **行事曆**: 使用 `FullCalendar` 或 `v-calendar` 整合，以 `announced_due_at` 為主要時間軸。
*   **通知授權**: 實作「延遲 3 秒」彈窗引導流程，防止瀏覽器預設封鎖。
*   **樂觀更新 (Optimistic UI)**: 在標記案件完成時，先更新本地 Store 狀態，同步發送 API，若失敗則回滾並彈出 Toast。

---

## 7. Supabase Client 封裝

```typescript
// src/api/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```
建議所有的資料操作透過 `src/api/` 下的模組進行，例如 `src/api/reports.ts`，以便於單元測試與 Mock。
