---
title: Linetra — 公文範本與重點記事資料設計速讀講義
version: v1.1
date: 2026-08-17
status: Proposed
author: Linetra Dev Team
---

| 屬性 (Metadata) | 內容 (Content) |
| :--- | :--- |
| **文件版本 (Version)** | `v1.1` |
| **最後更新 (Last Updated)** | 2026-08-17 |
| **適用對象 (Audience)** | 尚未熟悉資料庫與前端架構的開發者 |
| **文件狀態 (Status)** | Proposed |

# 題目

1. 想要新增一個公文範本頁面。
2. 新增重點記事頁面（跟臨時任務不同，比較算是做事的流程內規、長官的要求、常用的網站連結）。
3. 查看 `docs/architecture/database_design.md` 是否需要調整；檢討後提出需要討論的問題。
4. 依照已確認的需求，輸出一份由淺入深、方便考前快速吸收的學習講義與製作方案。

## 已確認需求

- 公文範本：使用者可自行新增、編輯、停用。
- 不需要由範本產生公文草稿。
- 暫不保留產生公文時的內容快照。
- 需要版本歷程。
- 範本內容使用 Markdown。
- 暫不使用可替換變數。
- 公文範本目前為個人使用。
- 重點記事目前為個人使用，且需要分類。
- 一則重點記事可能包含多個網站連結。
- 重點記事需要置頂、排序、封存、生效日與失效日。
- 暫不需要已讀／已確認追蹤、提醒、案件關聯。
- 附件功能可以保留擴充空間。

---

## 1. 先記住一句話：這不是通報案件

目前 `reports` 是「要被追蹤的通報案件」，具有狀態、期限、送出時間與提醒等欄位。公文範本與重點記事則是「可重複查閱的知識與素材」。

因此資料模型應分開：

```text
reports                  通報案件、任務、會議
document_templates       可重複使用的公文 Markdown 範本
document_template_versions 公文範本的歷史版本
key_notes                流程內規、長官要求、注意事項、網站記事
key_note_links           一則記事中的多個網站連結
```

不要把 `official_document` 或 `key_note` 加進 `reports.template_type`。現有資料庫在 [database_design.md](../architecture/database_design.md) 已用 `template_type` 限制通報模板，混用後會讓案件查詢、狀態流程與篩選語意變得不清楚。

---

## 2. 必備專有名詞

| 名詞 | 完整英文 | 新人版解釋 |
| :--- | :--- | :--- |
| 資料表 | **Table** | 儲存同一類資料的表格，例如 `reports`。 |
| 主鍵 | **Primary Key, PK** | 每筆資料的唯一編號，通常使用 UUID。 |
| 外鍵 | **Foreign Key, FK** | 連到另一張表的欄位，用來建立資料關係。 |
| UUID | **Universally Unique Identifier** | 幾乎不重複的識別碼，比流水號更適合分散式系統。 |
| 時區時間 | **Timestamp with Time Zone, timestamptz** | PostgreSQL 儲存含時區的時間型別。 |
| JSONB | **JSON Binary** | PostgreSQL 可索引的 JSON 資料，適合儲存彈性設定。 |
| CRUD | **Create, Read, Update, Delete** | 建立、讀取、更新、刪除四種基本資料操作。 |
| RLS | **Row Level Security** | PostgreSQL 的列級安全性，控制使用者能看到哪些資料列。 |
| Markdown | **Markdown Lightweight Markup Language** | 用簡單符號表示標題、清單、連結與粗體的純文字格式。 |
| 軟刪除 | **Soft Delete** | 不真的刪除資料，而是標記為 `archived` 或 `is_active=false`。 |
| 版本歷程 | **Version History** | 每次修改保留一個新版本，舊版本不覆蓋。 |
| 物件儲存 | **Object Storage** | 儲存檔案本體的服務，例如 Supabase Storage。 |

---

## 3. 公文範本設計

### 3.1 功能定位

公文範本頁面只負責：

1. 建立範本。
2. 使用 Markdown 編寫範本。
3. 編輯範本並保留歷史版本。
4. 停用或重新啟用範本。
5. 搜尋與分類範本。

本階段不負責：

- 代入日期、承辦單位、受文者等變數。
- 由範本產生正式公文草稿。
- 保存某次套用範本後的內容快照。

### 3.2 為什麼需要兩張表

如果只有一張 `document_templates`，每次編輯都會覆蓋原始內容，無法回答「上個月的版本是什麼」。

建議分成：

