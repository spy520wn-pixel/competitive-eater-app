<template>
  <view class="page">
    <!-- Last Backup Info -->
    <view class="info-bar">
      <text class="info-label">上次备份</text>
      <text class="info-value">{{ lastBackupTime || '从未备份' }}</text>
    </view>

    <!-- Export Section -->
    <view class="card">
      <view class="btn btn--primary" @tap="handleExport">
        <text class="btn__icon">📤</text>
        <text class="btn__text">导出数据到文件</text>
      </view>
      <text class="card__desc">导出所有店铺、菜单、战绩数据</text>
      <text class="card__sub">保存为 JSON 文件到设备</text>
    </view>

    <!-- Import Section -->
    <view class="card">
      <view class="btn btn--accent" @tap="handleImport">
        <text class="btn__icon">📥</text>
        <text class="btn__text">从文件导入数据</text>
      </view>
      <text class="card__desc">选择之前导出的 JSON 文件恢复数据</text>
    </view>

    <!-- Warning -->
    <view class="warning-bar">
      <text class="warning-icon">⚠️</text>
      <text class="warning-text">导入将覆盖现有数据，请先导出备份</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { shopStore } from '@/store/shop-store.js'
import { recordStore } from '@/store/record-store.js'

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
  const data = JSON.stringify({ shops, records, exportedAt: new Date().toISOString() }, null, 2)

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
  // H5 / App fallback: copy to clipboard
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
  // H5 fallback
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
    saveLastBackupTime()
    uni.showToast({ title: '导入成功', icon: 'success' })
  } catch {
    uni.showToast({ title: '文件解析失败', icon: 'none' })
  }
}

onShow(() => {
  loadLastBackupTime()
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #0F0F1A;
  padding: 24rpx;
}

.info-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #1A1A2E;
  border-radius: 16rpx;
  padding: 28rpx 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.2);
}

.info-label {
  font-size: 28rpx;
  color: #8888AA;
}

.info-value {
  font-size: 28rpx;
  color: #FFFFFF;
  font-weight: 600;
}

.card {
  background: #1A1A2E;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.2);
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  padding: 28rpx 0;
  margin-bottom: 16rpx;
}

.btn--primary {
  background: linear-gradient(135deg, #FF6B35 0%, #FF8F60 100%);
}

.btn--accent {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
}

.btn__icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.btn__text {
  font-size: 30rpx;
  font-weight: 700;
  color: #FFFFFF;
}

.card__desc {
  display: block;
  font-size: 26rpx;
  color: #CCCCDD;
  margin-bottom: 4rpx;
}

.card__sub {
  display: block;
  font-size: 22rpx;
  color: #666688;
}

.warning-bar {
  display: flex;
  align-items: center;
  background: rgba(255, 107, 53, 0.1);
  border: 1rpx solid rgba(255, 107, 53, 0.3);
  border-radius: 12rpx;
  padding: 24rpx 28rpx;
  margin-top: 12rpx;
}

.warning-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
}

.warning-text {
  font-size: 24rpx;
  color: #FF6B35;
}
</style>
