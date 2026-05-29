# Linetra

### 專業 LINE 通報與期限追蹤管理平台 (Professional LINE Report & Deadline Tracking System)

| 屬性 (Metadata)             | 內容 (Content)             |
| :-------------------------- | :------------------------- |
| **專案版本 (Version)**      | `v1.0 (MVP)`               |
| **開發狀態 (Status)**       | 開發中 (In Development)    |
| **建立日期 (Created Date)** | 2026-05-24                 |
| **最後更新 (Last Updated)** | 2026-05-29                 |
| **主要作者 (Author)**       | Linetra Dev Team           |
| **授權條款 (License)**      | [MIT License](LICENSE)     |

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

---

## 核心功能 (Key Features)

- **標準化通報產生器 (Standardized Report Generator)**：提供 5 種行政專用模板（一般案件、處務會議、市長週報、面報、公告通知），一鍵產生格式化文字。
- **雙重期限管理 (Dual-Deadline Management)**：同時管理「真實截止時間 (Actual Due)」與「對外通知期限 (Announced Due)」，符合行政實務需求。
- **案件生命週期追蹤 (Case Lifecycle Tracking)**：透過狀態機 (State Machine) 管理案件，包含待辦 (Pending)、已完成 (Completed)、逾期 (Overdue) 及封存 (Archived)。
- **智慧提醒系統 (Rule-based Reminder System)**：基於瀏覽器通知 (Browser Notification)，在期限到達前自動觸發提醒，降低案件遺漏風險。
- **視覺化管理 (Visual Management)**：提供待辦清單 (Pending List) 與行事曆視圖 (Calendar View)，直覺掌握工作負荷。

## 技術架構 (Technical Architecture - Zero-Cost Serverless)

本專案採用 **Serverless / BaaS** 架構，以達成個人使用的「零成本維護」目標。

- **前端 (Frontend)**: Vue 3 (Vite + TypeScript) + Tailwind CSS
- **託管平台 (Hosting)**: Vercel / Cloudflare Pages (靜態託管)
- **後端與資料庫 (BaaS)**: **Supabase**
  - **Auth**: Google OAuth 2.0 (50,000 MAU)
  - **Database**: PostgreSQL with Row Level Security (RLS)
  - **Edge Functions**: Deno (處理 Cron Jobs / 逾期掃描)
  - **Storage**: (未來擴充附件管理使用)


## 核心術語 (Glossary)

| 術語             | 英文對應            | 定義                                       |
| :--------------- | :------------------ | :----------------------------------------- |
| **通報**         | **Report**          | 發送至 LINE 群組的行政通知文字             |
| **案件**         | **Case / Record**   | 系統中被儲存並持續追蹤的紀錄實體           |
| **真實截止時間** | **Actual Due**      | 最終、不可逾越的硬性截止時間               |
| **對外通知期限** | **Announced Due**   | 對下屬單位公告的期限，通常早於真實截止時間 |
| **重要旗標**     | **Importance Flag** | 標記為重要案件，觸發 `@All 【重要】` 前綴  |

## 快速開始 (Getting Started)

1. **Git Hooks 安裝**: 
   ```powershell
   powershell.exe -NoProfile -ExecutionPolicy Bypass -File tools/git-hooks/install_hooks.ps1 -Force
   ```
2. **環境變數設定**: 複製 `.env.example` 並填入憑證。
3. **後續步驟**: 待後續開發環境建置指南更新。

---

## 開發者與版本資訊 (Development Info)

- **版本**: v1.0 (MVP 階段)
- **授權**: [MIT License](LICENSE)
- **文件**: [產品需求文件 (PRD)](docs/product/prd.md)
