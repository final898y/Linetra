---
title: 看板快速關鍵字搜尋功能設計與實作規劃
version: v1.1
date: 2026-06-28
status: Active
author: Antigravity
---

| 屬性 (Metadata) | 內容 (Content) |
| :--- | :--- |
| **文件版本 (Version)** | `v1.1` |
| **最後更新 (Last Updated)** | 2026-06-28 |

# 看板快速關鍵字搜尋功能設計與實作規劃

本文件詳細規劃了 Linetra 專案中「案件看板」常駐快速搜尋功能的設計與實作。本設計遵循 SOLID 原則，以確保系統的可擴充性、低耦合度及易於維護性。

## 設計理念與 SOLID 原則應用

### 1. 單一職責原則 (SRP)
*   **狀態與邏輯分離**：
    *   狀態管理：`useReportFilters.ts` 僅負責定義與維護篩選及搜尋條件的狀態（例如 `keyword`、`statuses`、`tags`）。
    *   資料獲取：`useReportStore.ts` 負責將這些搜尋與篩選狀態轉換為 Supabase 查詢，並執行資料請求。
    *   UI 元件：新增的 `ReportSearchInput.vue` 僅負責搜尋框的文字輸入、外觀樣式及防抖動 (Debounce) 處理，不涉及 API 呼叫。
    *   看板頁面：`DashboardView.vue` 負責頁面佈局與調度，不直接處理輸入細節。

### 2. 開放/封閉原則 (OCP)
*   **搜尋條件的擴充性**：
    *   搜尋與篩選參數統一封裝於 `FilterOptions` 介面中。
    *   若未來需要擴充搜尋範圍（例如：新增以「建立者名稱」或「留言內容」搜尋），僅需在 `FilterOptions` 與 `fetchReports` 中新增對應的 Supabase 查詢條件，而不需要修改既有的元件結構與核心狀態流程。

### 3. 介面隔離原則 (ISP)
*   **Composables 的精確暴露**：
    *   `useReportFilters` 提供解構導出的方式，讓僅需要搜尋關鍵字的元件（例如 `ReportSearchInput.vue`）與僅需要篩選條件的元件（例如 `ReportFilterPanel.vue`）各自取得所需的屬性，而不會強迫元件依賴其不需要的屬性或方法。

### 4. 依賴反轉原則 (DIP)
*   **組件間的低耦合**：
    *   UI 元件（`DashboardView.vue` 等）不直接依賴於 Supabase 用戶端或具體的儲存庫實作，而是依賴於 Pinia Store 提供的 `fetchReports` 方法以及 Composable 提供的狀態介面。這使得 UI 與資料來源解耦，利於未來進行單元測試與功能抽換。

---

## 實作細節規劃

### 1. 狀態與輔助函式層 (Composables)
檔案路徑：`frontend/src/composables/useReportFilters.ts`

*   **新增關鍵字屬性**：
    在 `FilterOptions` 介面中新增可選的 `keyword?: string`。
*   **搜尋狀態變數**：
    宣告 `const keyword = ref('')`。
*   **生命週期管理**：
    在 `clearFilters` 函式中，新增 `keyword.value = ''`，以確保點擊「清除全部」時搜尋條件一併被重設。
    *註：考量到搜尋關鍵字通常是臨時性操作，因此不將 keyword 寫入 localStorage 持久化，以避免使用者重新開啟頁面時仍殘留舊的關鍵字，造成混淆。*

### 2. 資料訪問層 (Pinia Store)
檔案路徑：`frontend/src/stores/reports.ts`

*   **查詢字串串接**：
    在 `fetchReports` 函式中，當偵測到 `options.keyword` 存在且不為空字串時，在 Supabase 查詢物件上附加條件：
    使用 `.or('subject.ilike.%' + keyword + '%,remarks.ilike.%' + keyword + '%')`。
    這可實現對「案件標題 (`subject`)」與「備註 (`remarks`)」的模糊比對搜尋。

    > **注意欄位名稱**：`reports` 資料表的文字可搜尋欄位為 `subject`、`remarks`、`formatted_content`、`department`。
    > 目前搜尋範圍設定為 `subject` 與 `remarks` 兩欄，若未來需擴充至其他欄位，不需修改元件，僅需對此處的 `.or()` 條件新增對應欄位即可。

### 3. 新增 UI 組件 (ReportSearchInput)
檔案路徑：`frontend/src/components/common/ReportSearchInput.vue`

*   **職責描述**：
    *   渲染搜尋輸入框。
    *   內置 Lodash-es 或原生 JS 實作的防抖動 (Debounce) 功能（預設為 300 毫秒）。
    *   當使用者停止輸入達指定時間後，將變更寫入 `keyword` 狀態或拋出事件，從而觸發資料重新獲取。
    *   提供一鍵清除關鍵字的按鈕（X 圖示）。

### 4. 看板整合 (DashboardView)
檔案路徑：`frontend/src/views/DashboardView.vue`

*   **佈局調整**：
    在看板頁面頂部採用兩列式佈局：第一列為標題與常駐搜尋框，第二列為篩選操作按鈕群靠右對齊。
*   **副作用監聽 (Watch)**：
    將 `keyword` 加入到 watch 列表中。當關鍵字發生改變時，自動呼叫 `reportStore.fetchReports(filterOptions.value)` 重新載入列表。

---

## 影響範圍與檔案變更

### 1. 修改 `frontend/src/composables/useReportFilters.ts`
*   新增 `keyword` 的 `ref`。
*   更新 `FilterOptions` 介面。
*   修改 `clearFilters` 邏輯。

### 2. 修改 `frontend/src/stores/reports.ts`
*   在 `fetchReports` 內部讀取 `options?.keyword`，並套用 Supabase 的 `or` 模糊篩選條件。

### 3. 新增 `frontend/src/components/common/ReportSearchInput.vue`
*   實作防抖搜尋輸入框。
*   使用 `@input` 觸發防抖防重複調用。

### 4. 修改 `frontend/src/views/DashboardView.vue`
*   引入 `ReportSearchInput`。
*   將 `keyword` 綁定至監聽事件中，以實作自動重新整理列表。

---

## 驗證與測試計畫

### 1. 功能性驗證
*   **基本搜尋**：輸入存在於標題 (`subject`) 的文字，驗證列表是否即時（且僅有防抖延遲）篩選出正確物件。
*   **備註搜尋**：輸入僅存在於備註 (`remarks`) 中的關鍵字，驗證是否能正確搜出該案件。
*   **清除重設**：
    *   點擊輸入框右側的清除按鈕，確認輸入值變為空字串，且列表重置。
    *   點擊篩選面板內的「清除全部」，確認搜尋框的內容被清空，且列表重設。
*   **複合篩選**：同時輸入關鍵字並在篩選面板勾選特定狀態（例如「待辦」），確認查詢結果同時符合兩項條件。

### 2. 效能與異常處理驗證
*   **防抖驗證**：在快速輸入字串時（如連續鍵入 10 個字），觀察網路請求面板 (Network Panel)，確認是否只發出一次 Supabase 請求。
*   **特殊字元處理**：輸入特殊字元（例如 `%`, `_`, `'`, `\` 等），確認 Supabase 查詢不會拋出異常且能正確處理轉義。