#### `document_templates`：範本主檔

| 欄位 | 型別 | 用途 |
| :--- | :--- | :--- |
| `id` | `uuid` | 範本主鍵 |
| `user_id` | `uuid` | 個人擁有者 |
| `name` | `text` | 範本名稱 |
| `category` | `text` | 範本分類 |
| `is_active` | `boolean` | 是否仍可使用 |
| `created_at` | `timestamptz` | 建立時間 |
| `updated_at` | `timestamptz` | 最後異動時間 |

#### `document_template_versions`：範本版本

| 欄位 | 型別 | 用途 |
| :--- | :--- | :--- |
| `id` | `uuid` | 版本主鍵 |
| `template_id` | `uuid` | 關聯範本主檔 |
| `version_no` | `int4` | 版本號，例如 1、2、3 |
| `content_markdown` | `text` | Markdown 內容 |
| `created_by` | `uuid` | 建立此版本的使用者 |
| `created_at` | `timestamptz` | 版本建立時間 |

建議約束：

```text
UNIQUE (template_id, version_no)
```

編輯時不要更新舊版本內容，而是新增 `version_no + 1`。這種資料設計稱為 **Append-only Versioning（只新增版本，不覆寫歷史）**，簡單且容易追查。

### 3.3 Markdown 需要注意什麼

Markdown 優點是純文字、容易保存、容易版本比較；但前端顯示時要注意 **XSS（Cross-Site Scripting，跨網站腳本攻擊）**。

安全流程應為：

```text
使用者輸入 Markdown
→ Markdown Parser 轉成 HTML
→ HTML Sanitizer 清除 script、危險 URL 與事件屬性
→ 顯示於頁面
```

Markdown 連結可以允許 `https://`，但應禁止或審核 `javascript:` 等危險協定。

### 3.4 公文範本頁面建議

桌面版可採兩欄：

```text
左側：範本分類與範本清單
右側：範本名稱、Markdown 編輯器、預覽、版本列表
```

手機版改為：

```text
先選範本 → 編輯 → 預覽 → 查看版本歷程
```

停用範本使用軟刪除，不直接刪除，避免歷史版本失去主體。

---

## 4. 重點記事設計

### 4.1 它和臨時任務的差異

| 比較項目 | 臨時任務 | 重點記事 |
| :--- | :--- | :--- |
| 目的 | 追蹤一件要完成的工作 | 保存工作知識與重要資訊 |
| 是否有完成狀態 | 有 | 本階段不需要 |
| 是否有期限 | 通常有 | 使用生效／失效日期，不代表待辦期限 |
| 主要內容 | 任務、期限、備註 | 流程、要求、注意事項、連結 |
| 完成後處理 | `completed` | 保留或 `archived` |

### 4.2 `key_notes`：記事主檔

| 欄位 | 型別 | 用途 |
| :--- | :--- | :--- |
| `id` | `uuid` | 記事主鍵 |
| `user_id` | `uuid` | 個人擁有者 |
| `title` | `text` | 記事標題 |
| `category` | `text` | `procedure`、`leader_instruction`、`reminder`、`website` |
| `content` | `text` | 內規或記事內容，可使用 Markdown |
| `is_pinned` | `boolean` | 是否置頂 |
| `sort_order` | `int4` | 同類記事的排序 |
| `status` | `text` | `active` 或 `archived` |
| `valid_from` | `date` | 生效日期，可為空 |
| `valid_until` | `date` | 失效日期，可為空 |
| `created_at` | `timestamptz` | 建立時間 |
| `updated_at` | `timestamptz` | 更新時間 |

建議資料庫約束：

```text
CHECK (valid_until IS NULL OR valid_from IS NULL OR valid_until >= valid_from)
```

這可以避免記事的失效日早於生效日。

### 4.3 `key_note_links`：多網站連結

因為一則記事可能有多個網站，建議不要把 URL 塞成一個長文字欄位，而是拆成子表：

| 欄位 | 型別 | 用途 |
| :--- | :--- | :--- |
| `id` | `uuid` | 連結主鍵 |
| `note_id` | `uuid` | 關聯 `key_notes` |
| `label` | `text` | 顯示名稱，例如「人事系統」 |
| `url` | `text` | 完整 HTTPS 網址 |
| `sort_order` | `int4` | 連結排序 |
| `created_at` | `timestamptz` | 建立時間 |

使用 `ON DELETE CASCADE`，刪除記事時一併刪除連結。

### 4.4 重點記事頁面建議

