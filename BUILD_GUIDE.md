# CampusLink v2 - Android APK 构建指南

## 当前构建状态
正在构建 Android APK...

## APK 文件位置
构建完成后，APK 文件将位于：
```
d:\campuslink.v2\android\app\build\outputs\apk\release\app-release.apk
```

## 构建步骤（已完成）
1. ✅ 配置 app.json
2. ✅ 创建 eas.json
3. ✅ 安装 expo-dev-client
4. ✅ 运行 expo prebuild
5. ⏳ 正在构建 APK (gradlew assembleRelease)

## 如果构建失败，手动构建步骤：

### 方法 1: 使用 Gradle（推荐）
```cmd
cd d:\campuslink.v2\android
gradlew.bat assembleRelease
```

### 方法 2: 使用 EAS Build（需要 Expo 账号）
```cmd
cd d:\campuslink.v2
npx eas-cli build --platform android --profile preview
```

### 方法 3: 使用 Android Studio
1. 打开 Android Studio
2. 打开项目: d:\campuslink.v2\android
3. 选择 Build > Build Bundle(s) / APK(s) > Build APK(s)

## 安装 APK
构建完成后，将 APK 文件传输到 Android 设备并安装：
1. 在设备上启用"未知来源"安装
2. 打开 APK 文件
3. 按照提示安装

## 注意事项
- 这是一个调试版本的 APK
- 如需发布到 Google Play，需要生成签名的 APK
- 首次构建可能需要 5-15 分钟
