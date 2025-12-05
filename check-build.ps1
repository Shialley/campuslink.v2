# CampusLink v2 - 构建状态检查脚本

Write-Host "================================" -ForegroundColor Cyan
Write-Host "CampusLink v2 - Build Status" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$apkPath = "d:\campuslink.v2\android\app\build\outputs\apk\release\app-release.apk"

if (Test-Path $apkPath) {
    Write-Host "[SUCCESS] APK 已生成!" -ForegroundColor Green
    Write-Host ""
    Write-Host "APK 位置:" -ForegroundColor Yellow
    Write-Host $apkPath
    Write-Host ""
    
    $fileInfo = Get-Item $apkPath
    Write-Host "文件大小: $([math]::Round($fileInfo.Length / 1MB, 2)) MB" -ForegroundColor Cyan
    Write-Host "创建时间: $($fileInfo.CreationTime)" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "下一步操作:" -ForegroundColor Yellow
    Write-Host "1. 将 APK 传输到 Android 设备"
    Write-Host "2. 在设备上启用'允许安装未知应用'"
    Write-Host "3. 打开 APK 文件进行安装"
    Write-Host ""
    
    $openFolder = Read-Host "是否打开 APK 所在文件夹? (Y/N)"
    if ($openFolder -eq "Y" -or $openFolder -eq "y") {
        explorer.exe (Split-Path $apkPath -Parent)
    }
} else {
    Write-Host "[INFO] APK 尚未生成" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "可能的原因:" -ForegroundColor Cyan
    Write-Host "1. 构建仍在进行中（首次构建需要 5-15 分钟）"
    Write-Host "2. 构建过程中出现错误"
    Write-Host ""
    Write-Host "请检查构建终端的输出信息"
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
