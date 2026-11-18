---
title: Linetra Architecture 文件索引
version: v1.0
date: 2026-11-19
status: Active
author: Linetra Dev Team
---

# Architecture 文件索引

`docs/architecture/` 存放描述系統與程式架構的穩定文件，回答「系統由哪些元件組成、各層負責什麼、資料如何流動，以及安全邊界在哪裡」。

## 與 `docs/guides/` 的差異

| 目錄 | 內容 | 常見問題 |
| --- | --- | --- |
| `architecture/` | 系統邊界、資料模型、分層、狀態機與長期設計 | 系統如何組成？責任如何分工？ |
| `guides/` | 建置、操作、功能擴充、測試與驗證步驟 | 如何設定？如何新增？如何驗證？ |
| `guides/archive/` | 已完成或被取代的計畫與 migration 歷史 | 過去為什麼這樣做？ |

## 文件索引

| 文件 | 用途 |
| --- | --- |
| [system_architecture.md](system_architecture.md) | 系統邊界、Vue 前端、Supabase 與資料流總覽 |
| [project_architecture_guidelines.md](project_architecture_guidelines.md) | repository 結構、前端分層、模板架構、測試與開發規範 |
| [database_design.md](database_design.md) | Supabase schema、enum、foreign key、index、trigger、function 與 RLS |
| [state_machine.md](state_machine.md) | 報告狀態與生命週期規則 |
| [edge_functions_design.md](edge_functions_design.md) | Edge Functions、Cron 與通知功能的未來規劃 |

## 放置規則

- 描述跨功能的系統設計或穩定分層，放在本目錄。
- 描述目前資料庫實際狀態，放在 `database_design.md`，不要散落在 guides。
- 描述尚未實作但會影響系統邊界的功能，仍可放在本目錄，但必須標記 `Planned` 或 `Draft`。
- 具體操作步驟、初始化指令與驗證流程應放到 `docs/guides/`。
- 一次性計畫或已完成 migration 不應留在現行 architecture 文件中，應移到 `docs/guides/archive/`。
