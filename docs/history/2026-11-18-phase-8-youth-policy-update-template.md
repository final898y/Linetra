---
title: Phase 8 新增青年政策及資源定期更新模板
version: v1.0
date: 2026-11-18
status: Active
author: Linetra Dev Team
---

# Phase 8 新增青年政策及資源定期更新模板

## 異動原因

新增每月使用的「定期更新本中心官網相關青年政策及資源」案件通報模板，讓使用者只需調整每月的通報單位與期限即可建立報告。

## 改動方向

- 新增 `youth_policy_update` 模板類型。
- 預填通報單位與範例期限 `2026-09-30T12:00`，每月可直接修改。
- 預填線上表單交付方式與兩段固定詳細說明。
- 讓模板模式顯示通報單位欄位。
- 沿用 GeneralStrategy 的案件通報輸出格式，不新增重複的 Strategy class。
- 補上型別、資料庫型別、模板篩選、表單套用與輸出 routing 測試。

## 修改檔案

- `frontend/src/types/models.ts`
- `frontend/src/types/database.types.ts`
- `frontend/src/config/reportTemplates.ts`
- `frontend/src/config/reportTypes.ts`
- `frontend/src/composables/useReportForm.ts`
- `frontend/src/views/ReportCreateView.vue`
- `frontend/src/composables/reportStrategies/index.ts`
- `frontend/tests/composables/useReportForm.spec.ts`
- `frontend/tests/composables/useReportStrategies.spec.ts`
- `frontend/tests/composables/useReportTemplate.spec.ts`
- `docs/history/2026-11-18-phase-8-youth-policy-update-template.md`

## README 檢查結果

- `README.md`：已檢查，本階段不需更新。
- `frontend/README.md`：已檢查，本階段不需更新。

## 驗證結果

- targeted tests：3 個 test files、39/39 通過。
- full tests：21 個 test files、135/135 通過。
- `npm run build`：通過。
