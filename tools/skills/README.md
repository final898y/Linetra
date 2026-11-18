---
title: Linetra — Skills Directory Guide
version: v1.1
date: 2026-11-18
status: Active
author: Linetra Dev Team
---

# Linetra Project Skills

此目錄存放 Linetra 專案專屬的 Gemini CLI Skills，用於規範 AI 代理人的作業流程。

## 目錄結構
- `linetra-standard/`: Skill 的原始碼（包含 `SKILL.md` 與參考文件）。
- `linetra-standard.skill`: 已封裝的 Skill 檔案，可直接安裝。

## Commit 前置要求
每次 commit 前都必須：

1. 在 `docs/history/` 建立本次提交的歷史紀錄檔，詳細記錄異動原因、改動方向與實際修改的檔案。
2. 檢查根目錄 `README.md` 與 `frontend/README.md` 是否需要同步更新；若不需更新，也要在歷史紀錄中記錄檢查結果與原因。
3. 將歷史紀錄檔與需要提交的變更一併加入暫存區，再依 `linetra-standard` 的 commit 流程提交。

歷史紀錄檔建議命名為 `docs/history/<YYYY-MM-DD>-<topic>.md`；`docs/product/COMMIT_LOG.md` 仍由 Git Hook 維護，兩者用途不同。

## 安裝方式
請在專案根目錄執行以下指令進行安裝（建議安裝在 Workspace 範圍）：

```powershell
gemini skills install tools/skills/linetra-standard.skill --scope workspace
```

安裝完成後，請務必 en Gemini CLI 中執行：
```text
/skills reload
```

## 維護與更新
1. 修改 `linetra-standard/` 中的內容。
2. 重新封裝（若無內建工具，可使用 Python 壓縮成 zip 並改名為 .skill）。
3. 提交變更至 Git。
