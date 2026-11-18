---
title: Linetra Guides 文件索引
version: v1.0
date: 2026-11-19
status: Active
author: Linetra Dev Team
---

# Guides 文件索引

`docs/guides/` 存放可依步驟執行的建置、開發、功能擴充、測試與驗證文件，回答「要怎麼設定、怎麼使用、怎麼新增功能」。

## 與 `docs/architecture/` 的差異

- `docs/architecture/` 描述系統設計與穩定責任邊界，不以操作步驟為主。
- `docs/guides/` 描述操作與開發流程，內容應能被開發者直接依循。
- `docs/guides/archive/` 保存已完成、被取代或不再適合作為現行依據的文件。

## 現行 Guides

| 文件 | 用途 |
| --- | --- |
| [local_setup.md](local_setup.md) | 本機開發環境設定 |
| [supabase_setup_guide.md](supabase_setup_guide.md) | Supabase 建置、migration 與驗證 |
| [vue3-ts-eslint-prettier-setup.md](vue3-ts-eslint-prettier-setup.md) | Vue、TypeScript、ESLint 與 Prettier 設定 |
| [report_template_extension_guide.md](report_template_extension_guide.md) | 新增報告模板的完整流程 |
| [document_template_and_key_notes_lecture.md](document_template_and_key_notes_lecture.md) | 公文範本與重點記事功能規格 |
| [report_filter_improvement_plan.md](report_filter_improvement_plan.md) | 目前進行中的報告篩選改善計畫 |
| [frontend_spec.md](frontend_spec.md) | 舊連結導引；內容已整併至架構指南 |

## Archive

已完成或不再適合作為現行依據的計畫與 migration 請查看 [archive/README.md](archive/README.md)。

## 放置規則

- 可執行的建置或驗證步驟，放在本目錄。
- 尚未完成的工作計畫可放在本目錄，並標記 `Draft` 或 `In Progress`；若數量增加，應再建立 `plans/`。
- 已完成的一次性 migration、已實作的重構計畫與過時方案，移至 `archive/`。
- schema 欄位、RLS、index 與 trigger 的權威內容一律回到 [database_design.md](../architecture/database_design.md)。
- 每次 commit 前檢查根目錄 `README.md` 與 `frontend/README.md` 是否需要更新。
