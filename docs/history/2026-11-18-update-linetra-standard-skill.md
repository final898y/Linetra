---
title: 更新 Linetra Standard Skill 的 commit 規範
version: v1.0
date: 2026-11-18
status: Active
author: Linetra Dev Team
---

# 更新 Linetra Standard Skill 的 commit 規範

## 異動原因

補充每次 commit 前的變更追蹤要求，讓提交內容除了保留自動化 commit log，也能留下完整的變更背景與文件同步檢查結果。

## 改動方向

- 建立 `docs/history/` 作為每次提交的詳細歷史紀錄位置。
- 要求紀錄異動原因、改動方向與實際修改的檔案。
- 要求每次 commit 前檢查根目錄 `README.md` 與 `frontend/README.md` 是否需要更新。
- 保留 `docs/product/COMMIT_LOG.md` 由 Git Hook 維護的既有流程，區分自動 log 與人工變更說明。

## 修改檔案

- `tools/skills/linetra-standard/SKILL.md`
- `tools/skills/README.md`
- `docs/history/2026-11-18-update-linetra-standard-skill.md`

## README 檢查結果

- `README.md`：已檢查，目前不需更新。
- `frontend/README.md`：已檢查，目前不需更新。
