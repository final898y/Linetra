---
title: Linetra Supabase 建置與驗證手冊
version: v1.3
date: 2026-11-19
status: Active
author: Linetra Dev Team
---

# Linetra Supabase 建置與驗證手冊

> 本文件是 Supabase 專案的建置、驗證與維運手冊，不是資料庫 schema 的第二份定義。資料表、欄位、enum、foreign key、index、trigger、function 與 RLS 的權威狀態，請以 [database_design.md](../architecture/database_design.md) 及正式 migration 為準。

## 1. 文件責任

| 文件 | 用途 |
| --- | --- |
| [database_design.md](../architecture/database_design.md) | 目前 Supabase schema、RLS 與資料庫設計的唯一基準 |
| 本文件 | 建立專案、設定環境、執行 migration 與驗證操作 |
| [document_template_and_key_notes_lecture.md](document_template_and_key_notes_lecture.md) | 公文範本與重點記事的功能規格 |
| `docs/guides/*migration*.md` | 單次 schema 變更的背景與執行紀錄 |

不要在本文件新增另一份長期維護的完整 `CREATE TABLE`、RLS 或 index 定義；若 schema 改變，應先更新 migration，再更新 `database_design.md`。

## 2. 目前環境狀態

目前 Supabase `public` schema 已包含：

- `users`
- `reports`
- `report_items`
- `tags`
- `report_tags`
- `document_templates`
- `document_template_versions`
- `key_notes`
- `key_note_links`

目前已完成的特別變更：

- `template_type` enum 已加入 `youth_policy_update`。
- 9 張 public table 已啟用 RLS。
- `reports`、`document_templates`、`key_notes` 已套用 `handle_updated_at()` trigger。

完整狀態與遠端快照請參考 [database_design.md](../architecture/database_design.md)。

## 3. 建立 Supabase 專案

1. 在 Supabase 建立專案。
2. 記錄 Project URL 與 publishable key。
3. 在 Authentication 中設定登入提供者與 redirect URL。
4. 不要將 service role key 放入前端環境變數、repository 或文件。
5. 將本機 `.env` 設定為：

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
```

前端 client 入口為 `frontend/src/api/supabase.ts`。前端只應使用 publishable key，資料權限由 Auth session 與 PostgreSQL RLS 控制。

## 4. Schema 初始化與變更

正式環境的 schema 變更應依下列順序處理：

1. 先在測試 Supabase 專案驗證 SQL。
2. 建立 migration，記錄變更原因、前後差異與回滾風險。
3. 執行 migration。
4. 匯出 schema、constraints、RLS、index、enum 與 functions 結果。
5. 更新 [database_design.md](../architecture/database_design.md)。
6. 更新 `frontend/src/types/database.types.ts`，確保前端型別與遠端 schema 一致。
7. 執行前端測試與 build。

`youth_policy_update` 的 enum 變更已在 Supabase 執行；目前仍應補充正式 migration 歷史，避免未來環境無法重建相同 schema。

## 5. RLS 驗證

每張 public table 都應確認 RLS 開啟：

```sql
select
  n.nspname as schemaname,
  c.relname as tablename,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as force_rls
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
order by c.relname;
```

查詢 policy：

```sql
select
  p.schemaname,
  p.tablename,
  c.relrowsecurity as rowsecurity,
  p.policyname,
  p.permissive,
  p.roles,
  p.cmd,
  p.qual,
  p.with_check
from pg_policies p
join pg_class c on c.relname = p.tablename
join pg_namespace n
  on n.oid = c.relnamespace
 and n.nspname = p.schemaname
where p.schemaname = 'public'
order by p.tablename, p.policyname;
```

驗證時至少要測試：

- 使用者只能讀寫自己的 `reports`。
- `report_items`、`document_template_versions`、`key_note_links` 不能繞過父表 owner 權限。
- 未登入使用者不能讀取個人資料。
- `report_tags` 與 `tags` 的共享權限符合產品決策。

目前 `report_tags` 與 `tags` 的權限仍列在 [database_design.md](../architecture/database_design.md) 的待確認事項中，不能直接視為最終安全設定。

## 6. Schema 驗證查詢

### 6.1 資料表與欄位

```sql
select
  table_name,
  column_name,
  ordinal_position,
  data_type,
  udt_name,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
order by table_name, ordinal_position;
```

### 6.2 Foreign key、primary key 與 unique constraint

```sql
select
  ns.nspname as schema_name,
  conrel.relname as table_name,
  con.conname as constraint_name,
  pg_get_constraintdef(con.oid) as constraint_definition
from pg_constraint con
join pg_class conrel on conrel.oid = con.conrelid
join pg_namespace ns on ns.oid = conrel.relnamespace
where ns.nspname = 'public'
order by conrel.relname, con.conname;
```

### 6.3 Index

```sql
select schemaname, tablename, indexname, indexdef
from pg_indexes
where schemaname = 'public'
order by tablename, indexname;
```

### 6.4 Enum、function 與 trigger

請使用 [database_design.md](../architecture/database_design.md) 第 9 節的查詢，並將結果與前端型別及正式 migration 比對。

## 7. 變更後檢查清單

- [ ] 已在測試專案驗證 migration。
- [ ] 已確認欄位、enum、constraint、index、trigger、function 與 RLS。
- [ ] 已更新 `database_design.md`。
- [ ] 已同步更新 `frontend/src/types/database.types.ts`。
- [ ] 已新增或更新測試。
- [ ] 已執行 `npm run test` 與 `npm run build`。
- [ ] 已確認根目錄 `README.md` 與 `frontend/README.md` 是否需要更新。
- [ ] commit 前已在 `docs/history/` 建立變更紀錄。

## 8. 安全注意事項

- 不要把 service role key 放入前端或提交至 Git。
- 不要只用前端條件判斷資料權限。
- 不要直接在正式環境手動修改 schema 而不留下 migration 紀錄。
- 不要把 SQL Editor 的查詢結果與任何機密憑證一起分享。
