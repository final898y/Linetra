# install_hooks.ps1
# Linetra 專案 Git Hook 一鍵安裝腳本
# (跨平台 + Python 檢查 + 檔案檢查 + 舊 Hook 合併 + 重複檢查 + 備份 + LF 換行相容 + 動態 Python)

param (
    [switch]$Force,
    [switch]$Merge
)

$gitDir     = Join-Path $PSScriptRoot "..\..\.git"
$hooksDir   = Join-Path $gitDir "hooks"
$hookFile   = Join-Path $hooksDir "pre-commit"
$backupFile = Join-Path $hooksDir "pre-commit.backup"
$helperFile = Join-Path $PSScriptRoot "pre_commit_markdown_helper.py"

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

# 檢查 Python 是否存在 (多重路徑檢測)
$pythonCmd = $null
$pythonVersion = $null
foreach ($cmd in "python", "python3", "py") {
    try {
        $ver = & $cmd --version 2>$null
        if ($ver) {
            $pythonCmd = $cmd
            $pythonVersion = $ver
            break
        }
    } catch {}
}

if (-not $pythonCmd) {
    Write-Host "錯誤: 系統未安裝 Python 或未加入 PATH！" -ForegroundColor Red
    Write-Host "請先安裝 Python 並確認 'python'、'python3' 或 'py' 指令可用。" -ForegroundColor Yellow
    return
} else {
    Write-Host "檢測到本機 Python ($pythonCmd): $pythonVersion" -ForegroundColor Green
}

# 檢查 pre_commit_markdown_helper.py 是否存在
if (-not (Test-Path $helperFile)) {
    Write-Host "錯誤: 找不到 pre_commit_markdown_helper.py！" -ForegroundColor Red
    Write-Host "請確認檔案存在於 tools/git-hooks/ 目錄中。" -ForegroundColor Yellow
    return
}

# 定義 Linetra 的 hook 內容 (動態檢測 Python 執行檔)
$linetraHook = @'
# Linetra Markdown Standardization and Emoji Cleanup
# Use the python found in PATH
PYTHON_CMD="python"

# Verify if python is available
if ! command -v "$PYTHON_CMD" >/dev/null 2>&1; then
    # Try python3 if python is not found
    if command -v python3 >/dev/null 2>&1; then
        PYTHON_CMD="python3"
    else
        echo "Error: Python not found in PATH. Cannot execute Linetra Markdown check!" >&2
        exit 1
    fi
fi

# Run the helper script using relative path from repo root
"$PYTHON_CMD" "tools/git-hooks/pre_commit_markdown_helper.py"
'@

# 用於將字串換行符統一轉為 Unix LF (\n) 並以 UTF-8 無 BOM 寫入的輔助函式
function Write-UnixFile {
    param (
        [string]$Path,
        [string]$Content
    )
    # 確保所有 \r\n 都轉成 \n
    $lfContent = $Content.Replace("`r`n", "`n")
    [System.IO.File]::WriteAllText($Path, $lfContent, (New-Object System.Text.UTF8Encoding $false))
}

# 如果已有 pre-commit hook，先備份再處理
if (Test-Path $hookFile) {
    $oldContent = Get-Content $hookFile -Raw

    # 備份舊 hook
    Copy-Item $hookFile $backupFile -Force
    Write-Host "已備份舊的 pre-commit hook 至 $backupFile" -ForegroundColor Cyan

    if ($oldContent -match "pre_commit_markdown_helper.py" -and -not $Force -and -not $Merge) {
        Write-Host "提示: 現有 pre-commit hook 已包含 Linetra 檢查，無需追加。" -ForegroundColor Cyan
    } else {
        $choice = $null
        if ($Force) {
            $choice = "O"
        } elseif ($Merge) {
            $choice = "A"
        } else {
            Write-Host "警告: 已存在 pre-commit hook！" -ForegroundColor Yellow
            $choice = Read-Host "輸入 A 以合併 (保留舊內容並追加 Linetra)，O 以覆蓋，N 以取消"
        }

        if ($choice) { $choice = $choice.ToUpper() }

        switch ($choice) {
            "A" {
                # 智慧解析與提取 Shebang，避免重複
                $shebang = "#!/bin/sh"
                $remainingContent = $oldContent
                if ($oldContent -match "^(#!.*\r?\n)") {
                    $shebang = $Matches[1].Trim()
                    $remainingContent = $oldContent -replace "^#!.*\r?\n", ""
                }
                
                $newContent = $shebang + "`n" + $remainingContent.Trim() + "`n`n" + $linetraHook + "`n"
                Write-UnixFile -Path $hookFile -Content $newContent
                Write-Host "成功: 已合併舊的 pre-commit hook 與 Linetra 檢查 (已確保為 LF 格式)。" -ForegroundColor Green
            }
            "O" {
                $newContent = "#!/bin/sh`n" + $linetraHook + "`n"
                Write-UnixFile -Path $hookFile -Content $newContent
                Write-Host "成功: 已覆蓋舊的 pre-commit hook (已確保為 LF 格式)。" -ForegroundColor Green
            }
            default {
                Write-Host "操作已取消，未修改現有 pre-commit hook。" -ForegroundColor Cyan
                return
            }
        }
    }
} else {
    # 沒有舊 hook，直接寫入
    $newContent = "#!/bin/sh`n" + $linetraHook + "`n"
    Write-UnixFile -Path $hookFile -Content $newContent
    Write-Host "成功: 已建立新的 pre-commit hook (已確保為 LF 格式)。" -ForegroundColor Green
}

# 平台提示
if ($IsWindows) {
    Write-Host "提示: 在 Windows 上，Git Bash 會自動用 sh 執行，不需額外 chmod。" -ForegroundColor Yellow
} else {
    Write-Host "提示: 請執行以下命令以確保可執行權限：" -ForegroundColor Yellow
    Write-Host "chmod +x $hookFile" -ForegroundColor Magenta
}

Write-Host "=================================" -ForegroundColor Cyan