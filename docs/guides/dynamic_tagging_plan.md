---
title: Linetra — 標籤系統遷移計畫 (Tag Migration Plan)
version: v1.0
date: 2026-06-14
status: Draft
author: Linetra Dev Team
---

# Linetra — 標籤系統遷移計畫 (Tag Migration Plan)

本文件描述如何將現有的 `reports.tags` (text[]) 陣列欄位，遷移至更具擴充性的 `tags` 與 `report_tags` 關聯表結構。

## 1. 遷移背景
目前的設計使用 PostgreSQL 的陣列欄位 (`text[]`) 儲存標籤，這在早期 MVP 階段足夠使用。但隨著需求增加，為了提供更強大的動態篩選、標籤統計分析與跨案件連結，我們決定將其正規化 (Normalization)。

## 2. 遷移步驟

### 第一階段：資料庫結構調整
執行以下 SQL 建立標籤管理表結構：

```sql
-- 建立新表
CREATE TABLE public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE
);

CREATE TABLE public.report_tags (
  report_id uuid REFERENCES public.reports(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (report_id, tag_id)
);

-- 設定 RLS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_tags ENABLE ROW LEVEL SECURITY;

-- 新增權限政策
CREATE POLICY "Authenticated users can select tags" ON public.tags
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert tags" ON public.tags
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update tags" ON public.tags
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can select report_tags" ON public.report_tags
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert report_tags" ON public.report_tags
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can delete report_tags" ON public.report_tags
  FOR DELETE TO authenticated USING (true);
```

### 第二階段：資料轉換 (Migration Script)
使用 PostgreSQL 的 `unnest` 與 `INSERT INTO ... SELECT` 將既有資料匯入新表：

```sql
-- 1. 將所有不重複的標籤名稱匯入 tags 表
INSERT INTO public.tags (name)
SELECT DISTINCT unnest(tags)
FROM public.reports
WHERE tags IS NOT NULL;

-- 2. 建立關聯 (Mapping)
INSERT INTO public.report_tags (report_id, tag_id)
SELECT r.id, t.id
FROM public.reports r
CROSS JOIN LATERAL unnest(r.tags) AS tag_name
JOIN public.tags t ON t.name = tag_name;
```

### 第三階段：應用程式邏輯切換
1.  **Backend/Store**: 修改 `reports.ts` 的查詢語句，使用 SQL JOIN 關聯 `report_tags` 與 `tags`。
2.  **Frontend/Form**: 修改 `useReportForm` 與 `ReportCreateView`，讓標籤的 CRUD 改為針對 `tags` 表與關聯表的操作。

### 第四階段：清理舊資料
確認前端與後端查詢皆已使用新關聯表後，最後執行：

```sql
ALTER TABLE public.reports DROP COLUMN tags;
```

## 3. 回滾計畫 (Rollback)
若遷移後發生異常，由於我們採用「同步更新」或「分階段清理」策略，建議在步驟四清理舊欄位前，維持 `reports.tags` 欄位作為備份，以利於發生問題時迅速還原。
