<template>
  <view class="page">
    <!-- Last Backup Info — Double-Bezel -->
    <view class="info-shell">
      <view class="info-core">
        <text class="info-label">上次备份</text>
        <text class="info-value">{{ lastBackupTime || '从未备份' }}</text>
      </view>
    </view>

    <!-- Export Section — Double-Bezel -->
    <view class="card-shell">
      <view class="card-core">
        <view class="btn btn--primary" @tap="handleExport">
          <text class="btn__icon">📤</text>
          <text class="btn__text">导出数据到文件</text>
        </view>
        <text class="card__desc">导出所有店铺、战绩、设置数据</text>
        <text class="card__sub">保存为 JSON 文件到设备</text>
      </view>
    </view>

    <!-- Import Section — Double-Bezel -->
    <view class="card-shell">
      <view class="card-core">
        <view class="btn btn--accent" @tap="handleImport">
          <text class="btn__icon">📥</text>
          <text class="btn__text">从文件导入数据</text>
        </view>
        <text class="card__desc">选择之前导出的 JSON 文件恢复数据</text>
      </view>
    </view>

    <!-- Warning -->
    <view class="warning-bar">
      <text class="warning-icon">⚠️</text>
      <text class="warning-text">导入将覆盖现有数据，请先导出备份</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { shopStore } from '@/store/shop-store.js'
import { recordStore } from '@/store/record-store.js'
import { settingsStore } from '@/store/settings-store.js'
import { applyPageTheme, syncThemeFromStorage } from '@/utils/apply-page-theme.js'

const LAST_BACKUP_KEY = 'eater_last_backup_time'
const lastBackupTime = ref('')

function loadLastBackupTime() {
  try {
    lastBackupTime.value = uni.getStorageSync(LAST_BACKUP_KEY) || ''
  } catch {
    lastBackupTime.value = ''
  }
}

function saveLastBackupTime() {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
  uni.setStorageSync(LAST_BACKUP_KEY, timeStr)
  lastBackupTime.value = timeStr
}

function handleExport() {
  const shops = shopStore.getAll()
  const records = recordStore.getAll()
  const settings = settingsStore.get()
  const hasSeenWelcome = uni.getStorageSync('hasSeenWelcome') || false
  const data = JSON.stringify({
    shops,
    records,
    settings,
    hasSeenWelcome,
    exportedAt: new Date().toISOString()
  }, null, 2)

  // #ifdef MP-WEIXIN
  const fs = uni.getFileSystemManager()
  const filePath = `${wx.env.USER_DATA_PATH}/eater_backup.json`
  fs.writeFile({
    filePath,
    data,
    encoding: 'utf8',
    success() {
      saveLastBackupTime()
      uni.shareFile({
        filePath,
        success() {
          uni.showToast({ title: '导出成功', icon: 'success' })
        },
        fail() {
          uni.showToast({ title: '导出成功', icon: 'success' })
        }
      })
    },
    fail(err) {
      uni.showToast({ title: '导出失败', icon: 'none' })
      console.error('Export failed:', err)
    }
  })
  // #endif

  // #ifndef MP-WEIXIN
  uni.setClipboardData({
    data,
    success() {
      saveLastBackupTime()
      uni.showToast({ title: '已复制到剪贴板', icon: 'success' })
    }
  })
  // #endif
}

function handleImport() {
  uni.showModal({
    title: '确认导入',
    content: '导入将覆盖当前所有数据，是否继续？',
    confirmColor: '#FF6B35',
    success(res) {
      if (!res.confirm) return
      doImport()
    }
  })
}

function doImport() {
  // #ifdef MP-WEIXIN
  wx.chooseMessageFile({
    count: 1,
    type: 'file',
    extension: ['json'],
    success(res) {
      const filePath = res.tempFiles[0].path
      const fs = uni.getFileSystemManager()
      fs.readFile({
        filePath,
        encoding: 'utf8',
        success(fileRes) {
          parseAndRestore(fileRes.data)
        },
        fail() {
          uni.showToast({ title: '读取文件失败', icon: 'none' })
        }
      })
    }
  })
  // #endif

  // #ifndef MP-WEIXIN
  uni.chooseFile({
    count: 1,
    type: 'file',
    extension: ['.json'],
    success(res) {
      const filePath = res.tempFiles[0].path
      // #ifdef H5
      const reader = new FileReader()
      reader.onload = (e) => parseAndRestore(e.target.result)
      reader.readAsText(res.tempFiles[0])
      // #endif
      // #ifdef APP-PLUS
      const fs = uni.getFileSystemManager()
      fs.readFile({
        filePath,
        encoding: 'utf8',
        success(fileRes) {
          parseAndRestore(fileRes.data)
        }
      })
      // #endif
    }
  })
  // #endif
}

