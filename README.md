# Linetra

### 專業 LINE 通報與期限追蹤管理平台 (Professional LINE Report & Deadline Tracking System)

| 屬性 (Metadata)             | 內容 (Content)          |
| :-------------------------- | :---------------------- |
| **專案版本 (Version)**      | `v1.3`                  |
| **開發狀態 (Status)**       | 開發中 (In Development) |
| **建立日期 (Created Date)** | 2026-05-24              |
| **最後更新 (Last Updated)** | 2026-07-29              |
| **主要作者 (Author)**       | Linetra Dev Team        |
| **授權條款 (License)**      | [MIT License](LICENSE)  |

---

Linetra 是一款專為行政承辦人設計的通報管理平台，旨在解決在 LINE 群組中進行案件通報時常見的「格式不一致」、「追蹤困難」以及「期限管理混亂」等痛點。透過標準化模板與智慧追蹤系統，將零散的訊息轉化為可管理的結構化資料。

## 專案文件 (Documentation)

- **[產品架構與規範指南 (Standard)](docs/guides/project_architecture_guidelines.md)**: 專案目錄結構、Git 分支與 Commit 規範。
- **[產品需求文件 (PRD)](docs/product/prd.md)**: 定義核心功能、狀態機與時間模型。
- **[系統架構設計 (Architecture)](docs/architecture/system_architecture.md)**: 基於 Supabase 的 Serverless 方案說明。
- **[資料庫設計 (Database Design)](docs/architecture/database_design.md)**: SQL Schema、RLS 政策與索引優化。
- **[自動化任務設計 (Edge Functions)](docs/architecture/edge_functions_design.md)**: 逾期掃描與提醒系統邏輯。
- **[前端開發規範 (Frontend Guide)](docs/guides/frontend_spec.md)**: Vue 3 專案結構、型別與模板引擎實作。
- **[視覺識別規範 (Visual Identity)](docs/product/visual_identity.md)**: 色彩計畫、字體與 Tailwind CSS 組件規範。
- **[Google Calendar 與一般會議結束時間更新指南](docs/guides/google_calendar_meeting_end_time_migration.md)**: 既有 Supabase 資料庫新增 `meeting_end_time` Enum 值的手動 SQL。

---

## 核心功能 (Key Features)

- **策略模式通報產生器 (Strategy-based Report Generator)**：提供 7 種行政專用模板（一般案件、處務會議、一般會議、市長週報、面報、公告通知、臨時任務），基於策略模式實現高度可擴充的格式化文字輸出與即時預覽。
- **雙重期限管理 (Dual-Deadline Management)**：同時管理「真實截止時間 (Actual Due)」與「對外通知期限 (Announced Due)」，內建自動跳過週末的期限計算邏輯。
- **一般會議與 Google Calendar**：一般會議以起訖時間建立定時日曆事件，未填結束時間時預設為 1 小時；其他案件以對外通知期限建立全天事件。
- **案件生命週期追蹤 (Case Lifecycle Tracking)**：完整的案件 CRUD 與狀態管理，支援待辦 (Pending)、已完成 (Completed)、已逾期 (Overdue) 等狀態切換。
- **多維度篩選與排序 (Advanced Filtering & Sorting)**：支援按類別、狀態進行多選篩選，並提供自定義排序與篩選偏好持久化功能 (LocalStorage)。
- **快速關鍵字搜尋 (Quick Keyword Search)**：看板頂部常駐搜尋框，對案件標題與描述進行模糊比對，內建 300 毫秒輸入防抖，可與篩選條件同時疊加運作。
- **響應式管理介面 (RWD Layout)**：全面支援行動裝置與桌機視圖，採用側邊抽屜式導覽與流體佈局，方便在手機上快速操作。
- **智慧提醒與視覺化 (Visualization)**：提供待辦清單 (Dashboard) 與詳情檢視，協助直覺掌握工作負荷。

## 技術架構 (Technical Architecture - Zero-Cost Serverless)

本專案採用 **Serverless / BaaS** 架構，以達成個人使用的「零成本維護」目標。

- **前端 (Frontend)**: Vue 3 (Vite + TypeScript) + Tailwind CSS v4
- **測試 (Testing)**: Vitest (Unit Testing)
- **託管平台 (Hosting)**: Vercel / Cloudflare Pages
- **後端與資料庫 (BaaS)**: **Supabase**
  - **Auth**: Google OAuth 2.0
  - **Database**: PostgreSQL with Row Level Security (RLS)
  - **Edge Functions**: Deno (處理逾期掃描)

## 核心術語 (Glossary)

| 術語             | 英文對應            | 定義                                       |
| :--------------- | :------------------ | :----------------------------------------- |
| **通報**         | **Report**          | 發送至 LINE 群組的行政通知文字             |
| **案件**         | **Case / Record**   | 系統中被儲存並持續追蹤的紀錄實體           |
| **真實截止時間** | **Actual Due**      | 最終、不可逾越的硬性截止時間               |
| **對外通知期限** | **Announced Due**   | 對下屬單位公告的期限，通常早於真實截止時間 |
| **重要旗標**     | **Importance Flag** | 標記為重要案件，觸發 `【重要】` 前綴       |

## 快速開始 (Getting Started)

1. **Git Hooks 安裝**:
   ```powershell
   powershell.exe -NoProfile -ExecutionPolicy Bypass -File tools/git-hooks/install_hooks.ps1 -Force
   ```
2. **環境變數設定**: 複製 `frontend/.env.example` 至 `frontend/.env` 並填入 Supabase 憑證；若使用 Google Calendar，另填入 OAuth Client ID。
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
   VITE_GOOGLE_CALENDAR_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
   ```
3. **安裝依賴並啟動前端**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. **執行測試**:
   ```bash
   npm run test
   ```

---

## 開發者與版本資訊 (Development Info)

- **版本**: v1.3
- **授權**: [MIT License](LICENSE)
- **文件**: [產品需求文件 (PRD)](docs/product/prd.md)
