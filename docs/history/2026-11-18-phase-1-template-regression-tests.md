---
title: Phase 1 新增模板回歸測試
version: v1.0
date: 2026-11-18
status: Active
author: Linetra Dev Team
---

# Phase 1 新增模板回歸測試

## 異動原因

在開始模板架構優化前，先補足現有模板註冊、模板套用與輸出策略的回歸測試，建立後續重構的安全基準。

## 改動方向

- 驗證 `REPORT_TEMPLATES` 的 key、id、欄位與 item 定義一致。
- 驗證所有模板的 item 順序與可自訂旗標會被表單正確保留。
- 補齊 weekly report、briefing、announcement 的 strategy routing 測試。
- 本階段不修改 production code。

## 修改檔案

- `frontend/tests/config/reportTemplates.spec.ts`
- `frontend/tests/composables/useReportForm.spec.ts`
- `frontend/tests/composables/useReportTemplate.spec.ts`
- `docs/history/2026-11-18-phase-1-template-regression-tests.md`

## README 檢查結果

- `README.md`：已檢查，本階段不需更新。
- `frontend/README.md`：已檢查，本階段不需更新。

## 驗證結果

- targeted tests：3 個 test files、25/25 通過。
- full tests：20 個 test files、108/108 通過。
- `npm run build`：通過。