function parseAndRestore(jsonString) {
  try {
    const data = JSON.parse(jsonString)
    if (!data.shops || !data.records) {
      uni.showToast({ title: '文件格式无效', icon: 'none' })
      return
    }
    uni.setStorageSync('eater_shops', data.shops)
    uni.setStorageSync('eater_records', data.records)
    if (data.settings) {
      uni.setStorageSync('eater_settings', data.settings)
    }
    if (data.hasSeenWelcome !== undefined) {
      uni.setStorageSync('hasSeenWelcome', data.hasSeenWelcome)
    }
    saveLastBackupTime()
    uni.showToast({ title: '导入成功', icon: 'success' })
  } catch {
    uni.showToast({ title: '文件解析失败', icon: 'none' })
  }
}

onMounted(() => {
  applyPageTheme(settingsStore.get().theme)
  uni.$on('theme-apply', applyPageTheme)
})

onUnmounted(() => {
  uni.$off('theme-apply', applyPageTheme)
})

onShow(() => {
  loadLastBackupTime()
  syncThemeFromStorage()
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--c-bg, $void-black);
  padding: $page-pad-y $page-pad-x;
}

/* ── Double-Bezel ── */
.info-shell,
.card-shell {
  background: var(--c-surface-3, $glass-white-3);
  border: 1rpx solid var(--c-surface-6, $glass-white-6);
  border-radius: $radius-2xl;
  padding: $bezel-offset;
  margin-bottom: $inter-group;
  animation: fadeInUp $dur-slow $ease-out-expo both;
}

.info-core,
.card-core {
  background: var(--c-surface-0, $surface-0);
  border-radius: calc(#{$radius-2xl} - #{$bezel-offset});
  padding: $card-pad-inner;
  border: 1rpx solid var(--c-border-subtle, $hairline-subtle);
  box-shadow: var(--c-shadow-inner, $shadow-inner);
}

.info-core {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.info-label {
  font-size: 28rpx;
  color: var(--c-text-tertiary, $text-tertiary);
}

.info-value {
  font-size: 28rpx;
  color: var(--c-text-primary, $text-primary);
  font-weight: 600;
}

/* ── Buttons ── */
.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-xl;
  padding: $card-pad-inner 0;
  margin-bottom: $intra-group;
  transition: transform $dur-normal $ease-spring, box-shadow $dur-normal $ease-spring;
}

.btn:active {
  transform: scale(0.96);
}

.btn--primary {
  background: linear-gradient(135deg, var(--c-accent, $accent-orange) 0%, var(--c-accent-light, $accent-orange-light) 100%);
  box-shadow: $shadow-glow-orange-strong;
}

.btn--accent {
  background: linear-gradient(135deg, var(--c-gold, $accent-gold) 0%, #{$accent-gold-warm} 100%);
  box-shadow: $shadow-glow-gold-strong;
}

.btn__icon {
  font-size: 32rpx;
  margin-right: $intra-tight;
}

.btn__text {
  font-size: 30rpx;
  font-weight: 700;
  color: var(--c-text-on-accent, #FFFFFF);
}

.card__desc {
  display: block;
  font-size: 26rpx;
  color: var(--c-text-secondary, $text-secondary);
  margin-bottom: 4rpx;
}

.card__sub {
  display: block;
  font-size: 22rpx;
  color: var(--c-text-muted, $text-muted);
}

/* ── Warning ── */
.warning-bar {
  display: flex;
  align-items: center;
  background: var(--c-accent-soft, $glow-orange-soft);
  border: 1rpx solid rgba(255, 107, 53, 0.12);
  border-radius: $radius-xl;
  padding: $intra-group $page-pad-x;
  margin-top: $intra-tight;
}

.warning-icon {
  font-size: 28rpx;
  margin-right: $intra-group;
}

.warning-text {
  font-size: 24rpx;
  color: var(--c-accent, $accent-orange);
}

</style>
