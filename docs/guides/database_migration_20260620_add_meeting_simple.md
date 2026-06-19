---
title: Linetra -- 資料庫遷移指南 (2026-06-20) 新增 meeting_simple 模板
version: v1.0
date: 2026-06-20
status: Active
author: Linetra Dev Team
---

# 資料庫結構擴充遷移指南 (2026-06-20)

| 屬性 (Metadata) | 內容 (Content) |
| :--- | :--- |
| **文件版本 (Version)** | `v1.0` |
| **最後更新 (Last Updated)** | 2026-06-20 |
| **狀態 (Status)** | 正式 (Active) |

本指南說明如何在現有的 Supabase 資料庫中，手動執行 SQL 以新增 `meeting_simple` 模板型別以及相關的提醒項目型別。

## 執行步驟

請登入您的 **Supabase Dashboard**，進入該專案的 **SQL Editor**，並執行以下 SQL 指令。

```sql
-- 1. 新增新的模板類型 'meeting_simple' 至 template_type enum 中
ALTER TYPE public.template_type ADD VALUE IF NOT EXISTS 'meeting_simple';

-- 2. 新增新的項目類型 'location', 'participants', 'materials' 至 report_item_type enum 中
ALTER TYPE public.report_item_type ADD VALUE IF NOT EXISTS 'location';
ALTER TYPE public.report_item_type ADD VALUE IF NOT EXISTS 'participants';
ALTER TYPE public.report_item_type ADD VALUE IF NOT EXISTS 'materials';
```

> [!NOTE]
> `ALTER TYPE ... ADD VALUE` 在 PostgreSQL 中無法在交易區塊 (transaction block) 內執行。Supabase SQL Editor 預設以獨立敘述執行，因此可以直接執行上述 SQL。
