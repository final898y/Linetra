---
title: Linetra -- 案件檢視功能與 SOLID 改善方案計畫書
version: v1.0
date: 2026-06-22
status: Active
author: Linetra Dev Team
---

| 屬性 (Metadata) | 內容 (Content) |
| :--- | :--- |
| **文件版本 (Version)** | `v1.0` |
| **最後更新 (Last Updated)** | 2026-06-22 |

# 案件檢視功能與資料庫 Schema 變更檢討及 SOLID 改善方案


由於前一次 Commit 調整了資料庫的 Schema（新增了一般會議 `meeting_simple` 模板，以及額外的項目類型：`location` 會議地點、`participants` 參加人員、`materials` 相關資料），我們針對現有檢視功能 `ReportCard.vue`、`ReportDetailView.vue` 進行檢討與問題分析。

---

## 1. 問題檢討與分析

### (1) `ReportDetailView.vue` 的欄位渲染與格式化缺失
- **標籤未中文化**：在顯示通報細節（`items`）時，程式碼直接輸出 `item.item_type` 作為標題：
  ```html
  <p class="text-[10px] font-bold text-cream-muted uppercase">{{ item.item_type }}</p>
  ```
  這會導致使用者在畫面上看到 `location`、`participants`、`materials`、`meeting_time` 等資料庫內部欄位名稱，而不是「會議地點」、「參加人員」、「相關資料」、「會議時間」等中文化標籤。
- **時間未格式化**：對於 `meeting_time`，資料庫中存儲的是 ISO 日期時間字串（例如 `2026-06-22T22:40`）。目前直接輸出 `item.content`，導致檢視頁面顯示原始的 `T` 分隔 ISO 格式字串，而非好讀的格式（如 `2026-06-22 (一) 22:40`）。
- **無期限案件的空白顯示**：`meeting_simple` 預設不要求輸入「對外期限」與「實際截止時間」，因此在 `ReportDetailView` 與 `ReportCard` 中，這兩個欄位會直接顯示為 `-`，這在不需要截止時間的案件中顯得累贅且不夠美觀。

### (2) 違反 SOLID 原則與單一來源 (Single Source of Truth, SSOT)
- 目前項目類型的中文 Label 映射邏輯（例如 `location` 轉 `會議地點`）定義在 `useReportForm.ts` 的 `getItemLabel` 函式中。
- `useReportForm.ts` 是一個**編輯/建立表單**專用的 Composable。如果 `ReportDetailView.vue` 為了顯示中文 Label 而導入 `useReportForm.ts`，將被迫承載不必要的表單狀態、驗證與提交邏輯。這違反了：
  - **單一職責原則 (Single Responsibility Principle, SRP)**：`useReportForm` 同時處理了「編輯狀態管理」與「項目屬性定義描述」。
  - **介面隔離原則 (Interface Segregation Principle, ISP)**：唯讀的檢視頁面不應該依賴包含編輯/寫入邏輯的龐大介面。
- 目前 `useReportStrategies.ts` 寫了 `meeting_time` 的時間格式化邏輯，但 `ReportDetailView.vue` 沒有共享該邏輯，導致程式碼重複且標準不一。

---

## 2. SOLID 改善方案設計 (方案 A)

我們採用 **方案 A (抽取獨立定義檔與共享 Formatter)**，來解決上述問題。

### 方案 A 詳細規劃
1. **定義統一的項目元數據 (SSOT)**：
   - 在 `frontend/src/config/reportTemplates.ts` 中，統一導出所有 `item_type` 的中文名稱對照表 `REPORT_ITEM_LABELS`，供 Form 頁面、Detail 頁面與 Strategy 共享。
2. **設計共享的格式化邏輯 (Shared Formatter)**：
   - 封裝一個 `useReportItemFormatter.ts` 提供 `formatItemContent(type, content)` 方法。當類型為 `meeting_time` 時自動調用 `dayjs` 進行人性化格式化，其餘項目直接回傳。
3. **優化檢視元件呈現**：
   - **`ReportDetailView.vue`**：
     - 使用共享的 `REPORT_ITEM_LABELS` 顯示中文化標籤。
     - 使用共享 Formatter 渲染項目內容，確保 `meeting_time` 的顯示格式與 LINE 產生的一致。
     - 若 `report.template_type === 'meeting_simple'`（或截止時間皆為 null），在畫面上隱藏「對外期限」與「實際截止」區塊。
   - **`ReportCard.vue`**：
     - 當 `announced_due_at` 為空且模板為 `meeting_simple` 時，隱藏「對外通知期限」區塊，避免顯示無意義的 `-`。
