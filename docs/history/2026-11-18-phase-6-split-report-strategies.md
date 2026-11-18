---
title: Phase 6 拆分報告輸出 Strategy
version: v1.0
date: 2026-11-18
status: Active
author: Linetra Dev Team
---

# Phase 6 拆分報告輸出 Strategy

## 異動原因

所有報告輸出 Strategy 原本集中在單一檔案，新增或維護模板時需要在大型檔案中尋找不同 class，增加修改範圍與誤改風險。

## 改動方向

- 將報告資料介面與 Strategy 介面移至 `reportStrategies/types.ts`。
- 將共用 `BaseStrategy` 與 separator 移至 `baseStrategy.ts`。
- 每個報告模式使用獨立的 Strategy 檔案。
- 將 registry 集中在 `reportStrategies/index.ts`。
- 保留 `useReportStrategies.ts` 的既有匯出入口，避免下游程式與測試改變 import path。
- 不修改任何輸出字串或 Strategy 行為。

## 修改檔案

- `frontend/src/composables/useReportStrategies.ts`
- `frontend/src/composables/reportStrategies/types.ts`
- `frontend/src/composables/reportStrategies/baseStrategy.ts`
- `frontend/src/composables/reportStrategies/generalStrategy.ts`
- `frontend/src/composables/reportStrategies/meetingStrategy.ts`
- `frontend/src/composables/reportStrategies/meetingSimpleStrategy.ts`
- `frontend/src/composables/reportStrategies/weeklyStrategy.ts`
- `frontend/src/composables/reportStrategies/briefingStrategy.ts`
- `frontend/src/composables/reportStrategies/announcementStrategy.ts`
- `frontend/src/composables/reportStrategies/taskStrategy.ts`
- `frontend/src/composables/reportStrategies/index.ts`
- `docs/history/2026-11-18-phase-6-split-report-strategies.md`

## README 檢查結果

- `README.md`：已檢查，本階段不需更新。
- `frontend/README.md`：已檢查，本階段不需更新。

## 驗證結果

- Strategy targeted tests：18/18 通過。
- full tests：21 個 test files、128/128 通過。
- `npm run build`：通過。
