<template>
  <view class="page">
    <!-- 通用 -->
    <view class="section">
      <text class="section__title">通用</text>
      <view class="section__body">
        <view class="setting-row">
          <text class="setting-label">默认城市</text>
          <picker :range="cities" @change="onCityChange" :value="cityIndex">
            <view class="picker-box">
              <text class="picker-value">{{ settings.defaultCity || '未设置' }}</text>
              <text class="picker-arrow">▼</text>
            </view>
          </picker>
        </view>
        <view class="setting-row">
          <text class="setting-label">地图默认范围</text>
          <picker :range="mapRanges" @change="onMapRangeChange" :value="mapRangeIndex">
            <view class="picker-box">
              <text class="picker-value">{{ settings.mapRange }}</text>
              <text class="picker-arrow">▼</text>
            </view>
          </picker>
        </view>
      </view>
    </view>

    <!-- 挑战 -->
    <view class="section">
      <text class="section__title">挑战</text>
      <view class="section__body">
        <view class="setting-row">
          <text class="setting-label">倒计时 &lt;5min 提醒</text>
          <switch :checked="settings.countdownWarning" color="#FF6B35" @change="onToggle('countdownWarning', $event)" />
        </view>
        <view class="setting-row">
          <text class="setting-label">长按输入精确数量</text>
          <switch :checked="settings.longPressInput" color="#FF6B35" @change="onToggle('longPressInput', $event)" />
        </view>
      </view>
    </view>

    <!-- AI 生图 -->
    <view class="section">
      <text class="section__title">AI 生图</text>
      <view class="section__body">
        <view class="setting-row setting-row--input">
          <text class="setting-label">AI 服务地址</text>
          <input
            class="setting-input"
            :value="settings.aiServiceUrl"
            placeholder="https://..."
            placeholder-class="input-placeholder"
            @blur="onInput('aiServiceUrl', $event)"
          />
        </view>
        <view class="setting-row setting-row--input">
          <text class="setting-label">AI API Key</text>
          <input
            class="setting-input"
            :value="settings.aiApiKey"
            :password="true"
            placeholder="sk-..."
            placeholder-class="input-placeholder"
            @blur="onInput('aiApiKey', $event)"
          />
        </view>
      </view>
    </view>

    <!-- 数据 -->
    <view class="section">
      <text class="section__title">数据</text>
      <view class="section__body">
        <view class="setting-row setting-row--nav" @tap="goToBackup">
          <text class="setting-label">数据备份</text>
          <text class="nav-arrow">›</text>
        </view>
        <view class="setting-row setting-row--nav" @tap="handleClear">
          <text class="setting-label setting-label--danger">清除所有数据</text>
          <text class="nav-arrow">›</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { settingsStore } from '@/store/settings-store.js'

const cities = ['北京', '上海', '广州', '深圳', '成都', '杭州', '武汉', '南京', '重庆', '西安']
const mapRanges = ['城市', '区域', '全国']

const settings = reactive({
  defaultCity: '',
  mapRange: '城市',
  countdownWarning: true,
  longPressInput: true,
  aiServiceUrl: '',
  aiApiKey: ''
})

const cityIndex = computed(() => {
  const idx = cities.indexOf(settings.defaultCity)
  return idx >= 0 ? idx : 0
})

const mapRangeIndex = computed(() => {
  const idx = mapRanges.indexOf(settings.mapRange)
  return idx >= 0 ? idx : 0
})

function loadSettings() {
  const s = settingsStore.get()
  Object.keys(settings).forEach(key => {
    if (s[key] !== undefined) {
      settings[key] = s[key]
    }
  })
}

function save(key, value) {
  settingsStore.update({ [key]: value })
}

function onCityChange(e) {
  const val = cities[e.detail.value]
  settings.defaultCity = val
  save('defaultCity', val)
}

function onMapRangeChange(e) {
  const val = mapRanges[e.detail.value]
  settings.mapRange = val
  save('mapRange', val)
}

function onToggle(key, e) {
  const val = e.detail.value
  settings[key] = val
  save(key, val)
}

function onInput(key, e) {
  const val = e.detail.value
  settings[key] = val
  save(key, val)
}

function goToBackup() {
  uni.navigateTo({ url: '/pages/mine/backup' })
}

function handleClear() {
  uni.showModal({
    title: '确认清除',
    content: '将删除所有店铺、战绩和设置数据，此操作不可恢复！',
    confirmText: '确认清除',
    confirmColor: '#FF4444',
    success(res) {
      if (res.confirm) {
        uni.clearStorageSync()
        loadSettings()
        uni.showToast({ title: '已清除', icon: 'success' })
      }
    }
  })
}

onShow(() => {
  loadSettings()
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #0F0F1A;
  padding: 24rpx;
}

.section {
  margin-bottom: 32rpx;
}

.section__title {
  display: block;
  font-size: 24rpx;
  font-weight: 600;
  color: #FF6B35;
  text-transform: uppercase;
  letter-spacing: 4rpx;
  padding: 0 8rpx;
  margin-bottom: 16rpx;
}

.section__body {
  background: #1A1A2E;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.2);
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid #2D2D44;
}

.setting-row:last-child {
  border-bottom: none;
}

.setting-row--nav {
  cursor: pointer;
}

.setting-row--nav:active {
  background: rgba(255, 255, 255, 0.03);
}

.setting-label {
  font-size: 28rpx;
  color: #CCCCDD;
  flex-shrink: 0;
  margin-right: 20rpx;
}

.setting-label--danger {
  color: #FF4444;
}

.picker-box {
  display: flex;
  align-items: center;
}

.picker-value {
  font-size: 28rpx;
  color: #FFFFFF;
  margin-right: 10rpx;
}

.picker-arrow {
  font-size: 20rpx;
  color: #555577;
}

.setting-row--input {
  flex-direction: column;
  align-items: flex-start;
}

.setting-input {
  width: 100%;
  background: #0F0F1A;
  border: 1rpx solid #2D2D44;
  border-radius: 10rpx;
  padding: 16rpx 20rpx;
  margin-top: 12rpx;
  font-size: 26rpx;
  color: #FFFFFF;
  box-sizing: border-box;
}

.input-placeholder {
  color: #555577;
}

.nav-arrow {
  font-size: 36rpx;
  color: #555577;
  font-weight: 300;
}
</style>
