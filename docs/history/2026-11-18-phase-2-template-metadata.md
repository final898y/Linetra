---
title: Phase 2 整理模板行為 metadata
version: v1.0
date: 2026-11-18
status: Active
author: Linetra Dev Team
---

# Phase 2 整理模板行為 metadata

## 異動原因

目前模板的日期顯示、Calendar 類型與初始狀態等行為分散在不同 composable 與 View 中，新增模板時容易增加硬編碼條件。

## 改動方向

- 擴充 `TemplateConfig`，加入模板行為設定。
- 加入欄位輸入型態 metadata，先描述既有 meeting time 的 `datetime-local` 行為。
- 將模板初始 status 改由設定取得，同時保留 announcement 的既有行為。
- 本階段尚未修改 `ReportCreateView.vue` 使用 metadata，下一階段再處理表單渲染。

## 修改檔案

- `frontend/src/config/reportTemplates.ts`
- `frontend/src/composables/useReportLifecycle.ts`
- `frontend/tests/config/reportTemplates.spec.ts`
- `docs/history/2026-11-18-phase-2-template-metadata.md`

## README 檢查結果

- `README.md`：已檢查，本階段不需更新。
- `frontend/README.md`：已檢查，本階段不需更新。

## 驗證結果

- targeted tests：3 個 test files、24/24 通過。
- full tests：20 個 test files、110/110 通過。
- `npm run build`：通過。
