# CampusLink v2 - APK 安装和使用指南

## 📦 APK 文件位置
构建完成后，APK 文件位于：
```
d:\campuslink.v2\android\app\build\outputs\apk\release\app-release.apk
```

## 📱 在 Android 设备上安装

### 方法 1: 通过 USB 传输
1. 使用 USB 数据线连接 Android 设备到电脑
2. 将 `app-release.apk` 复制到设备存储
3. 在设备上打开文件管理器
4. 找到并点击 APK 文件
5. 按照提示安装（可能需要允许"安装未知应用"）

### 方法 2: 通过邮件/云盘
1. 将 APK 上传到邮箱附件或云盘（如 Google Drive）
2. 在 Android 设备上下载 APK
3. 打开下载的文件进行安装

### 方法 3: 通过 ADB（适用于开发者）
```bash
# 确保设备已连接并启用 USB 调试
adb install d:\campuslink.v2\android\app\build\outputs\apk\release\app-release.apk
```

## ⚙️ 启用"安装未知应用"

### Android 8.0 及以上
1. 打开 **设置**
2. 进入 **应用和通知** > **特殊应用权限** > **安装未知应用**
3. 选择你用来安装 APK 的应用（如文件管理器）
4. 启用 **允许此来源**

### Android 8.0 以下
1. 打开 **设置**
2. 进入 **安全** 或 **安全与隐私**
3. 启用 **未知来源**

## 🔐 应用签名说明
当前生成的 APK 是 **调试版本（Debug Build）**：
- ✅ 可以直接安装使用
- ✅ 适合测试和开发
- ❌ 不能上传到 Google Play
- ❌ 使用调试签名（不安全）

### 生成发布版本（Production Build）
如需发布到应用商店，需要：

1. **创建签名密钥**
```cmd
keytool -genkey -v -keystore campuslink-release-key.keystore -alias campuslink -keyalg RSA -keysize 2048 -validity 10000
```

2. **配置 gradle.properties**
在 `android/gradle.properties` 添加：
```properties
CAMPUSLINK_RELEASE_STORE_FILE=campuslink-release-key.keystore
CAMPUSLINK_RELEASE_KEY_ALIAS=campuslink
CAMPUSLINK_RELEASE_STORE_PASSWORD=your_store_password
CAMPUSLINK_RELEASE_KEY_PASSWORD=your_key_password
```

3. **配置 app/build.gradle**
添加签名配置：
```gradle
signingConfigs {
    release {
        storeFile file(CAMPUSLINK_RELEASE_STORE_FILE)
        storePassword CAMPUSLINK_RELEASE_STORE_PASSWORD
        keyAlias CAMPUSLINK_RELEASE_KEY_ALIAS
        keyPassword CAMPUSLINK_RELEASE_KEY_PASSWORD
    }
}
```

4. **构建签名的 APK**
```cmd
cd android
gradlew.bat assembleRelease
```

## 📊 APK 信息
- **应用名称**: CampusLink
- **包名**: com.shialley.campuslinkv2
- **版本**: 1.0.0
- **最低 Android 版本**: 根据配置而定

## 🐛 常见问题

### Q: 安装时提示"应用未安装"
A: 可能原因：
- 设备存储空间不足
- 已安装相同包名但签名不同的应用（需先卸载旧版）
- APK 文件损坏（重新下载）

### Q: 应用安装后闪退
A: 检查：
- 设备 Android 版本是否满足要求
- 查看日志：`adb logcat | grep campuslink`

### Q: 如何卸载应用？
A: 
- 长按应用图标 > 卸载
- 或：设置 > 应用 > CampusLink > 卸载

## 📝 更新应用
如需发布新版本：
1. 修改 `app.json` 中的 `version` 和 `android.versionCode`
2. 重新构建 APK
3. 用户需要卸载旧版本后安装新版本（或使用相同签名覆盖安装）

## 🚀 发布到 Google Play
1. 注册 Google Play 开发者账号（一次性 $25）
2. 生成签名的 AAB（推荐）或 APK
```cmd
cd android
gradlew.bat bundleRelease
```
3. 在 Google Play Console 创建应用
4. 上传 AAB 文件（位于 `android/app/build/outputs/bundle/release/`）
5. 填写应用信息、截图等
6. 提交审核

## 📞 支持
如有问题，请联系开发者或查看项目 README。
