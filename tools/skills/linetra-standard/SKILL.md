---
name: linetra-standard
description: Linetra 專案開發規範。適用於 Linetra 儲存庫中的所有作業，包含 Commit 格式驗證、Markdown 標準化、目錄結構規範及自動化日誌管理。
title: Linetra — Standard Skill Instructions
version: v1.0
date: 2026-06-24
status: Active
author: Linetra Dev Team
---

# Linetra Standard Skill

本 Skill 提供 Linetra 專案的核心開發規範，確保所有參與開發的 AI 代理人與開發者遵循一致的標準。

## 核心規範

### 1. 回覆語言
- 始終使用 **繁體中文 (Traditional Chinese)** 進行所有回覆、程式碼註解及文件撰寫。

### 2. Commit 訊息規範
- 必須遵循 Conventional Commits 格式。
- 詳細規範與範例請參閱 [commit_standards.md](references/commit_standards.md)。
- **操作流程**：
    1. 準備提交前，執行 `git diff --staged` 確認內容。
    2. 撰寫符合規範的訊息。
    3. 在提交前（`pre-commit` 階段），Hook 會自動取得 HEAD 資訊，將上一次提交的 `[Hash: Pending]` 與 `[Message: Pending]` 回填為真實的 Commit Hash、主旨與正文。
    4. 隨後，Hook 會自動分析暫存區，向 `docs/product/COMMIT_LOG.md` 寫入本次提交日誌 Stub（此時 Hash 與 Message 為 Pending）並自動執行 `git add`。
    5. 在 `commit-msg` 階段，Hook 僅會對本次的 Commit 訊息進行格式驗證，不再修改磁碟檔案，以確保提交後工作區保持乾淨。

### 3. Markdown 文件標準
- 所有 `.md` 檔案（`README.md` 除外）必須包含 YAML Header 及 Metadata 表格。
- 禁止在文件中使用 Emoji。
- 詳細規範請參閱 [markdown_standards.md](references/markdown_standards.md)。

### 4. 目錄結構 (Monorepo)
- **後端**：位於 `/backend`。
- **前端**：位於 `/frontend`。
- **文件**：位於 `/docs`。
- **工具/鉤子**：位於 `/tools`。

### 5. Git Hooks 管理
- 本專案已配置 `pre-commit`, `commit-msg`, `post-commit`。
- 若 Hook 執行失敗，應檢查 `tools/git-hooks/` 下的對應 Helper 腳本。

## 常用工具指令
- **安裝 Hooks**：`powershell.exe -NoProfile -ExecutionPolicy Bypass -File tools/git-hooks/install_hooks.ps1 -Force`
- **查看日誌**：`cat docs/product/COMMIT_LOG.md`
