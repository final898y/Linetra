---
title: Linetra — Supabase 資料庫初始化與設定指南
version: v1.1
date: 2026-06-20
status: Active
author: Linetra Dev Team
---

# Linetra — Supabase 資料庫初始化與設定指南

本文件提供 Linetra 專案在 Supabase 環境下的完整初始化 SQL 指令。請依照以下步驟在 Supabase Dashboard 的 **SQL Editor** 中執行。

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
  'location',
  'participants',
  'materials'
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

---

## 第四步：效能優化 (Indexes)

```sql
CREATE INDEX idx_reports_user_status_due ON public.reports(user_id, status, announced_due_at);
CREATE INDEX idx_tags_name ON public.tags(name);
```
