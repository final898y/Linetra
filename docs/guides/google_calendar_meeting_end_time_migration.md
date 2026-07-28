---
title: Linetra — 一般會議結束時間資料庫更新指南
version: v1.0
date: 2026-07-29
status: Active
author: Linetra Dev Team
---

# Linetra — 一般會議結束時間資料庫更新指南

本指南說明如何在既有 Supabase 專案新增一般會議的 `meeting_end_time` 項目類型。一般會議的起訖時間均儲存於 `report_items`，不需新增資料表欄位。

| 屬性 (Metadata) | 內容 (Content) |
| :--- | :--- |
| **文件版本 (Version)** | `v1.0` |
| **最後更新 (Last Updated)** | 2026-07-29 |
| **適用對象** | 已建立 Linetra `report_item_type` Enum 的 Supabase 專案 |

## 執行前確認

請在 Supabase Dashboard 的 SQL Editor 執行下列查詢，確認 `report_items.item_type` 使用的是 `public.report_item_type`：

```sql
SELECT atttypid::regtype
FROM pg_attribute
WHERE attrelid = 'public.report_items'::regclass
  AND attname = 'item_type'
  AND NOT attisdropped;
```

預期結果為 `report_item_type`。若結果不同，請先確認資料庫實際型別名稱，再調整下方 SQL。

## 新增 Enum 值

在 SQL Editor 執行：

```sql
ALTER TYPE public.report_item_type
ADD VALUE IF NOT EXISTS 'meeting_end_time';
```

此操作只新增 Enum 值，不會修改或刪除既有 `report_items` 資料。完成後重新整理 Supabase Schema Cache，並重新產生前端資料庫型別（若專案以 Supabase CLI 管理型別）。

## 驗證

```sql
SELECT enumlabel
FROM pg_enum
WHERE enumtypid = 'public.report_item_type'::regtype
ORDER BY enumsortorder;
```

結果中應包含 `meeting_end_time`。之後一般會議可儲存開始時間 `meeting_time` 與選填的結束時間 `meeting_end_time`；未填結束時間時，前端建立 Google Calendar 事件會預設為 1 小時。
