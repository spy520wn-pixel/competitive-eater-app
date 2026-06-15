# uni-app Android 离线打包指南

## 前置条件

- HBuilderX（用于编译 App 资源）
- Android Studio（用于最终打包 APK）
- JDK 11+（Android Studio 自带 JBR，无需单独安装）
- DCloud 开发者账号

## 第一步：申请应用

1. 登录 [DCloud 开发者中心](https://dev.dcloud.net.cn)
2. 进入 **"我的应用"** → **"创建应用"**
3. 选择 **"uni-app"** 类型，填写应用名称
4. 记录生成的 **AppID**（格式为 `__UNI__XXXXXXX`）

## 第二步：生成签名密钥

在项目根目录执行以下命令生成 keystore：

```bash
keytool -genkey -v -keystore "项目路径/debug.keystore" \
  -alias your-alias \
  -keyalg RSA -keysize 2048 -validity 36500 \
  -storepass 123456 -keypass 123456 \
  -dname "CN=Your App, OU=Dev, O=Dev, L=Beijing, ST=Beijing, C=CN"
```

提取签名指纹：

```bash
keytool -list -v -keystore "项目路径/debug.keystore" \
  -alias your-alias -storepass 123456
```

记录输出中的 **MD5**、**SHA1**、**SHA256**。

> **WARNING**: 离线打包 SDK 的 `build.gradle` 中默认配置了一个 `test.jks` 签名文件。如果你没有修改签名配置，APK 将使用 `test.jks` 签名，而不是你自己生成的 keystore。你需要提取 **`test.jks`** 的指纹，或者将 `build.gradle` 中的签名配置改为你自己的 keystore。

## 第三步：在 DCloud 开发者中心配置签名

1. 进入你的应用 → **应用配置** → **Android平台**
2. 填写以下信息：
   - **包名**：与 `build.gradle` 中的 `applicationId` 一致
   - **SHA1**：第二步提取的 SHA1 指纹
   - **MD5**：第二步提取的 MD5 指纹
   - **SHA256**：第二步提取的 SHA256 指纹
3. 点击 **保存**
4. 复制生成的 **AppKey**

> **WARNING**: SHA1/MD5/SHA256 必须与实际签名 APK 的 keystore 完全一致。如果不匹配，App 启动时会报错 **"未配置APPkey或者配置错误"**。这是最常见的失败原因。

## 第四步：下载离线打包 SDK

1. 访问 [DCloud SDK 下载页](https://nativesupport.dcloud.net.cn/AppDocs/download/android)
2. 下载与 HBuilderX 编译器版本一致的 SDK

> **WARNING**: SDK 版本必须与项目中 `@dcloudio` 依赖的版本匹配，否则可能出现兼容性问题。

## 第五步：编译 App 资源

在项目根目录执行：

```bash
npx uni build -p app
```

编译成功后，App 资源生成在 `dist/build/app` 目录。

> **WARNING**: 如果在 HBuilderX 中通过 **发行 → 原生App-本地打包** 报错 `node_modules缺少编译器模块`，请使用命令行 `npx uni build -p app` 代替。HBuilderX 内置的编译器可能存在兼容性问题。

> **WARNING**: 如果在 HBuilderX 中通过 **发行 → 原生App-云打包** 一直失败（弹窗一闪而过），可以查看日志文件定位原因。日志路径：`C:\Users\<用户名>\AppData\Roaming\HBuilder X\` 目录下的 `.log` 文件。

## 第六步：配置离线打包项目

### 6.1 复制项目到纯英文路径

> **WARNING**: 项目路径不能包含中文或其他非 ASCII 字符，否则 Gradle 构建会报错 `Your project path contains non-ASCII characters`。

```bash
# 示例：复制到 E 盘根目录
cp -r "原始路径/HBuilder-HelloUniApp" "E:/HBuilder-HelloUniApp"
```

### 6.2 复制 App 资源

将 `dist/build/app` 目录下的所有文件复制到：

```
HBuilder-HelloUniApp/app/src/main/assets/apps/__UNI__XXXXXXX/www/
```

> **WARNING**: 目录名必须是 `__UNI__XXXXXXX`（双下划线开头），不能是 `_UNI__XXXXXXX`（单下划线）。单下划线会导致 AppID 无法识别。

### 6.3 修改 dcloud_control.xml

编辑 `app/src/main/assets/data/dcloud_control.xml`：

```xml
<hbuilder>
<apps>
    <app appid="__UNI__XXXXXXX" appver=""/>
</apps>
</hbuilder>
```

> **WARNING**: `dcloud_control.xml` 中默认的 appid 是示例项目的 `__UNI__B`，必须修改为你自己的 AppID，否则 App 会找不到应用配置。

### 6.4 修改 AndroidManifest.xml 中的 AppKey

编辑 `app/src/main/AndroidManifest.xml`，找到 `dcloud_appkey`，替换为你的 AppKey：

```xml
<meta-data
    android:name="dcloud_appkey"
    android:value="你的AppKey" />
```

### 6.5 确认包名一致

确保 `app/build.gradle` 中的 `applicationId` 与 DCloud 开发者中心配置的包名一致：

```gradle
applicationId "com.android.HelloH5"
```

### 6.6 确认签名配置

检查 `app/build.gradle` 中的签名配置：

```gradle
signingConfigs {
    config {
        keyAlias 'key0'
        keyPassword '123456'
        storeFile file('test.jks')
        storePassword '123456'
        v1SigningEnabled true
        v2SigningEnabled true
    }
}
```

> **WARNING**: 如果使用默认的 `test.jks`，必须提取 `test.jks` 的签名指纹配置到 DCloud。如果想使用自己的 keystore，修改 `storeFile`、`keyAlias`、`keyPassword`、`storePassword` 为你的值。

## 第七步：打包 APK

### 方式一：命令行打包

在 Android Studio 的 Terminal 中执行（PowerShell 环境需要加 `.\` 前缀）：

```powershell
# 设置 Android Studio 自带的 JDK
$env:JAVA_HOME = "D:\anzhuosdk\jbr"  # 改为你的 Android Studio 安装路径

# 清理并打包
.\gradlew clean assembleDebug
```

> **WARNING**: 系统默认的 Java 8 无法打包，需要 Java 11+。使用 Android Studio 自带的 JBR（JetBrains Runtime）可以避免单独安装 JDK。

> **WARNING**: PowerShell 中执行 `gradlew` 需要使用 `.\gradlew`，直接输入 `gradlew` 会报错 `无法将"gradlew"项识别为 cmdlet、函数、脚本文件或可运行程序的名称`。

### 方式二：Android Studio 打包

1. 用 Android Studio 打开 `HBuilder-HelloUniApp` 项目
2. 等待 Gradle 同步完成
3. 点击 **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
4. 如果菜单中找不到，点击右侧 **Gradle** 面板 → **app** → **Tasks** → **build** → **assembleDebug**

## 第八步：获取 APK

打包成功后，APK 位于：

```
HBuilder-HelloUniApp/app/build/outputs/apk/debug/app-debug.apk
```

> **WARNING**: 这是 debug 版本，仅用于测试。正式发布需要使用 release 签名，并执行 `assembleRelease`。

## 常见问题汇总

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| `node_modules缺少编译器模块` | HBuilderX 编译器兼容性问题 | 使用命令行 `npx uni build -p app` |
| `项目路径包含非ASCII字符` | 路径中有中文 | 复制项目到纯英文路径 |
| `需要Java 11+` | 系统 Java 版本过低 | 使用 Android Studio 自带的 JBR |
| `gradlew 无法识别` | PowerShell 执行策略 | 使用 `.\gradlew` |
| `未配置APPkey或者配置错误` | 签名指纹不匹配 | 确保 DCloud 配置的 SHA1 与实际签名 APK 的 keystore 一致 |
| 云打包弹窗一闪而过 | 服务器验证失败 | 查看日志文件定位原因，或改用离线打包 |
| AppID 目录名错误 | 单下划线 `_UNI__` | 改为双下划线 `__UNI__` |
| `dcloud_control.xml` 中 AppID 错误 | 使用了默认值 `__UNI__B` | 修改为自己的 AppID |
