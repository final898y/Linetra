---
title: Linetra — 邊緣函數與自動化任務設計 (Edge Functions & Cron Jobs)
version: v1.0
date: 2026-05-29
status: Active
author: Linetra Dev Team
---

# Linetra — 邊緣函數與自動化任務設計 (Edge Functions & Cron Jobs)

本文件詳述 Linetra 如何利用 Supabase Edge Functions 實現自動化邏輯，包括案件狀態更新與提醒推送。

| 屬性 (Metadata) | 內容 (Content) |
| :--- | :--- |
| **文件版本 (Version)** | `v1.0` |
| **最後更新 (Last Updated)** | 2026-05-29 |
| **執行環境** | Deno (Supabase Edge Functions) |

---

## 1. 任務概覽 (Task Overview)

系統依賴兩大核心自動化任務，均建議以 **每 10 分鐘** 為週期執行：

1.  **Overdue Scanner**: 掃描已過期但仍處於 `pending` 狀態的案件。
2.  **Notification Dispatcher**: 掃描到達觸發時間的提醒規則，並準備推送。

---

## 2. 逾期掃描器 (Overdue Scanner)

### 2.1 執行邏輯
掃描所有 `announced_due_at < NOW()` 且 `status = 'pending'` 的案件。

### 2.2 SQL 更新語句
```sql
UPDATE reports
SET status = 'overdue', updated_at = now()
WHERE status = 'pending'
  AND announced_due_at < now();
```

### 2.3 邊緣函數實作要點
*   使用 `service_role` key 以跳過 RLS 進行全表掃描。
*   每次執行後記錄更新成功的件數至日誌。

---

## 3. 提醒派發器 (Notification Dispatcher)

### 3.1 執行流程
1.  **掃描規則**: 查詢 `notification_rules` WHERE `trigger_at <= NOW()` AND `enabled = true`。
2.  **狀態檢查**: 確保關聯案件 `status` 非 `completed` 或 `archived`。
3.  **去重校驗**: 檢查 `notification_logs` 是否已存在相同的 `dedup_key`。
4.  **觸發推送**: 呼叫推送介面（MVP 為 Browser Web Push）。
5.  **寫入日誌**: 記錄成功、失敗或跳過的結果。

### 3.2 去重機制 (Deduplication)
`dedup_key` 的生成格式為：`{report_id}:{rule_id}:{trigger_at_unix}`。
這確保了即使 Cron Job 重疊執行，同一個提醒點也只會發送一次。

---

## 4. 瀏覽器通知實作 (Browser Notification)

由於 Edge Function 運行在後端，無法直接「彈出」瀏覽器視窗，實作方式如下：

### 4.1 方案：Web Push Protocol
1.  **前端**: 使用者登入後，請求通知權限並將 `PushSubscription` 儲存至資料庫。
2.  **後端 (Edge Function)**: 使用 `web-push` 函式庫將加密訊息推送到瀏覽器的 Push Service。
3.  **Service Worker**: 前端 Service Worker 接收到推送後，顯示 `self.registration.showNotification()`。

### 4.2 降級方案：In-App Notification
若 Web Push 實作過於複雜，可先實作「通知暫存表」，前端透過長輪詢或 Supabase Realtime 訂閱該表，當有新紀錄時顯示 UI 通知。

---

## 5. 錯誤處理與重試機制

| 異常情境 | 處理策略 |
| :--- | :--- |
| **掃描到舊提醒 (已過 2hr)** | 標記為 `skipped`，不補送，避免半夜收到大量過期通知。 |
| **Push Service 回傳 410** | 表示訂閱無效，應清除該使用者的 `PushSubscription`。 |
| **函式執行超時** | 確保 `update` 操作具備事務性，避免狀態不一致。 |

---

## 6. 部署設定

使用 Supabase CLI 部署 Cron Job：
```bash
# 部署函數
supabase functions deploy process-automated-tasks

# 設定定時觸發 (需在 Supabase Dashboard 或 pg_cron 設定)
# 範例 SQL：
# select cron.schedule('*/10 * * * *', 'select net.http_post(url:=''https://<project>.supabase.co/functions/v1/process-automated-tasks'', headers:=''{"Authorization": "Bearer <TOKEN>"}''::jsonb)');
```
