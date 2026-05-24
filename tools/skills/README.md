---
title: Linetra — Skills Directory Guide
version: v1.0
date: 2026-05-25
status: Active
author: Linetra Dev Team
---

# Linetra Project Skills

此目錄存放 Linetra 專案專屬的 Gemini CLI Skills，用於規範 AI 代理人的作業流程。

## 目錄結構
- `linetra-standard/`: Skill 的原始碼（包含 `SKILL.md` 與參考文件）。
- `linetra-standard.skill`: 已封裝的 Skill 檔案，可直接安裝。

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
