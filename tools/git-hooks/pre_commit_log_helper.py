#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Git Pre-commit Hook - Commit Log Starter & Hash Backfiller
此腳本在提交前執行：
1. 自動取得 HEAD Commit Hash 並回填至日誌檔案中上一次提交的 [Hash: Pending] 標籤。
2. 取得本次暫存 (Staged) 的檔案清單，在日誌中為本次提交建立 Stub 紀錄並標記為 [Hash: Pending] 與 [Message: Pending]。
3. 自動執行 `git add` 將更新後的日誌檔案納入當前提交。
"""

import os
import sys
import subprocess
from datetime import datetime

# 強制使用 UTF-8 輸出
sys.stdout.reconfigure(encoding="utf-8")

LOG_FILE = "docs/product/COMMIT_LOG.md"

def get_latest_commit_hash():
    """
    取得目前 HEAD 的 Commit Hash
    """
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--short", "HEAD"],
            capture_output=True,
            text=True,
            check=True,
            encoding="utf-8"
        )
        return result.stdout.strip()
    except Exception:
        return None

def get_staged_files():
    """
    取得本次暫存的變更檔案清單
    """
    try:
        result = subprocess.run(
            ["git", "diff", "--cached", "--name-only", "--diff-filter=ACM"],
            capture_output=True,
            text=True,
            check=True,
            encoding="utf-8"
        )
        files = result.stdout.strip().split("\n")
        return [f for f in files if f]
    except Exception:
        return []

def main():
    # 1. 取得本次 Staged 的檔案（排除日誌本身，避免空提交）
    staged_files = get_staged_files()
    staged_files_clean = [f for f in staged_files if f != LOG_FILE]
    
    if not staged_files_clean:
        # 沒有其他變更，不用產生新的日誌 Stub
        sys.exit(0)

    file_exists = os.path.exists(LOG_FILE)
    content = ""
    
    if file_exists:
        with open(LOG_FILE, "r", encoding="utf-8") as f:
            content = f.read()

    # 2. 回填前一次 Commit 的 Hash (回填上一次的 Pending Hash)
    last_hash = get_latest_commit_hash()
    if last_hash and "[Hash: Pending]" in content:
        content = content.replace("[Hash: Pending]", last_hash, 1)

    # 3. 準備本次的日誌 Stub 內容
    today_str = datetime.today().strftime("%Y-%m-%d %H:%M:%S")
    files_list_str = "\n".join([f"- {f}" for f in staged_files_clean])
    
    # 建立日誌 Stub，待 commit-msg 補上真實訊息，並保留 [Hash: Pending] 等下次提交時回填
    new_entry = (
        f"\n### [{today_str}] [Message: Pending]\n"
        f"- **Commit Hash:** `[Hash: Pending]`\n\n"
        f"**變更檔案 (Changed Files):**\n"
        f"{files_list_str}\n\n"
        f"---\n"
    )

    # 4. 寫回日誌檔案
    try:
        os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
        with open(LOG_FILE, "w", encoding="utf-8") as f:
            if not file_exists:
                f.write("---\n")
                f.write("title: Linetra — 專案提交日誌 (Commit Log)\n")
                f.write("version: v1.0\n")
                f.write(f"date: {datetime.today().strftime('%Y-%m-%d')}\n")
                f.write("status: Active\n")
                f.write("author: Linetra Dev Team\n")
                f.write("---\n\n")
                f.write("# Linetra 專案提交日誌 (Commit Log)\n")
                f.write("此檔案由 Git Hook 自動更新，記錄每次提交的詳細內容。\n\n---\n")
            
            # 寫回已更新（回填 Hash）的原內容，並追加本次 Stub
            if file_exists:
                f.write(content)
            f.write(new_entry)
            
        print(f"-> [LOGGED] 已建立本次提交日誌 Stub 並更新至 {LOG_FILE}")
        
        # 5. 自動執行 git add 將日誌變更納入本次提交
        subprocess.run(["git", "add", LOG_FILE], check=True)
        
    except Exception as e:
        print(f"[ERROR] 更新日誌檔案時發生錯誤: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
