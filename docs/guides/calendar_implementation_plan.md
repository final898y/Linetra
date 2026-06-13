---
title: Linetra — 行事曆功能實作計畫 (Calendar Implementation Plan)
version: v1.0
date: 2026-06-14
status: Draft
author: Linetra Dev Team
---

# Linetra — 行事曆功能實作計畫 (Calendar Implementation Plan)

本文件詳述 Linetra 行事曆功能 (Calendar View) 的實作流程，旨在為承辦人提供直覺的「案件期限」視覺化追蹤介面。

## 1. 設計理念
*   **期限導向**：行事曆以「對外通知期限 (Announced Due)」作為主要標記點。
*   **狀態感知**：透過顏色區分案件狀態，一眼掌握急迫性。
*   **無縫切換**：提供月視圖網格，並支援點擊導覽至案件詳情。

## 2. 實作架構規劃 (SOLID 導向)

為了確保系統的可維護性與擴充性，我們遵循以下設計原則：

### 2.1 領域層 (Domain Logic - Composables)
建立 `src/composables/useCalendar.ts`，應用 **單一職責原則 (SRP)** 與 **相依反向原則 (DIP)**：
*   **純粹化日期邏輯**：該 Composable 僅負責日曆網格運算 (如：產生 42 天矩陣)，不直接依賴 `Report` 型別。它應接受一個抽象的「事件介面」。
*   **狀態管理**：
    *   `currentDate`: 目前檢視的月份基準日。
    *   `calendarDays`: 計算後的月網格陣列，包含日期物件與樣式中繼資料。
*   **介面解耦**：定義 `CalendarEvent` 介面，讓 `useCalendar` 能夠處理任何具備日期的資料。

### 2.2 資料與服務層 (Data & Service - Pinia Store)
更新 `src/stores/reports.ts`，應用 **介面隔離原則 (ISP)**：
*   **高效分組 (Grouping Logic)**：
    *   實作 `reportsByDate` 計算屬性 (Getter)，使用 `Map<string, Report[]>` 結構。
    *   **效能優化**：利用 Vue 3 的 `computed` 緩存機制，避免在日期切換時重複對全量資料進行分組運算。
*   **資料獲取**：
    *   `fetchCalendarRange(start, end)`：根據目前檢視範圍動態抓取資料，而非一次載入所有歷史紀錄 (符合大數據量處理標準)。

### 2.3 介面層 (UI Components - Open/Closed Principle)
*   **`CalendarView.vue` (容器組件)**：負責協調 Store 與 Composable。
*   **`CalendarDay.vue` (展示組件)**：僅負責渲染單一日期格。
*   **`CalendarEventTag.vue` (擴充組件)**：應用 **開閉原則 (OCP)**，根據案件類型或狀態，透過插槽 (Slot) 或動態組件渲染不同外觀，無需修改主網格邏輯。

---

## 3. 視覺與互動規範

### 3.1 狀態視覺 (Accessibility 考量)
除了顏色，我們加入圖示與文字標記以符合 **無障礙設計標準 (WCAG)**：

| 元素 | 狀態色 | 輔助標記 |
| :--- | :--- | :--- |
| **今日** | `bg-brand` | 圓形實色背景。 |
| **待辦 (Pending)** | `text-brand` | 預設標籤。 |
| **已完成 (Completed)** | `text-status-completed` | 加上 `[V]` 符號。 |
| **已逾期 (Overdue)** | `text-status-overdue` | 加上 `[!]` 符號與邊框警告。 |
| **重要 (Important)** | `border-l-2` | 標籤左側強調線。 |

### 3.2 響應式策略 (RWD)
*   **Desktop**: 網格內顯示完整的案件主旨 (Line-clamp 1)。
*   **Mobile**: 網格僅顯示顏色圓點與數量。點擊格後，於網格下方展開 **「當日行程列表」**，確保在小螢幕上仍具備高度可用性。

---

## 4. 實作與測試步驟 (TDD 導向)

### 第一階段：邏輯層開發
1.  **TDD 實作**：撰寫 `useCalendar.spec.ts`，定義各種邊界情況 (如：跨年、閏年)。
2.  開發 `useCalendar.ts`：實現日期矩陣生成演算法，確保固定回傳 42 天以維持 UI 佈局穩定。

### 第二階段：資料管道優化
1.  更新 `reportStore.ts`：實作 Map 結構的分組 Getter。
2.  **效能測試**：模擬 500+ 筆資料下的分組效能。

### 第三階段：元件組裝
1.  建立 `CalendarView` 骨架與 RWD 佈局。
2.  實作 `CalendarDay` 的渲染邏輯。
3.  **Slot 應用**：實作 `CalendarEventTag`，確保未來新增「任務」或「行程」時，不需更動日曆組件。

### 第四階段：無障礙與互動
1.  加入鍵盤導覽支援 (`Tab` 切換日期，`Enter` 查看詳情)。
2.  實作 `TransitionGroup` 月份切換平滑動畫。

## 5. 品質與效能指標
*   **LCP (Largest Contentful Paint)**: 行事曆網格首屏渲染應 < 1.5s。
*   **Maintainability**: 邏輯與 UI 分離度達 90% 以上。
*   **Reliability**: 日期計算邏輯單元測試覆蓋率 100%。

## 5. 驗證指標
*   [ ] 跨月切換日期計算正確。
*   [ ] 案件能正確對應至其 `announced_due_at` 的日期格子。
*   [ ] 標籤顏色正確反應案件狀態。
*   [ ] 在 4G 網路下渲染效能流暢 (利用 Computed 緩存)。
