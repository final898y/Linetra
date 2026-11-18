---
title: 整理 Architecture 與 Guides 文件分工
version: v1.0
date: 2026-11-19
status: Active
author: Linetra Dev Team
---

# 整理 Architecture 與 Guides 文件分工

## 變更原因

`docs/architecture/` 與 `docs/guides/` 原本混合了系統架構、操作手冊、功能規格、一次性 migration 與已完成的實作計畫，造成文件責任重疊、舊文件容易被誤認為目前規範，也使 AI 或開發者難以判斷哪一份文件是權威來源。

## 改動方向

1. 將穩定的系統、資料庫、前端分層與自動化設計集中到 `docs/architecture/`。
2. 將建置、操作、功能擴充與驗證流程保留在 `docs/guides/`。
3. 將已完成或已被取代的計畫與 migration 移到 `docs/guides/archive/`。
4. 將前端規格整併至 `project_architecture_guidelines.md`，避免產生兩份前端架構基準。
5. 用目錄 README 說明分類規則與文件索引。

## 異動檔案

### 新增

- `docs/architecture/README.md`
- `docs/guides/README.md`
- `docs/guides/archive/README.md`
- `docs/guides/archive/calendar_implementation_plan.md`
- `docs/guides/archive/database_migration_20260620_add_meeting_simple.md`
- `docs/guides/archive/dynamic_tagging_plan.md`
- `docs/guides/archive/fab_speed_dial_plan.md`
- `docs/guides/archive/frontend_implementation_plan.md`
- `docs/guides/archive/google_calendar_meeting_end_time_migration.md`
- `docs/guides/archive/report_view_refactoring_plan.md`
- `docs/guides/archive/search_implementation_plan.md`

### 更新

- `README.md`
- `docs/architecture/project_architecture_guidelines.md`
- `docs/guides/document_template_and_key_notes_lecture.md`
- `docs/guides/frontend_spec.md`
- `docs/guides/supabase_setup_guide.md`
- `docs/architecture/database_design.md`
- `docs/architecture/system_architecture.md`
- `docs/architecture/edge_functions_design.md`

### 移動或歸檔

- `calendar_implementation_plan.md`
- `database_migration_20260620_add_meeting_simple.md`
- `dynamic_tagging_plan.md`
- `fab_speed_dial_plan.md`
- `frontend_implementation_plan.md`
- `google_calendar_meeting_end_time_migration.md`
- `report_view_refactoring_plan.md`
- `search_implementation_plan.md`

原位置保留 redirect 文件的項目：

- `docs/guides/frontend_spec.md`
- `docs/guides/google_calendar_meeting_end_time_migration.md`

## 驗證

- 已確認 `README.md` 連結指向目前架構文件。
- 已確認 archive 文件保留歷史內容與 `status: Archived`。
- 已執行 `git diff --check`。
- 本次只有文件與路徑整理，未修改程式碼或遠端 Supabase。
