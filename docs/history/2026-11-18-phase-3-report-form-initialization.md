---
title: Phase 3 整理報告表單初始化流程
version: v1.0
date: 2026-11-18
status: Active
author: Linetra Dev Team
---

# Phase 3 整理報告表單初始化流程

## 異動原因

`useReportForm` 同時透過明確操作與 watcher 處理模式、模板切換，可能造成表單初始化與模板套用重複執行，也讓後續 metadata 化較難接入。

## 改動方向

- 以 `applyTemplate()` 作為模板套用的明確入口。
- 移除 `activeTab` 與 `currentTemplate` 的重複 watcher。
- 暴露 `currentTemplateConfig`，供後續 `ReportCreateView.vue` 讀取模板行為設定。
- 保留既有模式切換、模板預設值與 localStorage 行為。

## 修改檔案

- `frontend/src/composables/useReportForm.ts`
- `frontend/tests/composables/useReportForm.spec.ts`
- `docs/history/2026-11-18-phase-3-report-form-initialization.md`

## README 檢查結果

- `README.md`：已檢查，本階段不需更新。
- `frontend/README.md`：已檢查，本階段不需更新。

## 驗證結果

- targeted tests：1 個 test file、18/18 通過。
- full tests：20 個 test files、111/111 通過。
- `npm run build`：通過。
