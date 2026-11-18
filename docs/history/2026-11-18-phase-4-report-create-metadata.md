---
title: Phase 4 讓報告建立頁使用模板 metadata
version: v1.0
date: 2026-11-18
status: Active
author: Linetra Dev Team
---

# Phase 4 讓報告建立頁使用模板 metadata

## 異動原因

`ReportCreateView.vue` 原本直接判斷 `meeting_simple`，新增具有特殊欄位或日期行為的模板時需要再次修改 View。

## 改動方向

- 以 `currentTemplateConfig.behavior.showDueDates` 控制模板日期區塊。
- 以 item 的 `inputType` metadata 控制 `datetime-local` 輸入。
- 編輯既有報告時，依目前模板重新補回 item input metadata。
- 保留 general、announcement 與既有模板的原本輸入行為。

## 修改檔案

- `frontend/src/composables/useReportForm.ts`
- `frontend/src/views/ReportCreateView.vue`
- `frontend/tests/composables/useReportForm.spec.ts`
- `docs/history/2026-11-18-phase-4-report-create-metadata.md`

## README 檢查結果

- `README.md`：已檢查，本階段不需更新。
- `frontend/README.md`：已檢查，本階段不需更新。

## 驗證結果

- targeted tests：2 個 test files、22/22 通過。
- full tests：20 個 test files、111/111 通過。
- `npm run build`：通過。
