---
title: 將處務會議與市長報告模板預設狀態設為 completed
version: v1.0
date: 2026-11-18
status: Active
author: Linetra Dev Team
---

# 將處務會議與市長報告模板預設狀態設為 completed

## 異動原因

處務會議、市長週報與市長面報屬於已完成整理後即可通報的報告類型，建立新報告時不應預設為待辦狀態。

## 改動方向

- 將 `meeting`、`weekly_report`、`briefing` 的 `behavior.initialStatus` 改為 `completed`。
- 沿用既有 metadata 驅動的 lifecycle 流程，不新增模板 ID 硬編碼。
- 保持 `meeting_simple`、`announcement`、`task` 與其他模板的既有狀態行為。

## 修改檔案

- `frontend/src/config/reportTemplates.ts`
- `frontend/tests/composables/useReportLifecycle.spec.ts`
- `docs/history/2026-11-18-set-meeting-report-status-completed.md`

## README 檢查結果

- `README.md`：已檢查，本次不需更新。
- `frontend/README.md`：已檢查，本次不需更新。

## 驗證結果

- targeted tests：3 個 test files、28/28 通過。
- full tests：21 個 test files、135/135 通過。
- `npm run build`：通過。

## 其他工作樹變更

- `docs/guides/report_template_extension_guide.md` 是先前要求建立但尚未提交的文件，本次不納入提交。
