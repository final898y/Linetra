---
title: Linetra 公文範本與重點記事功能規格
version: v1.2
date: 2026-11-19
status: Active
author: Linetra Dev Team
---

# Linetra 公文範本與重點記事功能規格

> 本文件描述公文範本與重點記事的產品語意、使用流程與驗收規則。資料表、欄位、RLS、index、trigger 與 foreign key 不在此文件維護，請統一參考 [database_design.md](../architecture/database_design.md)；Supabase 建置操作請參考 [supabase_setup_guide.md](supabase_setup_guide.md)。

## 1. 功能邊界

公文範本與案件通報是不同功能：

| 功能 | 主要資料表 | 用途 |
| --- | --- | --- |
| 案件通報 | `reports`、`report_items` | 追蹤案件、期限、狀態與通報內容 |
| 公文範本 | `document_templates`、`document_template_versions` | 儲存可重複使用的 Markdown 範本與版本 |
| 重點記事 | `key_notes`、`key_note_links` | 儲存流程內規、長官要求、提醒與網站記事 |

公文範本不應加入 `reports.template_type`。案件模板類型與公文範本是不同的領域概念，混用會讓案件查詢、狀態流程與篩選語意變得不清楚。

## 2. 公文範本規則

### 2.1 範本主檔與版本

- `document_templates` 代表一個可管理的範本。
- `document_template_versions` 儲存不可覆寫的 Markdown 版本。
- 同一範本的 `version_no` 必須唯一且可排序。
- 更新範本時建立新版本，不直接覆蓋既有版本。
- `is_active = false` 的範本不應出現在預設可選清單。
- 範本與版本均屬於建立者，版本權限需透過範本 owner 驗證。

### 2.2 Markdown 內容

範本內容應保留可讀的 Markdown，並使用明確的 placeholder，例如：

```md
通報單位：{{department}}
案由：{{subject}}
期限：{{actual_due_at}}
```

placeholder 的替換規則應由前端或專責 formatter 統一處理，不應在資料庫 policy 中實作文字格式化。

### 2.3 版本驗收

- 新增範本時建立第一個版本。
- 編輯範本後版本號遞增。
- 讀取範本時能取得目前啟用版本。
- 舊版本仍可查詢，不因更新而消失。
- 不同使用者不能讀取或修改其他使用者的範本與版本。

## 3. 重點記事規則

### 3.1 記事分類

`key_notes.category` 目前使用以下 enum：

- `procedure`：流程與作業規則
- `leader_instruction`：長官交辦或指示
- `reminder`：提醒事項
- `website`：網站、政策或外部資源記事

### 3.2 記事狀態與有效期間

- `active`：目前可使用的記事。
- `archived`：保留歷史紀錄但不列入預設清單。
- `valid_from`、`valid_until` 使用日期，不是 timestamp。
- 有效期間若同時存在，應符合 `valid_from <= valid_until`。
- `is_pinned` 與 `sort_order` 控制清單顯示順序。

### 3.3 網站連結

一則記事可有多個 `key_note_links`，每個連結包含：

- `label`
- `url`
- `sort_order`

連結屬於記事，不能獨立脫離 `key_notes` 存在。刪除記事時，子連結依 foreign key cascade 一併處理。

## 4. 使用流程

### 4.1 建立公文範本

1. 使用者輸入範本名稱與分類。
2. 系統建立 `document_templates` 主檔。
3. 系統建立第一個 `document_template_versions`。
4. 清單顯示啟用中的範本。

### 4.2 更新公文範本

1. 使用者開啟自己的範本。
2. 修改 Markdown 內容。
3. 系統建立下一個版本，不覆蓋舊版本。
4. 更新主檔的 `updated_at`。

### 4.3 建立重點記事

1. 使用者輸入標題、分類與內容。
2. 可設定置頂、有效期間與多個網站連結。
3. 系統建立 `key_notes` 與其 `key_note_links`。
4. 列表依 pinned、sort order 與更新時間顯示。

## 5. 權限與安全規則

目前 Supabase 已對相關資料表啟用 RLS：

- `document_templates`：依 `auth.uid() = user_id`。
- `document_template_versions`：透過父層 `document_templates.user_id` 驗證。
- `key_notes`：依 `auth.uid() = user_id`。
- `key_note_links`：透過父層 `key_notes.user_id` 驗證。

這些是目前遠端 policy 快照；完整 policy 定義與待確認事項請以 [database_design.md](../architecture/database_design.md) 為準。

## 6. 前端實作對應

目前前端主要實作位置：

| 能力 | 實作位置 |
| --- | --- |
| 資料查詢與寫入 | `frontend/src/stores/knowledge.ts` |
| 資料型別 | `frontend/src/types/database.types.ts`、`frontend/src/types/models.ts` |
| 重點記事畫面 | `frontend/src/views/KeyNotesView.vue` |
| Supabase client | `frontend/src/api/supabase.ts` |

## 7. 測試與驗收清單

- [ ] 新增範本會建立主檔與第一個版本。
- [ ] 編輯範本會遞增 `version_no`，且舊版本仍存在。
- [ ] 範本版本不能跨使用者讀寫。
- [ ] 新增記事可建立多個連結。
- [ ] 刪除記事時連結不會留下孤兒資料。
- [ ] `valid_from > valid_until` 會被拒絕。
- [ ] archived 記事不會出現在預設 active 清單。
- [ ] RLS 測試確認不同使用者無法讀寫彼此資料。
- [ ] store 測試覆蓋 Supabase 查詢錯誤與部分寫入失敗。

## 8. 文件維護規則

- 資料表、欄位、enum、constraint、RLS、index 或 trigger 變更：更新 [database_design.md](../architecture/database_design.md)。
- Supabase 建立、驗證或 migration 操作：更新 [supabase_setup_guide.md](supabase_setup_guide.md)。
- 產品流程、欄位語意或驗收條件變更：更新本文件。
- 每次 commit 前確認根目錄 `README.md` 與 `frontend/README.md` 是否需要同步更新，並依專案規範在 `docs/history/` 留下變更紀錄。
