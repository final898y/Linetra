---
title: Linetra Guides 過時與歷史文件歸檔
version: v1.0
date: 2026-11-19
status: Active
author: Linetra Dev Team
---

# Guides 過時與歷史文件歸檔

本目錄保存已完成、已被現行架構取代，或不應再作為目前操作依據的 guide 與一次性 migration 文件。

## 歸檔規則

- `status: Archived` 的文件只供追溯歷史背景，不代表目前實作或正式操作步驟。
- 目前 schema、RLS、index、trigger 與 function 以 [database_design.md](../../architecture/database_design.md) 為準。
- 目前 Supabase 建置與驗證以 [supabase_setup_guide.md](../supabase_setup_guide.md) 為準。
- 目前前端架構與開發規範以 [project_architecture_guidelines.md](../../architecture/project_architecture_guidelines.md) 為準。
- 歸檔文件若要重新使用，必須先確認程式碼與 Supabase 遠端狀態，再建立新的現行文件或更新對應基準文件。

## 已歸檔文件

| 文件 | 歸檔原因 |
| --- | --- |
| `calendar_implementation_plan.md` | Calendar 功能已存在於前端實作，原計畫不再是目前操作指南 |
| `database_migration_20260620_add_meeting_simple.md` | 一次性 enum migration 歷史 |
| `dynamic_tagging_plan.md` | 標籤正規化計畫與目前 schema/實作已不完全一致 |
| `fab_speed_dial_plan.md` | FAB 功能已進入目前前端實作 |
| `frontend_implementation_plan.md` | 早期前端建置計畫，已由現行架構指南取代 |
| `google_calendar_meeting_end_time_migration.md` | 一次性 `meeting_end_time` enum migration 歷史 |
| `report_view_refactoring_plan.md` | 已完成的報告檢視重構計畫 |
| `search_implementation_plan.md` | 搜尋與篩選功能已進入目前前端實作 |
