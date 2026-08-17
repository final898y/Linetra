---
title: Linetra — Supabase 資料庫初始化與設定指南
version: v1.2
date: 2026-08-17
status: Active
author: Linetra Dev Team
---

# Linetra — Supabase 資料庫初始化與設定指南

本文件提供 Linetra 專案在 Supabase 環境下的完整初始化 SQL 指令。請依照以下步驟在 Supabase Dashboard 的 **SQL Editor** 中執行。

| 屬性 (Metadata) | 內容 (Content) |
| :--- | :--- |
| **文件版本 (Version)** | `v1.2` |
| **最後更新 (Last Updated)** | 2026-08-17 |
| **適用範圍 (Scope)** | 通報案件、公文範本、重點記事 |
| **文件狀態 (Status)** | Active |

---

## 第一步：建立自定義 Enum 型別 (Types)

```sql
-- 模板類型
CREATE TYPE template_type AS ENUM (
  'general',
  'meeting',
  'meeting_simple',
  'weekly_report',
  'briefing',
  'announcement',
  'task'
);

-- 案件狀態
CREATE TYPE report_status AS ENUM (
  'pending',
  'completed',
  'overdue',
  'archived',
  'deleted'
);

-- 提醒項目類型
CREATE TYPE report_item_type AS ENUM (
  'submission_method',
  'detail',
  'note',
  'agenda',
  'link',
  'meeting_time',
  'meeting_end_time',
  'location',
  'participants',
  'materials'
);

-- 重點記事分類
CREATE TYPE key_note_category AS ENUM (
  'procedure',
  'leader_instruction',
  'reminder',
  'website'
);

-- 重點記事狀態
CREATE TYPE key_note_status AS ENUM (
  'active',
  'archived'
);
```

---

## 第二步：建立核心資料表 (Tables)

### 1. `users` 映射表

```sql
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
```

### 2. `reports` 通報案件表

```sql
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  template_type template_type NOT NULL,
  department text,
  subject text NOT NULL,
  remarks text,
  formatted_content text,
  actual_due_at timestamptz,
  announced_due_at timestamptz,
  sent_at timestamptz,
  importance_flag boolean DEFAULT false,
  status report_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
```

### 3. `tags` 與關聯表

```sql
CREATE TABLE public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE
);

CREATE TABLE public.report_tags (
  report_id uuid REFERENCES public.reports(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (report_id, tag_id)
);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_tags ENABLE ROW LEVEL SECURITY;
```

### 4. `report_items` 案件細項表

```sql
CREATE TABLE public.report_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  item_type report_item_type NOT NULL,
  content text NOT NULL,
  sort_order smallint DEFAULT 0
);

ALTER TABLE public.report_items ENABLE ROW LEVEL SECURITY;
```

### 5. `document_templates` 公文範本主檔

公文範本是可重複使用的 Markdown 內容，不屬於 `reports` 通報案件，因此使用獨立資料表。範本目前採個人使用，透過 `user_id` 進行 RLS 控制。

```sql
CREATE TABLE public.document_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;
```

### 6. `document_template_versions` 公文範本版本

每次編輯都新增一筆版本，不覆寫舊內容。這樣可以查看歷史版本，但目前不產生公文草稿，也不保存套用後快照。

```sql
CREATE TABLE public.document_template_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.document_templates(id) ON DELETE CASCADE,
  version_no integer NOT NULL CHECK (version_no > 0),
  content_markdown text NOT NULL,
  created_by uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (template_id, version_no)
);

ALTER TABLE public.document_template_versions ENABLE ROW LEVEL SECURITY;
```

### 7. `key_notes` 重點記事

重點記事與臨時任務不同，不使用 `reports.status`。它支援分類、置頂、排序、封存，以及生效／失效日期。

```sql
CREATE TABLE public.key_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  category key_note_category NOT NULL,
  content text NOT NULL DEFAULT '',
  is_pinned boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  status key_note_status NOT NULL DEFAULT 'active',
  valid_from date,
  valid_until date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (valid_until IS NULL OR valid_from IS NULL OR valid_until >= valid_from)
);

ALTER TABLE public.key_notes ENABLE ROW LEVEL SECURITY;
```

### 8. `key_note_links` 重點記事網站連結

一則記事可能包含多個網站，因此使用子表，而不是把多個 URL 塞在同一個文字欄位。

