# install_hooks.ps1
# Linetra 專案 Git Hook 一鍵安裝腳本

$gitDir = Join-Path $PSScriptRoot "..\..\.git"
$hooksDir = Join-Path $gitDir "hooks"
$hookFile = Join-Path $hooksDir "pre-commit"

Write-Host "=== Linetra Git Hook 安裝程式 ===" -ForegroundColor Cyan

# 檢查是否為 Git 儲存庫
if (-not (Test-Path $gitDir)) {
    Write-Host "錯誤: 找不到 .git 目錄，請確保此腳本位於 Linetra 專案的 tools\git-hooks\ 目錄中！" -ForegroundColor Red
    return
}

# 確保 hooks 目錄存在
if (-not (Test-Path $hooksDir)) {
    New-Item -ItemType Directory -Path $hooksDir -Force | Out-Null
}

# 定義要寫入的 pre-commit 內容
# 在 Windows 環境上，Git 的內建 Bash 依然會使用 sh 執行此 hook
$hookContent = @"
#!/bin/sh
# 由 Linetra 自動化安裝的 Markdown 標準化與 Emoji 清理鉤子
python "D:/MVS/Linetra/tools/git-hooks/pre_commit_markdown_helper.py"
"@

# 寫入 Hook 檔案 (使用 UTF-8 無 BOM 格式以符合 Unix/Git 規格)
[System.IO.File]::WriteAllText($hookFile, $hookContent)

Write-Host "成功: 已將 pre-commit 鉤子掛載至 $hookFile" -ForegroundColor Green
Write-Host "提示: 未來在執行 'git commit' 時，系統將自動清理 Emoji 並驗證文檔格式！" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Cyan
