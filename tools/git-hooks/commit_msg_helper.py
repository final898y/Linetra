#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Git Commit-msg Hook - Conventional Commits Validator
此腳本為 Linetra 專案的 Git 提交訊息驗證鉤子。
它確保提交訊息符合以下格式：
<type>(<scope>): <subject>

類型 (type) 必須是下列之一：
feat, fix, docs, style, refactor, perf, test, chore

常見範圍 (scope)：
frontend, backend, docs, db, root
"""

import sys
import re
import os

LOG_FILE = "docs/product/COMMIT_LOG.md"

# 強制使用 UTF-8 輸出
sys.stdout.reconfigure(encoding="utf-8")

# 定義正規表達式
# 格式: <type>(<scope>): <subject>
# 允許 type: feat|fix|docs|style|refactor|perf|test|chore
# 允許 scope: 任何非空字串 (通常建議 frontend|backend|docs|db)
COMMIT_MSG_REGEX = re.compile(
    r"^(feat|fix|docs|style|refactor|perf|test|chore)(\([a-z0-9_-]+\))?:\s+.+$",
    re.MULTILINE
)

VALID_TYPES = ["feat", "fix", "docs", "style", "refactor", "perf", "test", "chore"]

def main():
    # Git 會將存放 commit 訊息的暫存檔案路徑作為第一個參數傳入
    if len(sys.argv) < 2:
        print("[ERROR] 缺少 commit 訊息檔案路徑參數。")
        sys.exit(1)

    commit_msg_filepath = sys.argv[1]

    try:
        with open(commit_msg_filepath, "r", encoding="utf-8-sig") as f:
            lines = f.readlines()
            
            # 忽略以 # 開頭的註解行 (Git 合併或編輯時產生的) 并保留乾淨的訊息內容
            clean_lines = [line for line in lines if not line.strip().startswith("#")]
            
            if not clean_lines or not "".join(clean_lines).strip():
                print("[ERROR] Commit 訊息不能為空。")
                sys.exit(1)
            
            # 第一行為主旨 (Subject line)
            subject_line = clean_lines[0].strip()
            # 剩餘為說明正文 (Body)
            body = "".join(clean_lines[1:]).strip()

            if not COMMIT_MSG_REGEX.match(subject_line):
                print("\n[ERROR] Commit 訊息格式不正確！")
                print("-" * 40)
                print(f"您的訊息: {subject_line}")
                print("-" * 40)
                print("正確格式範例:")
                print("  feat(frontend): 實作登入功能")
                print("  fix(backend): 修正 API 逾時問題")
                print("  docs(root): 更新 README 文件")
                print("-" * 40)
                print("允許的類型 (type):")
                print(f"  {', '.join(VALID_TYPES)}")
                print("範圍 (scope) 是可選的，需用括號包圍，例如 (frontend)。")
                print("-" * 40)
                sys.exit(1)


        print("-> [PASS] Commit 訊息格式驗證通過")
        sys.exit(0)

    except Exception as e:
        print(f"[ERROR] 驗證 commit 訊息時發生錯誤: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
