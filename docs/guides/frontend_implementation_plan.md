---
title: Linetra — 前端實作詳細計畫 (Frontend Implementation Plan)
version: v1.0
date: 2026-06-06
status: Active
author: Linetra Dev Team
---

# Linetra 前端實作詳細計畫 (Frontend Implementation Plan)

本文件根據 PRD (v2.0) 規劃前端應用的技術細節，包含路由、狀態管理、組件拆解及共享邏輯。

## 1. 路由配置 (Vue Router)

### 1.1 路由表 (`src/router/routes.ts`)

| 路徑 | 名稱 | 組件 | 權限 (Meta) | 說明 |
| :--- | :--- | :--- | :--- | :--- |
| `/login` | `login` | `LoginView.vue` | `guestOnly: true` | Google 登入頁 |
| `/` | `dashboard` | `DashboardView.vue` | `requiresAuth: true` | 首頁 (Pending List) |
| `/reports/new` | `report-create` | `ReportCreateView.vue` | `requiresAuth: true` | 建立通報 (含模板選擇) |
| `/reports/:id` | `report-detail` | `ReportDetailView.vue" | `requiresAuth: true` | 案件詳情與編輯 |
| `/calendar` | `calendar` | `CalendarView.vue` | `requiresAuth: true` | 行事曆檢視 |
| `/settings` | `settings` | `SettingsView.vue` | `requiresAuth: true` | 個人設定 |

### 1.2 導航守衛
*   **Auth Guard**: 檢查 `useAuthStore.session`。若無 session 且頁面標記為 `requiresAuth`，重定向至 `/login`。
*   **Guest Guard**: 若已有 session 且訪問 `/login`，重定向至 `/`。

---

## 2. 狀態管理 (Pinia Stores)

### 2.1 `useAuthStore`
*   **State**: `user`, `session`, `loading`.
*   **Actions**:
    *   `initialize()`: 初始化 Supabase Auth 監聽。
    *   `signInWithGoogle()`: 觸發 Google OAuth。
    *   `signOut()`: 清除 Session。

### 2.2 `useReportStore`
*   **State**: `reports[]`, `currentReport`, `filters`, `loading`.
*   **Actions**:
    *   `fetchReports(status)`: 從 Supabase 抓取案件清單。
    *   `createReport(data)`: 儲存新案件。
    *   `updateStatus(id, status)`: 更新狀態 (Pending -> Completed 等)。
    *   `archiveReport(id)`: 標記為封存。
*   **Getters**:
    *   `pendingReports`: 未完成且未過期。
    *   `overdueReports`: 已過期案件。
    *   `importantReports`: 標記為重要的案件。

### 2.3 `useUIStore`
*   **State**: `toasts[]`, `modals{}`.
*   **Actions**: `notify(message, type)`, `openModal(name, props)`.

---

## 3. 組合式邏輯 (Composables)

### 3.1 `useTimeFormatter`
*   實作 PRD 6.3 規範。
*   `formatRelative(date)`: 將日期轉為「今天下班前」、「下週二」等。
*   `getRemainingTimeColor(date)`: 根據剩餘時間回傳色碼。

### 3.2 `useReportTemplate`
*   封裝 T1-T5 模板的預設資料與產生邏輯。
*   `generateText(report, items)`: 產生 LINE 格式文字。

### 3.3 `useNotifications`
*   實作 PRD 16 章規範。
*   `requestPermission()`: 引導使用者授權。
*   `pushLocalNotification(title, body)`: 送出瀏覽器通知。

---

## 4. 目錄結構與職責

*   **`src/api/`**: 僅負責 Supabase 資料交互，不含業務邏輯。
*   **`src/views/`**: 容器組件，負責與 Store 交互並管理頁面佈局。
*   **`src/components/common/`**: 具體業務組件 (如 `ReportCard.vue`)。
*   **`src/components/base/`**: 高度可重用的原子組件 (如 `BaseButton.vue`)。

---

## 5. 實作優先順序 (Sprint 1)

1.  **Auth Layer**: 建立 `useAuthStore` 與 `/login` 頁面。
2.  **Layout**: 建立帶有側邊欄與頂部導覽的 `MainLayout`。
3.  **Basic CRUD**:
    *   `/reports/new` (T1 模板)。
    *   `/` (Pending List 基本卡片展示)。
4.  **Utils**: 實作 `useTimeFormatter` 確保時間顯示正確。
