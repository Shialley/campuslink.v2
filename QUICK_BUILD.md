# 快速 APK 构建方案

## 当前状态
Gradle 正在下载依赖并配置项目（这是正常的，首次构建需要时间）

## 推荐方案

### 方案 1: 等待当前构建完成（推荐）
当前的 `gradlew assembleRelease` 命令正在运行中。
- 预计时间：5-15 分钟（首次构建）
- APK 位置：`android/app/build/outputs/apk/release/app-release.apk`

### 方案 2: 使用 EAS Build（云端构建，最简单）
如果你有 Expo 账号，可以使用云端构建：

1. 在 CMD 中运行（避免 PowerShell 限制）：
```cmd
cd d:\campuslink.v2
npx eas-cli login
npx eas-cli build --platform android --profile preview
```

2. 构建完成后，会提供下载链接

### 方案 3: 生成 AAB（用于 Google Play）
```cmd
cd d:\campuslink.v2\android
gradlew.bat bundleRelease
```
AAB 位置：`android/app/build/outputs/bundle/release/app-release.aab`

### 方案 4: 在 Android Studio 中构建
1. 安装 Android Studio
2. 打开项目：`d:\campuslink.v2\android`
3. Build > Build Bundle(s) / APK(s) > Build APK(s)

## 检查构建进度
在新的 CMD 窗口中运行：
```cmd
cd d:\campuslink.v2\android
dir app\build\outputs\apk\release
```

## 如果构建卡住
按 Ctrl+C 停止，然后重试：
```cmd
cd d:\campuslink.v2\android
gradlew.bat clean
gradlew.bat assembleRelease
```

## 构建完成后
1. 找到 APK: `android/app/build/outputs/apk/release/app-release.apk`
2. 传输到 Android 设备
3. 安装（需要允许未知来源）
