---
title: Linetra — Markdown Standards
version: v1.0
date: 2026-05-25
status: Active
author: Linetra Dev Team
---

# Linetra Markdown Standards

## YAML Front Matter
All `.md` files in the project (except `README.md`) **MUST** start with a YAML header:

```yaml
---
title: Document Title
version: v1.0
date: YYYY-MM-DD
status: Active
author: Author Name
---
```

## Mandatory Table
Documentation files should include a metadata table following the header:

| 屬性 (Metadata) | 內容 (Content) |
| :--- | :--- |
| **文件版本 (Version)** | `v1.0` |
| **最後更新 (Last Updated)** | 2026-05-25 |

## Emoji Policy
- Do **NOT** use emojis in technical documentation or commit messages.
- The pre-commit hook will automatically strip them.

## README.md Exception
`README.md` files do **NOT** require YAML headers but should follow standard Markdown structure.