主要功能：

- 依分類篩選。
- 依標題與內容搜尋。
- 置頂記事固定在前面。
- 可拖曳或用數字調整排序。
- 顯示目前有效記事。
- 可查看已封存記事。
- `website` 類別顯示連結清單。
- 到達 `valid_until` 後顯示「已失效」，但不自動刪除。

建議畫面分成：

```text
上方：搜尋、分類、只看置頂、只看有效
左側：記事列表
右側：記事內容與網站連結
```

手機版改為列表與編輯頁分開，避免兩欄在窄螢幕中難以閱讀。

---

## 5. 可直接執行的 SQL（Supabase SQL Editor）

以下 SQL 假設 `public.users` 已經依照 [supabase_setup_guide.md](supabase_setup_guide.md) 建立。請先在測試專案執行，確認 RLS 與外鍵正常後，再套用到正式環境。

### 5.1 建立 Enum 型別

```sql
CREATE TYPE key_note_category AS ENUM (
  'procedure',
  'leader_instruction',
  'reminder',
  'website'
);

CREATE TYPE key_note_status AS ENUM (
  'active',
  'archived'
);
```

### 5.2 建立公文範本與版本表

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

CREATE TABLE public.document_template_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.document_templates(id) ON DELETE CASCADE,
  version_no integer NOT NULL CHECK (version_no > 0),
  content_markdown text NOT NULL,
  created_by uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (template_id, version_no)
);
```

### 5.3 建立重點記事與多網站連結表

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

CREATE TABLE public.key_note_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id uuid NOT NULL REFERENCES public.key_notes(id) ON DELETE CASCADE,
  label text NOT NULL,
  url text NOT NULL CHECK (url ~* '^https://'),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

### 5.4 啟用個人資料 RLS

**RLS（Row Level Security，列級安全性）** 確保登入者只能存取自己的資料。版本與連結表透過主表繼承擁有權。

```sql
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_template_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.key_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.key_note_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own document templates"
  ON public.document_templates FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own template versions"
  ON public.document_template_versions FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.document_templates
    WHERE id = template_id AND user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.document_templates
    WHERE id = template_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their own key notes"
  ON public.key_notes FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own key note links"
  ON public.key_note_links FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.key_notes
    WHERE id = note_id AND user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.key_notes
    WHERE id = note_id AND user_id = auth.uid()
  ));
```

### 5.5 Trigger 與索引

若專案尚未建立 `handle_updated_at()`，請先使用 Supabase 設定指南中的版本。以下只建立新資料表的 trigger 與索引：

```sql
CREATE TRIGGER tr_document_templates_updated_at
  BEFORE UPDATE ON public.document_templates
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER tr_key_notes_updated_at
  BEFORE UPDATE ON public.key_notes
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_document_templates_owner_active
  ON public.document_templates(user_id, is_active, category);

CREATE INDEX idx_template_versions_latest
  ON public.document_template_versions(template_id, version_no DESC);

CREATE INDEX idx_key_notes_owner_status
  ON public.key_notes(user_id, status, category, is_pinned, sort_order);

CREATE INDEX idx_key_note_links_order
  ON public.key_note_links(note_id, sort_order);
```

### 5.6 執行後檢查

1. 使用已登入使用者新增一筆 `document_templates`，確認 `user_id` 必須是自己的 Auth UUID。
2. 新增版本時確認同一範本不可重複 `version_no`。
3. 建立 `valid_until < valid_from` 的記事，確認會被 CHECK constraint 拒絕。
4. 使用另一個使用者查詢，確認 RLS 不會讀到前一位使用者的範本或記事。
5. 使用 `https://` 以外的連結，確認 URL constraint 拒絕該資料。

本階段不建立附件表、不建立共享權限、不建立提醒規則，也不修改 `reports.template_type`。

---

## 6. 附件功能的取捨

附件不建議直接存進 PostgreSQL 的 `text` 或 `bytea`。檔案本體應放在 **Supabase Storage（Supabase 物件儲存）**，資料庫只保存檔案描述。

若之後啟用附件，建議建立兩張明確的 metadata table：

```text
document_template_attachments
key_note_attachments
```

欄位可包含：

```text
id, storage_path, original_name, mime_type, file_size,
uploaded_by, created_at
```

本階段先不加入附件欄位，避免在權限、檔案大小、下載連結與病毒掃描尚未決定前鎖死 schema。

---

## 7. 個人資料與 RLS

### 7.1 RLS 是什麼

