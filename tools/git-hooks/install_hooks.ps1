# install_hooks.ps1
# Linetra 專案 Git Hook 一鍵安裝腳本

param (
    [switch]$Force,
    [switch]$Merge
)

$gitDir     = Join-Path $PSScriptRoot "..\..\.git"
$hooksDir   = Join-Path $gitDir "hooks"

Write-Host "=== Linetra Git Hook 安裝程式 ===" -ForegroundColor Cyan

if (-not (Test-Path $gitDir)) {
    Write-Host "錯誤: 找不到 .git 目錄！" -ForegroundColor Red
    return
}

if (-not (Test-Path $hooksDir)) {
    New-Item -ItemType Directory -Path $hooksDir -Force | Out-Null
}

$pythonCmd = $null
foreach ($cmd in "python", "python3", "py") {
    try {
        if (& $cmd --version 2>$null) {
            $pythonCmd = $cmd
            break
        }
    } catch {}
}

if (-not $pythonCmd) {
    Write-Host "錯誤: 找不到 Python！" -ForegroundColor Red
    return
}

function Write-UnixFile {
    param ([string]$Path, [string]$Content)
    $lfContent = $Content.Replace("`r`n", "`n")
    [System.IO.File]::WriteAllText($Path, $lfContent, (New-Object System.Text.UTF8Encoding $false))
}

function Install-GitHook {
    param ([string]$HookName, [string]$HelperFileName, [string]$HookLogic)
    $hookFile   = Join-Path $hooksDir $HookName
    $backupFile = Join-Path $hooksDir "$HookName.backup"
    $helperPath = Join-Path $PSScriptRoot $HelperFileName
    if (-not (Test-Path $helperPath)) { return }

    Write-Host "正在處理 $HookName..." -ForegroundColor Cyan
    if (Test-Path $hookFile) {
        Copy-Item $hookFile $backupFile -Force
        $oldContent = Get-Content $hookFile -Raw
        if ($oldContent -match $HelperFileName -and -not $Force -and -not $Merge) {
            Write-Host "已跳過 $HookName (已存在)" -ForegroundColor Gray
            return
        }
        $choice = "O"; if (-not $Force -and -not $Merge) { $choice = Read-Host "A:合併, O:覆蓋, N:跳過" }
        if ($Merge) { $choice = "A" }
        switch ($choice.ToUpper()) {
            "A" {
                $shebang = "#!/bin/sh"; $rem = $oldContent
                if ($oldContent -match "^(#!.*\n)") { $shebang = $Matches[1].Trim(); $rem = $oldContent -replace "^#!.*\n", "" }
                Write-UnixFile -Path $hookFile -Content ($shebang + "`n" + $rem.Trim() + "`n`n" + $HookLogic + "`n")
            }
            "O" { Write-UnixFile -Path $hookFile -Content ("#!/bin/sh`n" + $HookLogic + "`n") }
        }
    } else {
        Write-UnixFile -Path $hookFile -Content ("#!/bin/sh`n" + $HookLogic + "`n")
    }
}

$preCommitLogic = @"
# Linetra Commit Logging & Markdown Standardization
PYTHON_CMD="python"
if ! command -v "`$PYTHON_CMD" >/dev/null 2>&1; then
    if command -v python3 >/dev/null 2>&1; then PYTHON_CMD="python3"; else
        echo "Error: Python not found!" >&2; exit 1
    fi
fi
"`$PYTHON_CMD" "tools/git-hooks/pre_commit_log_helper.py"
"`$PYTHON_CMD" "tools/git-hooks/pre_commit_markdown_helper.py"
"@

$commitMsgLogic = @"
# Linetra Commit Message Validation
PYTHON_CMD="python"
if ! command -v "`$PYTHON_CMD" >/dev/null 2>&1; then
    if command -v python3 >/dev/null 2>&1; then PYTHON_CMD="python3"; else
        echo "Error: Python not found!" >&2; exit 1
    fi
fi
"`$PYTHON_CMD" "tools/git-hooks/commit_msg_helper.py" "`$1"
"@

Install-GitHook -HookName "pre-commit" -HelperFileName "pre_commit_markdown_helper.py" -HookLogic $preCommitLogic
Install-GitHook -HookName "commit-msg" -HelperFileName "commit_msg_helper.py" -HookLogic $commitMsgLogic

# 移除舊有的 post-commit hook 避免重複記錄日誌
$postCommitFile = Join-Path $hooksDir "post-commit"
$postCommitBackupFile = Join-Path $hooksDir "post-commit.backup"
if (Test-Path $postCommitFile) {
    Remove-Item $postCommitFile -Force | Out-Null
    Write-Host "已移除舊的 post-commit hook" -ForegroundColor Yellow
}
if (Test-Path $postCommitBackupFile) {
    Remove-Item $postCommitBackupFile -Force | Out-Null
}

Write-Host "安裝完成" -ForegroundColor Green
