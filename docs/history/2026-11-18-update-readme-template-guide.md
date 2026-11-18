---
title: 更新 README 與報告模板擴充指南
version: v1.0
date: 2026-11-18
status: Active
author: Linetra Dev Team
---

# 更新 README 與報告模板擴充指南

## 異動原因

近期已完成模板 metadata、Strategy registry、型別整理、下游行為集中與青年政策模板等架構變更，根目錄 README 的模板數量、最後更新日期與文件索引已經過時。

## 改動方向

- 更新根目錄 README 的最後更新日期。
- 將模板數量由 7 種更新為 8 種，加入青年政策及資源定期更新模板。
- 補充模板 metadata 與 Strategy registry 的架構說明。
- 新增報告模板擴充指南的文件連結。
- 將先前建立但尚未提交的 `report_template_extension_guide.md` 一併納入版本控制。

## 修改檔案

- `README.md`
- `docs/guides/report_template_extension_guide.md`
- `docs/history/2026-11-18-update-readme-template-guide.md`

## README 檢查結果

- `README.md`：已更新，補充模板架構與指南連結。
- `frontend/README.md`：已檢查，目前不需更新；本次變更是根目錄架構與開發指南索引。

## 驗證結果

- full tests：21 個 test files、135/135 通過。
- `npm run build`：通過。
- `git diff --check`：通過，僅保留既有 CRLF 轉換提示。
