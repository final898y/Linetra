#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Git Post-commit Hook - Automated Commit Logger
此腳本在提交完成後執行，自動將提交資訊紀錄至 COMMIT_LOG.md。
紀錄內容包括：日期、提交訊息、變更檔案清單。
"""

import os
import sys
import subprocess
from datetime import datetime

# 強制使用 UTF-8 輸出
sys.stdout.reconfigure(encoding="utf-8")

LOG_FILE = "docs/COMMIT_LOG.md"

def get_latest_commit_info():
    """
    取得最後一次提交的資訊
    """
    try:
        # 取得格式化資訊: [日期] 標題 \n 正文
        # %ad: 日期, %s: 主旨, %b: 正文
        result = subprocess.run(
            ["git", "log", "-1", "--pretty=format:### [%ad] %s%n%b", "--date=iso"],
            capture_output=True,
            text=True,
            check=True,
            encoding="utf-8"
        )
        msg = result.stdout.strip()

        # 取得變更檔案清單
        files_result = subprocess.run(
            ["git", "show", "--name-only", "--pretty=format:", "HEAD"],
            capture_output=True,
            text=True,
            check=True,
            encoding="utf-8"
        )
        files = files_result.stdout.strip().split("\n")
        files_str = "\n".join([f"- {f}" for f in files if f])

        return msg, files_str
    except Exception as e:
        print(f"[ERROR] 無法取得 Git 提交資訊: {str(e)}")
        return None, None

def main():
    msg, files = get_latest_commit_info()
    if not msg:
        sys.exit(0)

    # 準備寫入內容
    log_entry = f"\n{msg}\n\n**變更檔案 (Changed Files):**\n{files}\n\n---\n"

    file_exists = os.path.exists(LOG_FILE)

    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
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
            
            f.write(log_entry)
        
        print(f"-> [LOGGED] 提交資訊已追加至 {LOG_FILE}")
        
        # 可選：自動執行 git add，讓日誌變更進入下一次的暫存區
        subprocess.run(["git", "add", LOG_FILE], check=False)

    except Exception as e:
        print(f"[ERROR] 寫入日誌檔案時發生錯誤: {str(e)}")

if __name__ == "__main__":
    main()
