---
title: Linetra — 資料庫實作與安全政策 (Database Implementation & RLS)
version: v1.0
date: 2026-05-29
status: Draft
author: Linetra Dev Team
---

# Linetra — 資料庫實作與安全政策 (Database Implementation & RLS)

本文件將 PRD 的邏輯資料模型轉化為實體資料庫規格，並詳述在 Supabase 環境下的安全性設定。

| 屬性 (Metadata) | 內容 (Content) |
| :--- | :--- |
| **文件版本 (Version)** | `v1.0` |
| **最後更新 (Last Updated)** | 2026-05-29 |
| **狀態 (Status)** | 草案 (Draft) |

---

## 1. 資料庫全景圖 (Database Schema)

我們使用 PostgreSQL 作為核心資料庫。以下為各資料表的物理設計。

### 1.1 `users` (Supabase Auth 映射)
> [!IMPORTANT]
> 此表應與 Supabase 的 `auth.users` 同步。建議透過 Trigger 在使用者註冊時自動插入。

| 欄位名 | 資料型別 | 約束 (Constraints) | 說明 |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `PRIMARY KEY`, `REFERENCES auth.users` | 關聯 Supabase Auth |
| `google_id` | `varchar(255)` | `UNIQUE` | 來源 Google 的 ID |
| `email` | `text` | `NOT NULL` | |
| `name` | `text` | | 顯示名稱 |
| `avatar_url` | `text` | | |
| `created_at` | `timestamptz` | `DEFAULT now()` | |
| `updated_at` | `timestamptz` | `DEFAULT now()` | |

### 1.2 `reports` (通報案件)

| 欄位名 | 資料型別 | 約束 | 說明 |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | |
| `user_id` | `uuid` | `NOT NULL`, `REFERENCES users(id)` | 擁有者 |
| `template_type` | `text` | `NOT NULL`, `CHECK (template_type IN (...))` | 見 PRD 模板清單 |
| `department` | `text` | | 通報單位 |
| `subject` | `text` | `NOT NULL` | 案由 |
| `actual_due_at` | `timestamptz` | | 真實截止時間 |
| `announced_due_at` | `timestamptz` | | 對外通知期限 |
| `sent_at` | `timestamptz` | | 第一次複製的時間 |
| `importance_flag` | `boolean` | `DEFAULT false` | |
| `status` | `text` | `DEFAULT 'pending'`, `CHECK (status IN (...))` | `pending`, `completed`, `overdue`, `archived` |
| `created_at` | `timestamptz` | `DEFAULT now()` | |
| `updated_at` | `timestamptz` | `DEFAULT now()` | |

### 1.3 `report_items` (條列項目)

| 欄位名 | 資料型別 | 約束 | 說明 |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | |
| `report_id` | `uuid` | `REFERENCES reports(id) ON DELETE CASCADE` | |
| `item_type` | `text` | `NOT NULL` | `detail`, `note`, `submission_method`, etc. |
| `content` | `text` | `NOT NULL` | |
| `sort_order` | `int2` | `DEFAULT 0` | 排序用 |

### 1.4 `notification_rules` (提醒規則)

| 欄位名 | 資料型別 | 約束 | 說明 |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | |
| `report_id` | `uuid` | `REFERENCES reports(id) ON DELETE CASCADE` | |
| `trigger_base` | `text` | `NOT NULL` | `announced_due`, `actual_due`, `custom_time` |
| `trigger_type` | `text` | `NOT NULL` | `before_due`, `after_due`, `exact_time` |
| `offset_minutes` | `int4` | `DEFAULT 0` | 偏移量 |
| `trigger_at` | `timestamptz` | `NOT NULL` | **核心欄位**，由後端/Trigger 計算 |
| `enabled` | `boolean` | `DEFAULT true` | |

### 1.5 `notification_logs` (提醒紀錄)

| 欄位名 | 資料型別 | 約束 | 說明 |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | |
| `report_id` | `uuid` | `REFERENCES reports(id)` | |
| `rule_id` | `uuid` | `REFERENCES notification_rules(id)` | |
| `dedup_key` | `text` | `UNIQUE` | 格式: `report_id:rule_id:trigger_at_unix` |
| `status` | `text` | | `success`, `failed`, `skipped` |
| `triggered_at` | `timestamptz` | `DEFAULT now()` | |

---

## 2. 安全性政策 (Row Level Security)

所有資料表預設開啟 RLS。使用者僅能存取與其 `user_id` 相符的資料。

### 2.1 基礎 RLS 指令

```sql
-- 開啟 RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 建立 Policy：使用者只能看到自己的案件
CREATE POLICY "Users can manage their own reports" ON reports
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
```

### 2.2 權限對照表

| 資料表 | SELECT | INSERT | UPDATE | DELETE |
| :--- | :--- | :--- | :--- | :--- |
| `users` | `owner` | `system` | `owner` | `none` |
| `reports` | `owner` | `owner` | `owner` | `owner` (歸檔取代) |
| `report_items` | `owner` | `owner` | `owner` | `owner` |
| `notification_rules`| `owner` | `owner` | `owner` | `owner` |
| `notification_logs` | `owner` | `owner` | `none` | `none` |

---

## 3. 自動化機制 (Triggers & Functions)

### 3.1 更新時間自動化
所有表都應具備 `handle_updated_at` Trigger。

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';
```

### 3.2 提醒時間自動計算 (建議)
當 `reports` 的 `announced_due_at` 變更時，自動更新相關 `notification_rules` 的 `trigger_at`。

```sql
-- 邏輯虛擬代碼
IF announced_due_at changed THEN
    UPDATE notification_rules 
    SET trigger_at = NEW.announced_due_at - (offset_minutes * interval '1 minute')
    WHERE report_id = NEW.id AND trigger_base = 'announced_due';
END IF;
```

---

## 4. 索引優化 (Indexes)

為了確保 PRD 要求的效能指標，建議建立以下索引：

1.  **Pending List 排序**:
    `CREATE INDEX idx_reports_user_status_due ON reports(user_id, status, announced_due_at);`
2.  **Overdue 掃描**:
    `CREATE INDEX idx_reports_status_due ON reports(status, announced_due_at) WHERE status = 'pending';`
3.  **提醒觸發掃描**:
    `CREATE INDEX idx_notif_rules_trigger_at ON notification_rules(trigger_at) WHERE enabled = true;`
