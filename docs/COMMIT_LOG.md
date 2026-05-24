---
title: Linetra — 專案提交日誌 (Commit Log)
version: v1.0
date: 2026-05-25
status: Active
author: Linetra Dev Team
---

# Linetra 專案提交日誌 (Commit Log)
此檔案由 Git Hook 自動更新，記錄每次提交的詳細內容。

---

### [2026-05-24 12:44:13 +0800] chore: initialize project structure and setup Git pre-commit hook

**變更檔案 (Changed Files):**
- .gitignore
- README.md
- docs/product/prd.md
- docs/project_architecture_guidelines.md
- tools/git-hooks/install_hooks.ps1
- tools/git-hooks/pre_commit_markdown_helper.py

---

### [2026-05-24 18:29:31 +0800] fix(git-hooks): resolve pre-commit hook failure on Windows pwsh
- Simplify python detection logic in pre-commit hook shell script
- Use English messages in hook to avoid encoding issues in Windows Git Bash
- Standardize line endings (LF) for pre-commit file
- Optimize helper script by removing debug prints and improving UTF-8 handling

**變更檔案 (Changed Files):**
- tools/git-hooks/install_hooks.ps1
- tools/git-hooks/pre_commit_markdown_helper.py

---

### [2026-05-24 23:53:27 +0800] feat(git-hooks): add commit-msg and post-commit hooks and MIT license
- Add commit-msg hook to validate conventional commit messages
- Add post-commit hook to automate commit logging in docs/COMMIT_LOG.md
- Add MIT License and update README.md
- Modularize install_hooks.ps1 to support multiple hooks
- Exclude README.md from pre-commit markdown standardization

**變更檔案 (Changed Files):**
- LICENSE
- README.md
- docs/COMMIT_LOG.md
- tools/git-hooks/commit_msg_helper.py
- tools/git-hooks/install_hooks.ps1
- tools/git-hooks/post_commit_log_helper.py
- tools/git-hooks/pre_commit_markdown_helper.py

---
