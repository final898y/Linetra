---
title: Linetra Edge Functions 與自動化任務規劃
version: v1.1
date: 2026-11-19
status: Planned
author: Linetra Dev Team
---

# Linetra Edge Functions 與自動化任務規劃

> 本文件是未來自動化能力的設計草案。目前 repository 沒有 `supabase/functions/`、Edge Function 原始碼或 `notification_rules` / `notification_logs` 資料表，因此以下內容不能視為已部署功能。

## 1. 文件定位

| 文件 | 責任 |
| --- | --- |
| [system_architecture.md](system_architecture.md) | 系統元件與服務邊界總覽 |
| [database_design.md](database_design.md) | 目前資料表、RLS、index 與 trigger 的實際狀態 |
| 本文件 | Edge Functions、Cron 與通知功能的未來規劃 |
| [supabase_setup_guide.md](../guides/supabase_setup_guide.md) | Supabase 建置與驗證操作 |

若未來功能正式實作，必須同步新增 migration、`supabase/functions/` 原始碼、測試與部署紀錄，並更新本文件的狀態。

## 2. 規劃中的自動化任務

### 2.1 Overdue Scanner

定期掃描 `reports`：

```sql
update reports
set status = 'overdue', updated_at = now()
where status = 'pending'
  and announced_due_at < now();
```

正式實作前需要確認：

- `announced_due_at` 為空時是否跳過。
- 是否應同時檢查 `actual_due_at`。
- 逾期案件是否允許跨時區執行。
- worker 使用 service role 時的最小權限範圍。
- 重複執行時是否具備冪等性。

### 2.2 Notification Dispatcher

目前 PRD 規劃以 `notification_rules` 與 `notification_logs` 管理提醒，但這兩張表尚未出現在 Supabase schema 快照，也沒有前端型別。

實作前必須先完成：

1. 資料表與 migration。
2. `report_id`、`rule_id` 的外鍵與刪除行為。
3. `dedup_key` 的唯一性。
4. RLS 與 worker service role 權限。
5. Edge Function 的重試、失敗與去重測試。

## 3. 通知方式規劃

### 3.1 Web Push

需要新增 subscription 資料模型、瀏覽器 permission 流程、Service Worker 與 Edge Function 派送流程。這些元件目前均未存在於 repository。

### 3.2 In-App Notification

若先不導入 Web Push，可先將通知紀錄存入資料庫，前端再透過查詢或 Realtime 顯示。但仍需先決定通知資料表與保留期限。

## 4. 安全與執行邊界

- service role key 只能存在於 Edge Function 的 server-side secret，不得放入 Vue 前端。
- worker 應以最小權限執行，並記錄成功、失敗與略過原因。
- 任何通知操作都必須具備去重策略，避免 Cron 重試造成重複通知。
- RLS policy 與 worker 權限要分開設計，不能用 service role 繞過所有安全需求。
- Edge Function 需對外部通知服務錯誤、逾時與 HTTP 410 等失效狀態建立處理方式。

## 5. 建議實作順序

1. 先決定 notification data model，更新 [database_design.md](database_design.md)。
2. 建立 migration 並在測試 Supabase 專案驗證 RLS。
3. 建立 `supabase/functions/process-automated-tasks/`。
4. 先實作 Overdue Scanner，補上單元與整合測試。
5. 再實作 Notification Dispatcher 與 deduplication。
6. 最後選擇 Web Push 或 In-App Notification。
7. 更新 Supabase deployment 操作、README 與本文件狀態。

## 6. 完成條件

本文件可以從 `Planned` 改為 `Active` 前，至少需要具備：

- Edge Function 原始碼與部署設定。
- notification 相關 migration。
- RLS 與 service role 權限驗證。
- Overdue Scanner 與 Dispatcher 測試。
- Cron 執行紀錄與失敗重試策略。
- 對應的前端通知或 Web Push 實作。
