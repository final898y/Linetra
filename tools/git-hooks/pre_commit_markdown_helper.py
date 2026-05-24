#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Git Pre-commit Hook - Markdown Standardizer & Emoji Cleaner
此腳本為 Linetra 專案的 Git 提交前攔截鉤子。
在執行 `git commit` 時，它會自動：
1. 找出本次提交中已暫存 (Staged) 的所有 `.md` 檔案。
2. 自動清除這些 Markdown 檔案中的所有 Emoji 表情符號。
3. 檢查檔案頭部是否包含合規的 YAML Front Matter 與必要屬性。
4. 自動將 YAML 與 Metadata 表格中的「最後更新日期」更新為今天。
5. 若檔案被修改，自動重新執行 `git add` 將變更納入本次提交。
"""

import os
import re
import sys
import subprocess
from datetime import datetime


# 強制使用 UTF-8 輸出以避免 Windows cp950 編碼問題
sys.stdout.reconfigure(encoding="utf-8")

# 精確定義 Unicode 中常見 Emoji 與符號的範圍
EMOJI_PATTERNS = [
    r"[\U0001F000-\U0001F9FF]",  # 現代常見 Emoji 表情、手勢、交通工具等 (1F000 - 1F9FF)
    r"[\u2600-\u27BF]",  # 雜項符號與裝飾符號 (2600 - 27BF)
    r"[\u2300-\u23FF]",  # 雜項技術符號 (2300 - 23FF)
    r"[\u2B50\u2B55\u2B1B\u2B1C]",  # 星星、圓圈、方塊等特殊符號
    r"[\u2934\u2935]",  # 特殊轉折箭頭
]
EMOJI_REGEX = re.compile("|".join(EMOJI_PATTERNS))

# YAML Front Matter 必要屬性
REQUIRED_KEYS = ["title", "version", "date", "status", "author"]


def get_staged_markdown_files():
    """
    取得目前 Git 暫存區中被新增或修改的 .md 檔案清單
    """
    try:
        # 執行 git diff 取得暫存檔案名稱
        result = subprocess.run(
            ["git", "diff", "--cached", "--name-only", "--diff-filter=ACM"],
            capture_output=True,
            text=True,
            check=True,
        )
        files = result.stdout.strip().split("\n")
        return [f for f in files if f.endswith(".md") and os.path.exists(f)]
    except Exception as e:
        print(f"錯誤: 無法取得 Git 暫存檔案清單: {str(e)}")
        return []


def clean_emojis(text):
    """
    移除文字中的表情符號
    """
    return EMOJI_REGEX.sub("", text)


def validate_and_update_header(file_path, content):
    """
    驗證 YAML Front Matter 是否合規，並自動更新「最後更新日期」
    """
    today_str = datetime.today().strftime("%Y-%m-%d")

    # 1. 匹配最開頭的 YAML front matter
    match = re.match(r"^---\s*\n(.*?)\n---\s*\n", content, re.DOTALL)
    if not match:
        return (
            False,
            "缺少 YAML 元數據開頭 (YAML Front Matter)。請在檔案最上方加上 '---' 包裹的必要欄位。",
            content,
        )

    yaml_content = match.group(1)

    # 2. 檢查必要屬性是否存在
    missing_keys = []
    for key in REQUIRED_KEYS:
        if not re.search(rf"^{key}\s*:", yaml_content, re.MULTILINE):
            missing_keys.append(key)

    if missing_keys:
        err_msg = (
            f"YAML 元數據中缺少必要欄位: {', '.join(missing_keys)}\n"
            f"標準格式必須包含下列欄位:\n"
            f"---\n"
            f"title: 檔案標題\n"
            f"version: v1.0\n"
            f"date: YYYY-MM-DD\n"
            f"status: Active\n"
            f"author: 作者名稱\n"
            f"---"
        )
        return False, err_msg, content

    # 3. 自動更新 YAML 中的 date 屬性為今天
    new_content = re.sub(
        r"(^date\s*:\s*)\S+", rf"\g<1>{today_str}", content, count=1, flags=re.MULTILINE
    )

    # 4. 自動更新 Markdown 表格中的「最後更新 (Last Updated)」日期為今天
    # 匹配格式: | **最後更新 (Last Updated)** | 2026-05-24 | 或 | **最後更新** | 2026-05-24 |
    new_content = re.sub(
        r"(\|\s*\*\*最後更新\s*(?:\(Last\s*Updated\))?\*\*\s*\|\s*)[^|\s]+(\s*\|)",
        rf"\g<1>{today_str}\g<2>",
        new_content,
    )

    return True, "", new_content


def process_file(file_path):
    """
    處理單個檔案的驗證、清理與日期更新
    """
    print(f"正在檢查文件: {file_path}")

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            original_content = f.read()

        # 步驟 A: 清除表情符號
        cleaned_content = clean_emojis(original_content)

        # 步驟 B: 驗證 YAML Header 並自動更新更新日期
        is_ok, err_msg, finalized_content = validate_and_update_header(
            file_path, cleaned_content
        )

        if not is_ok:
            # 使用 ASCII 訊息以避免 Windows cp950 編碼問題
            print(f"[ERROR] 檔案 {file_path} 未通過合規檢查:\n{err_msg}\n")
            return False

        # 步驟 C: 若檔案內容有變更，寫回並重新執行 git add
        if finalized_content != original_content:
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(finalized_content)

            # 將背景變更重新暫存
            subprocess.run(["git", "add", file_path], check=True)
            print(
                f"-> [FIXED] 已清除 Emoji 並更新最後更新日期為 {datetime.today().strftime('%Y-%m-%d')}"
            )
        else:
            print("-> [PASS] 文件結構合規，且內容無變更")

        return True

    except Exception as e:
        print(f"錯誤: 處理檔案 {file_path} 時發生未預期錯誤: {str(e)}")
        return False


def main():
    staged_files = get_staged_markdown_files()
    if not staged_files:
        # 沒有暫存的 markdown 檔案，直接放行
        sys.exit(0)

    success = True
    print("\n=== Linetra Markdown 自動標準化檢查 ===")
    for file_path in staged_files:
        # 排除 templates 或 guides 等本身是教學性質的範本檔案（可視需求擴充）
        if "template" in file_path.lower():
            continue
        if not process_file(file_path):
            success = False

    if not success:
        # 使用 ASCII 警告訊息，避免 Unicode 編碼錯誤
        print("\n[ERROR] 提交遭攔截！請修正上述錯誤後再重新 commit.")
        print("=========================================\n")
        sys.exit(1)

    print("=== 檢查通過，允許執行 Git 提交 ===\n")
    sys.exit(0)


if __name__ == "__main__":
    main()
