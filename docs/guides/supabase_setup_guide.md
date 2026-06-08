---
title: Linetra — Supabase 資料庫初始化與設定指南
version: v1.0
date: 2026-06-08
status: Active
author: Linetra Dev Team
---

# Linetra — Supabase 資料庫初始化與設定指南

本講義提供 Linetra 專案在 Supabase 環境下的完整初始化 SQL 指令。請依照以下步驟在 Supabase Dashboard 的 **SQL Editor** 中執行。

---

## 第一步：建立自定義 Enum 型別 (Types)

我們定義了模板類型與案件狀態，以確保資料完整性。

```sql
-- 模板類型
CREATE TYPE template_type AS ENUM (
  'general',
  'meeting',
  'weekly_report',
  'briefing',
  'announcement'
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
  'meeting_time'
);
```

---

## 第二步：建立核心資料表 (Tables)

### 1. `users` 映射表

此表用於儲存使用者個人資料，並透過 Trigger 與 Supabase Auth 自動同步。

```sql
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 開啟 RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);
```

### 2. `reports` 通報案件表

```sql
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  template_type template_type NOT NULL,
  department text,
  subject text NOT NULL,
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

CREATE POLICY "Users can manage their own reports" ON public.reports
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### 3. `report_items` 案件細項表

```sql
CREATE TABLE public.report_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  item_type report_item_type NOT NULL,
  content text NOT NULL,
  sort_order smallint DEFAULT 0
);

ALTER TABLE public.report_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own report items" ON public.report_items
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.reports
      WHERE id = report_items.report_id AND user_id = auth.uid()
    )
  );
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

當新使用者透過 Google 登入時，自動在 `public.users` 建立紀錄。

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

## 第四步：Supabase Dashboard 與 Google OAuth 設定

除了 SQL 指令外，您還需要手動完成以下設定以啟用 Google 登入：

### 1. Google Cloud Console 設定

1. 前往 [Google Cloud Console](https://console.cloud.google.com/) 並建立專案。
2. 設定 **OAuth 同意畫面 (Consent Screen)**。
3. 建立 **OAuth 2.0 用戶端 ID (Client ID)**。
   - 應用程式類型：**Web Application**。
   - **已授權的重新導向 URI**：填入 Supabase 提供的回呼 URL（在 Supabase Dashboard > Auth > Providers > Google 頁面下方可找到，格式通常為 `https://[PROJECT_REF].supabase.co/auth/v1/callback`）。

### 2. Supabase Dashboard 設定

1. 進入 **Authentication > Sign In / Providers > Auth Providers > Google**。
2. 將**Enable Sign in with Google**切換為 **Enabled**。
3. 貼入從 Google Cloud 取得的 **Client ID** 與 **Client Secret**。
4. 點擊 **Save**。

### 3. Redirect URLs 設定

1. 進入 **Auth > Configuration > URL Configuration**。
2. 在 **Site URL** 填入您的開發環境網址 (預設為 `http://localhost:3000`)。
3. 在 **Redirect URLs** 視需求加入生產環境網址。

---

## 第五步：效能優化 (Indexes)

執行以下索引以提升清單查詢效能：

```sql
-- 提升首頁 Pending List 排序效能
CREATE INDEX idx_reports_user_status_due
ON public.reports(user_id, status, announced_due_at);

-- 提升狀態掃描效能
CREATE INDEX idx_reports_status_pending
ON public.reports(status, announced_due_at)
WHERE status = 'pending';
```

---

## 第五步：前端環境變數設定

在 `frontend/` 目錄建立 `.env` 檔案並填入您的 Supabase 憑證：

```env
VITE_SUPABASE_URL=你的_SUPABASE_專案_URL
VITE_SUPABASE_PUBLISHABLE_KEY=你的_SUPABASE_PUBLISHABLE_KEY
```

---

### 檢查清單

1. [ ] 是否已執行 Types 建立？
2. [ ] 是否已執行 Tables 與 RLS Policies？
3. [ ] 是否已掛載 `handle_new_user` Trigger？
4. [ ] 是否已在 Supabase Dashboard 開啟 Google Auth？