```sql
CREATE TABLE public.key_note_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id uuid NOT NULL REFERENCES public.key_notes(id) ON DELETE CASCADE,
  label text NOT NULL,
  url text NOT NULL CHECK (url ~* '^https://'),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.key_note_links ENABLE ROW LEVEL SECURITY;
```

目前不建立附件資料表。未來若啟用附件，檔案本體應放在 Supabase Storage，資料庫只保存檔案名稱、路徑、MIME type、大小與上傳者等 metadata。

---

## 第三步：自動化機制 (Triggers & Functions)

### 1. 自動更新 `updated_at`

```sql
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
```

### 2. 自動同步 Auth Users

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 3. 新增資料表的 `updated_at` Trigger

```sql
CREATE TRIGGER tr_document_templates_updated_at
  BEFORE UPDATE ON public.document_templates
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER tr_key_notes_updated_at
  BEFORE UPDATE ON public.key_notes
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
```

---

## 第四步：Row Level Security (RLS)

目前公文範本與重點記事都是個人資料。`auth.uid()` 代表目前登入者的 Supabase Auth UUID；每個人只能讀寫自己的主檔資料。

```sql
-- 公文範本主檔
CREATE POLICY "Users can manage their own document templates"
  ON public.document_templates
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 公文範本版本：透過主檔繼承擁有權
CREATE POLICY "Users can manage their own template versions"
  ON public.document_template_versions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.document_templates
      WHERE id = template_id AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.document_templates
      WHERE id = template_id AND user_id = auth.uid()
    )
  );

-- 重點記事
CREATE POLICY "Users can manage their own key notes"
  ON public.key_notes
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 重點記事連結：透過記事主檔繼承擁有權
CREATE POLICY "Users can manage their own key note links"
  ON public.key_note_links
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.key_notes
      WHERE id = note_id AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.key_notes
      WHERE id = note_id AND user_id = auth.uid()
    )
  );
```

> 目前使用者系統尚未完成。正式啟用前，請確認 `public.users` 已由 `auth.users` 建立對應資料，否則 `user_id` 外鍵會阻止新增資料。

---

## 第五步：效能優化 (Indexes)

```sql
CREATE INDEX idx_reports_user_status_due ON public.reports(user_id, status, announced_due_at);
CREATE INDEX idx_tags_name ON public.tags(name);
CREATE INDEX idx_document_templates_owner_active
  ON public.document_templates(user_id, is_active, category);
CREATE INDEX idx_template_versions_latest
  ON public.document_template_versions(template_id, version_no DESC);
CREATE INDEX idx_key_notes_owner_status
  ON public.key_notes(user_id, status, category, is_pinned, sort_order);
CREATE INDEX idx_key_note_links_order
  ON public.key_note_links(note_id, sort_order);
```

---

## 第六步：Markdown 與附件安全注意事項

公文範本與記事內容以 Markdown 儲存，但 Markdown 轉 HTML 顯示前必須使用 **HTML Sanitizer（HTML 清理器）**，移除 `<script>`、事件屬性與 `javascript:` URL，避免 **XSS（Cross-Site Scripting，跨網站腳本攻擊）**。

附件功能目前只保留擴充空間。啟用時建議：

1. 在 Supabase Storage 建立 private bucket。
2. 資料庫只保存檔案 metadata，不直接保存檔案本體。
3. 下載使用短時效的 **Signed URL（簽名網址）**。
4. 附件 metadata 表依附在 `document_templates` 或 `key_notes`，不使用沒有外鍵保護的 polymorphic entity 欄位。

---

## 第七步：型別同步與驗證

Schema 修改完成後，需重新產生前端 TypeScript 型別，避免 `database.types.ts` 與實際資料庫不一致：

```powershell
supabase gen types typescript --project-id <PROJECT_ID> > frontend/src/types/database.types.ts
```

執行後請確認：

- 新增四張資料表的 `Row`、`Insert`、`Update` 型別。
- Enum 型別包含 `key_note_category` 與 `key_note_status`。
- 前端 Store 的 CRUD 欄位與資料庫一致。
- RLS 開啟後，使用者只能讀寫自己的資料。

> 若使用 Supabase Dashboard 手動執行 SQL，仍建議將相同內容保存為 migration，避免測試、預備環境與正式環境的 schema 漂移。