**Row Level Security（列級安全性）** 是 PostgreSQL 讓每一列資料根據使用者身份決定是否可讀寫的功能。

因為目前兩個功能都是個人使用，基本規則是：

```text
auth.uid() = user_id
```

也就是登入者只能讀寫自己的公文範本、範本版本與重點記事。

### 7.2 子表權限

`document_template_versions`、`key_note_links` 不應只檢查自己表上的 ID，而要透過主表確認擁有者：

```text
版本的 template_id 必須屬於 auth.uid()
連結的 note_id 必須屬於 auth.uid()
```

這稱為 **Ownership Inheritance（擁有權繼承）**。

目前使用者系統尚未完成，但資料表仍建議保留 `user_id`。開發期可以使用種子帳號，正式啟用前再將欄位設為 `NOT NULL` 並補齊 RLS。

---

## 8. 索引與搜尋基礎

第一階段使用一般索引即可：

```text
document_templates (user_id, is_active, category)
document_template_versions (template_id, version_no DESC)
key_notes (user_id, status, category, is_pinned, sort_order)
key_note_links (note_id, sort_order)
```

若未來資料量增加，再考慮：

- **GIN Index（Generalized Inverted Index）**：適合全文搜尋與 JSONB。
- **Full-Text Search（全文搜尋）**：搜尋記事標題與內容。
- **pg_trgm（PostgreSQL Trigram）**：適合模糊搜尋標題或 URL。

考前記憶：先用正確資料模型與一般索引，資料量真的變大再優化搜尋引擎。

---

## 9. 需要同步調整的專案檔案

未來正式開發時，至少會涉及：

| 類別 | 檔案或位置 | 調整內容 |
| :--- | :--- | :--- |
| 資料庫設計 | `docs/architecture/database_design.md` | 新增四張表、RLS、索引與 trigger 說明 |
| Migration | `supabase/migrations/` 或專案既有 migration 目錄 | 建表、約束、RLS、索引 |
| 型別 | `frontend/src/types/database.types.ts` | 新增資料表 Row／Insert／Update 型別 |
| 路由 | `frontend/src/router/routes.ts` | 公文範本與重點記事頁面 |
| 前端設定 | `frontend/src/config/` | 分類與顯示標籤 |
| Store | `frontend/src/stores/` | CRUD、版本建立、排序與封存 |
| 測試 | `frontend/tests/` | RLS 以外的 store、元件與版本規則測試 |

注意：資料庫型別通常應由 Supabase schema 產生，不建議長期手動維護型別檔案。

---

## 10. 建議實作順序

### 第 1 階段：最小可用版本（MVP, Minimum Viable Product）

1. 建立 `document_templates` 與 `document_template_versions`。
2. 建立 `key_notes` 與 `key_note_links`。
3. 完成個人 RLS。
4. 公文範本支援 Markdown 編輯、預覽、停用。
5. 重點記事支援分類、置頂、排序、封存、有效日期與多連結。
6. 為每項 CRUD 補測試。

### 第 2 階段：品質與可維護性

1. 補版本歷程檢視與版本比較。
2. 增加 Markdown HTML Sanitization。
3. 增加搜尋與篩選條件摘要。
4. 增加附件 metadata 與 Supabase Storage 整合。

### 第 3 階段：可能的延伸

1. 共享範本與共享記事。
2. 組織、群組與角色權限。
3. 變數替換與公文草稿產生。
4. 生效／失效提醒與閱讀確認。

---

## 11. 考前背誦版

```text
公文範本不是 reports，而是 document_templates。
需要版本歷程，所以採主檔加版本表。
內容使用 Markdown，但輸出 HTML 前必須做 Sanitization。

重點記事不是 task，而是 key_notes。
記事需要 category、pin、sort、archive、valid_from、valid_until。
一則記事可能有多個網站，所以使用 key_note_links 子表。

目前兩者都是個人資料，RLS 使用 auth.uid() = user_id。
附件本體放 Supabase Storage，資料庫只存 metadata。
暫不做變數、草稿快照、共享、已讀、提醒與案件關聯。
```

## 12. 最終結論

`database_design.md` 必須新增兩個功能領域，但不應擴充 `reports.template_type`。最穩定且符合目前需求的方案是：

```text
document_templates
document_template_versions
key_notes
key_note_links
```

先以個人使用、Markdown、版本歷程、多連結、封存與有效日期完成 MVP；附件、共享權限、變數替換與提醒功能保留為後續擴充。
