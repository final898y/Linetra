---
title: Phase 5 統一報告模板與項目型別
version: v1.0
date: 2026-11-18
status: Active
author: Linetra Dev Team
---

# Phase 5 統一報告模板與項目型別

## 異動原因

`TemplateType` 與 `ItemType` 的值分散在 models、Zod schema、模板設定與表單 cast 中，且 `schemas.ts` 漏掉已支援的 `task` 類型，造成型別與驗證規則不一致。

## 改動方向

- 在 `models.ts` 建立共用的 `ItemType` 常數與 `ReportTemplateType` 型別。
- 讓 `schemas.ts` 由共用常數建立 enum，補齊 `task`。
- 將 `REPORT_TEMPLATES` 限制為真正的模板類型，避免 general、announcement、task 被當成模板設定。
- 使用 type guard 安全處理非模板模式。
- 將表單儲存處的 item type cast 改用共用 `ItemType`。
- 新增所有 TemplateType 與 ItemType 的 schema 驗證測試。

## 修改檔案

- `frontend/src/types/models.ts`
- `frontend/src/types/schemas.ts`
- `frontend/src/config/reportTemplates.ts`
- `frontend/src/composables/useReportForm.ts`
- `frontend/src/composables/useReportLifecycle.ts`
- `frontend/src/views/ReportCreateView.vue`
- `frontend/tests/types/schemas.spec.ts`
- `docs/history/2026-11-18-phase-5-report-types.md`

## README 檢查結果

- `README.md`：已檢查，本階段不需更新。
- `frontend/README.md`：已檢查，本階段不需更新。

## 驗證結果

- targeted tests：3 個 test files、39/39 通過。
- full tests：21 個 test files、128/128 通過。
- `npm run build`：通過。
