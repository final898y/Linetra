---
title: Phase 7 集中下游模板行為
version: v1.0
date: 2026-11-18
status: Active
author: Linetra Dev Team
---

# Phase 7 集中下游模板行為

## 異動原因

Google Calendar、報告卡片與報告詳細頁仍直接判斷 `meeting_simple`，新增其他特殊模板時需要重複修改多個下游元件。

## 改動方向

- 新增 `getReportBehavior()`，為模板與非模板報告提供一致的下游行為預設值。
- Calendar 行為改由 `calendarMode` 決定。
- ReportCard 與 ReportDetailView 的日期顯示改由 `showDueDates` 決定。
- 保留 announcement、task 的專屬卡片樣式，避免過度泛化產品語意。
- 新增 Calendar、卡片與詳細頁的回歸測試。

## 修改檔案

- `frontend/src/config/reportTemplates.ts`
- `frontend/src/composables/useFABActions.ts`
- `frontend/src/components/common/ReportCard.vue`
- `frontend/src/views/ReportDetailView.vue`
- `frontend/tests/config/reportTemplates.spec.ts`
- `frontend/tests/composables/useFABActions.spec.ts`
- `frontend/tests/components/common/ReportCard.spec.ts`
- `frontend/tests/views/ReportDetailView.spec.ts`
- `docs/history/2026-11-18-phase-7-downstream-template-behavior.md`

## README 檢查結果

- `README.md`：已檢查，本階段不需更新。
- `frontend/README.md`：已檢查，本階段不需更新。

## 驗證結果

- targeted tests：4 個 test files、17/17 通過。
- full tests：21 個 test files、131/131 通過。
- `npm run build`：通過。
