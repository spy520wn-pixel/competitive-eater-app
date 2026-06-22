<template>
  <view class="page" :data-theme="settings.theme">
    <nav-bar title="设置" :show-back="true" />
    <!-- 通用 -->
    <view class="section">
      <view class="section-header">
        <view class="eyebrow">
          <text class="eyebrow-text">通用</text>
        </view>
      </view>
      <view class="section-shell">
        <view class="section-core">
          <view class="setting-row">
            <text class="setting-label">默认城市</text>
            <picker :range="cities" @change="onCityChange" :value="cityIndex" aria-label="选择默认城市">
              <view class="picker-box">
                <text class="picker-value">{{ settings.defaultCity || '未设置' }}</text>
                <text class="picker-arrow">▾</text>
              </view>
            </picker>
          </view>
          <view class="setting-row">
            <text class="setting-label">地图默认范围</text>
            <picker :range="mapRanges" @change="onMapRangeChange" :value="mapRangeIndex" aria-label="选择地图范围">
              <view class="picker-box">
                <text class="picker-value">{{ settings.mapRange }}</text>
                <text class="picker-arrow">▾</text>
              </view>
            </picker>
          </view>
        </view>
      </view>
    </view>

    <!-- 主题 -->
    <view class="section">
      <view class="section-header">
        <view class="eyebrow">
          <text class="eyebrow-text">主题</text>
        </view>
      </view>
      <view class="section-shell">
        <view class="section-core">
          <view class="theme-options">
            <view class="theme-option" :class="{ 'theme-option--active': settings.theme === 'dark' }" role="button" aria-label="切换到深色主题" @tap="onThemeChange('dark')">
              <view class="theme-preview theme-preview--dark">
                <view class="theme-preview__card" />
              </view>
              <text class="theme-option__label">深色</text>
            </view>
            <view class="theme-option" :class="{ 'theme-option--active': settings.theme === 'light' }" role="button" aria-label="切换到浅色主题" @tap="onThemeChange('light')">
              <view class="theme-preview theme-preview--light">
                <view class="theme-preview__card" />
              </view>
              <text class="theme-option__label">浅色</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 挑战 -->
    <view class="section">
      <view class="section-header">
        <view class="eyebrow">
          <text class="eyebrow-text">挑战</text>
        </view>
      </view>
      <view class="section-shell">
        <view class="section-core">
          <view class="setting-row">
            <text class="setting-label">倒计时提醒</text>
            <switch :checked="settings.countdownWarning" color="#FF6B35" aria-label="倒计时提醒" @change="onToggle('countdownWarning', $event)" />
          </view>
          <view class="setting-row" v-if="settings.countdownWarning">
            <text class="setting-label">提前提醒时间</text>
            <picker :range="countdownOptions" @change="onCountdownChange" :value="countdownIndex" aria-label="选择提前提醒时间">
              <view class="picker-box">
                <text class="picker-value">{{ settings.countdownWarningMinutes }} 分钟</text>
                <text class="picker-arrow">▾</text>
              </view>
            </picker>
          </view>
          <view class="setting-row">
            <text class="setting-label">长按输入精确数量</text>
            <switch :checked="settings.longPressInput" color="#FF6B35" aria-label="长按输入精确数量" @change="onToggle('longPressInput', $event)" />
          </view>
        </view>
      </view>
    </view>

    <!-- AI 模型配置 (高级设置) -->
    <view class="section">
      <view class="section-header section-header--collapsible" role="button" :aria-label="(showAI ? '收起' : '展开') + 'AI 设置'" @tap="showAI = !showAI">
        <view class="header-left">
          <view class="eyebrow">
            <text class="eyebrow-text">AI 模型</text>
          </view>
          <text class="section-subtitle">高级设置</text>
        </view>
        <text class="collapse-icon">{{ showAI ? '▾' : '▸' }}</text>
      </view>
      <view v-show="showAI" class="section-shell">
        <view class="section-core">
          <!-- 识图大模型 -->
          <view class="ai-group">
            <text class="ai-group-title">识图大模型</text>
            <view class="setting-row setting-row--input">
              <text class="setting-label">服务地址</text>
              <view class="setting-input-wrap" :class="{ 'setting-input-wrap--error': errors.ocrServiceUrl }">
                <input class="setting-input" :value="settings.ocrServiceUrl" placeholder="https://..." placeholder-class="input-placeholder" aria-label="识图服务地址" @input="onInput('ocrServiceUrl', $event)" @blur="onInputBlur('ocrServiceUrl', $event)" />
              </view>
              <text v-if="errors.ocrServiceUrl" class="setting-error">{{ errors.ocrServiceUrl }}</text>
            </view>
            <view class="setting-row setting-row--input">
              <text class="setting-label">API Key</text>
              <view class="setting-input-wrap">
                <input class="setting-input" :value="settings.ocrApiKey" :password="true" placeholder="sk-..." placeholder-class="input-placeholder" aria-label="识图 API Key" @blur="onInput('ocrApiKey', $event)" />
              </view>
            </view>
            <view class="setting-row setting-row--input">
              <text class="setting-label">模型 ID</text>
              <view class="setting-input-wrap">
                <input class="setting-input" :value="settings.ocrModel" placeholder="model-name" placeholder-class="input-placeholder" aria-label="识图模型 ID" @blur="onInput('ocrModel', $event)" />
              </view>
            </view>
          </view>

          <!-- 生图大模型 -->
          <view class="ai-group">
            <text class="ai-group-title">生图大模型</text>
            <view class="setting-row setting-row--input">
              <text class="setting-label">服务地址</text>
              <view class="setting-input-wrap" :class="{ 'setting-input-wrap--error': errors.aiServiceUrl }">
                <input class="setting-input" :value="settings.aiServiceUrl" placeholder="https://..." placeholder-class="input-placeholder" aria-label="生图服务地址" @input="onInput('aiServiceUrl', $event)" @blur="onInputBlur('aiServiceUrl', $event)" />
              </view>
              <text v-if="errors.aiServiceUrl" class="setting-error">{{ errors.aiServiceUrl }}</text>
            </view>
            <view class="setting-row setting-row--input">
              <text class="setting-label">API Key</text>
              <view class="setting-input-wrap">
                <input class="setting-input" :value="settings.aiApiKey" :password="true" placeholder="sk-..." placeholder-class="input-placeholder" aria-label="生图 API Key" @blur="onInput('aiApiKey', $event)" />
              </view>
            </view>
            <view class="setting-row setting-row--input">
              <text class="setting-label">模型 ID</text>
              <view class="setting-input-wrap">
                <input class="setting-input" :value="settings.aiModel" placeholder="model-name" placeholder-class="input-placeholder" aria-label="生图模型 ID" @blur="onInput('aiModel', $event)" />
              </view>
            </view>
          </view>

          <!-- 视频大模型 -->
          <view class="ai-group">
            <text class="ai-group-title">视频大模型</text>
            <view class="setting-row setting-row--input">
              <text class="setting-label">服务地址</text>
              <view class="setting-input-wrap" :class="{ 'setting-input-wrap--error': errors.videoServiceUrl }">
                <input class="setting-input" :value="settings.videoServiceUrl" placeholder="https://..." placeholder-class="input-placeholder" aria-label="视频服务地址" @input="onInput('videoServiceUrl', $event)" @blur="onInputBlur('videoServiceUrl', $event)" />
              </view>
              <text v-if="errors.videoServiceUrl" class="setting-error">{{ errors.videoServiceUrl }}</text>
            </view>
            <view class="setting-row setting-row--input">
              <text class="setting-label">API Key</text>
              <view class="setting-input-wrap">
                <input class="setting-input" :value="settings.videoApiKey" :password="true" placeholder="sk-..." placeholder-class="input-placeholder" aria-label="视频 API Key" @blur="onInput('videoApiKey', $event)" />
              </view>
            </view>
            <view class="setting-row setting-row--input">
              <text class="setting-label">模型 ID</text>
              <view class="setting-input-wrap">
                <input class="setting-input" :value="settings.videoModel" placeholder="model-name" placeholder-class="input-placeholder" aria-label="视频模型 ID" @blur="onInput('videoModel', $event)" />
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 第三方服务 -->
    <view class="section">
      <view class="section-header">
        <view class="eyebrow">
          <text class="eyebrow-text">第三方服务</text>
        </view>
      </view>
      <view class="section-shell">
        <view class="section-core">
          <view class="setting-row setting-row--input">
            <text class="setting-label">高德地图 API Key</text>
            <view class="setting-input-wrap">
              <input class="setting-input" :value="settings.amapKey" :password="true" placeholder="高德地图 Key" placeholder-class="input-placeholder" aria-label="高德地图 API Key" @blur="onInput('amapKey', $event)" />
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 数据 -->
    <view class="section">
      <view class="section-header">
        <view class="eyebrow">
          <text class="eyebrow-text">数据</text>
        </view>
      </view>
      <view class="section-shell">
        <view class="section-core">
          <view class="setting-row setting-row--nav" role="button" aria-label="数据备份" @tap="goToBackup">
            <text class="setting-label">数据备份</text>
            <view class="arrow-wrap">
              <text class="nav-arrow">›</text>
            </view>
          </view>
          <view class="setting-row setting-row--nav" role="button" aria-label="清除所有数据" @tap="handleClear">
            <text class="setting-label setting-label--danger">清除所有数据</text>
            <view class="arrow-wrap">
              <text class="nav-arrow">›</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { settingsStore, currentTheme, getDangerColor } from '@/store/settings-store.js'
import { applyPageTheme, syncThemeFromStorage, applyNavBarColor } from '@/utils/apply-page-theme.js'
import NavBar from '@/components/nav-bar.vue'

import { CITIES } from '@/constants/cities.js'

const cities = CITIES
const mapRanges = ['城市', '区域', '全国']

const countdownOptions = ['5', '10', '20', '30']
const showAI = ref(false)

const settings = reactive({
  defaultCity: '',
  mapRange: '城市',
  countdownWarning: true,
  countdownWarningMinutes: 5,
  longPressInput: true,
  // 识图
  ocrServiceUrl: '',
  ocrApiKey: '',
  ocrModel: '',
  // 生图
  aiServiceUrl: '',
  aiApiKey: '',
  aiModel: '',
  // 视频
  videoServiceUrl: '',
  videoApiKey: '',
  videoModel: '',
  // 高德
  amapKey: '',
  theme: 'dark'
})

const errors = reactive({
  ocrServiceUrl: '',
  aiServiceUrl: '',
  videoServiceUrl: ''
})

const cityIndex = computed(() => {
  const idx = cities.indexOf(settings.defaultCity)
  return idx >= 0 ? idx : 0
})

const mapRangeIndex = computed(() => {
  const idx = mapRanges.indexOf(settings.mapRange)
  return idx >= 0 ? idx : 0
})

const countdownIndex = computed(() => {
  const idx = countdownOptions.indexOf(String(settings.countdownWarningMinutes))
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

function onCountdownChange(e) {
  const val = Number(countdownOptions[e.detail.value])
  settings.countdownWarningMinutes = val
  save('countdownWarningMinutes', val)
}

function onToggle(key, e) {
  const val = e.detail.value
  settings[key] = val
  save(key, val)
}

function validateUrl(val) {
  if (!val) return ''
  try {
    const url = new URL(val)
    if (!['http:', 'https:'].includes(url.protocol)) return '请输入 http 或 https 开头的地址'
    return ''
  } catch {
    return '请输入有效的 URL 格式'
  }
}


function onInput(key, e) {
  const val = e.detail.value
  errors[key] = ''
  settings[key] = val
  save(key, val)
}

function onInputBlur(key, e) {
  const val = e.detail.value
  if (key === 'ocrServiceUrl') {
    errors.ocrServiceUrl = validateUrl(val)
  } else if (key === 'aiServiceUrl') {
    errors.aiServiceUrl = validateUrl(val)
  } else if (key === 'videoServiceUrl') {
    errors.videoServiceUrl = validateUrl(val)
  }
}

function onThemeChange(theme) {
  settings.theme = theme
  save('theme', theme)

  // 1. 顶部导航栏 + 底部 tabbar（原生 API，同步）
  applyNavBarColor(theme)

  // 2. 页面主题注入（evalJS，异步，覆盖所有 webview）
  applyPageTheme(theme)

  // 3. 事件通知
  uni.$emit('theme-apply', theme)
  uni.$emit('tabbar-theme-change', theme)
}

function goToBackup() {
  uni.navigateTo({ url: '/pages/mine/backup' })
}

function handleClear() {
  uni.showModal({
    title: '确认清除',
    content: '将删除所有店铺、战绩和设置数据，此操作不可恢复！',
    confirmText: '确认清除',
    confirmColor: getDangerColor(),
    success(res) {
      if (res.confirm) {
        uni.clearStorageSync()
        loadSettings()
        uni.showToast({ title: '已清除', icon: 'success' })
      }
    }
  })
}

onMounted(() => {
  applyPageTheme(settingsStore.get().theme)
  uni.$on('theme-apply', applyPageTheme)
})

onUnmounted(() => {
  uni.$off('theme-apply', applyPageTheme)
})

onShow(() => {
  loadSettings()
  syncThemeFromStorage()
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--c-bg, $void-black);
  padding: $page-pad-y $page-pad-x;
  display: flex;
  flex-direction: column;
  gap: 48rpx;
}

/* ── Section ── */
.section {
  display: flex;
  flex-direction: column;
  gap: $intra-group;
}

.section-header {
  margin-bottom: $intra-group;
}

.section-header--collapsible {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: $intra-group 0;
  margin-bottom: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: $intra-group;
}

.section-subtitle {
  font-size: 22rpx;
  color: var(--c-text-muted, $text-muted);
}

.collapse-icon {
  font-size: 24rpx;
  color: var(--c-text-muted, $text-muted);
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  background: var(--c-accent-soft, $glow-orange-soft);
  border-radius: $radius-pill;
  padding: 8rpx 22rpx;
}

.eyebrow-text {
  font-size: 20rpx;
  color: var(--c-accent, $accent-orange);
  font-weight: 500;
  letter-spacing: $tracking-ultra-wide;
  text-transform: uppercase;
}

/* ── Section Card (flat, clean) ── */
.section-shell {
  background: var(--c-surface-1, $surface-1);
  border: 1rpx solid var(--c-border-subtle, $hairline-subtle);
  border-radius: $radius-2xl;
  box-shadow: 0 1rpx 4rpx var(--c-shadow-sm);
  overflow: hidden;
  animation: fadeInUp $dur-slow $ease-out-expo both;
}

.section-core {
  overflow: hidden;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $card-pad-inner;
  border-bottom: 1rpx solid var(--c-border-subtle, $hairline-subtle);
  overflow: hidden;
}

.setting-row:last-child {
  border-bottom: none;
}

.setting-row--nav {
  transition: background $dur-fast $ease-spring, transform $dur-fast $ease-spring;
}

.setting-row--nav:active {
  background: var(--c-surface-3, $glass-white-3);
  transform: scale(0.99);
}

.setting-label {
  font-size: 28rpx;
  color: var(--c-text-secondary, $text-secondary);
  flex-shrink: 0;
  margin-right: $intra-group;
  letter-spacing: $tracking-normal;
}

.setting-label--danger {
  color: var(--c-danger, $accent-danger-light);
}

/* ── AI Group ── */
.ai-group {
  &:not(:last-child) {
    border-bottom: 1rpx solid var(--c-border-subtle, $hairline-subtle);
  }
}

.ai-group-title {
  font-size: $type-label-size;
  font-weight: $type-label-weight;
  color: var(--c-accent, $accent-orange);
  letter-spacing: $tracking-wide;
  padding: 20rpx 28rpx 0;
  display: block;
}

.picker-box {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.picker-value {
  font-size: 28rpx;
  color: var(--c-text-primary, $text-primary);
}

.picker-arrow {
  font-size: 20rpx;
  color: var(--c-text-muted, $text-muted);
}

.setting-row--input {
  flex-direction: column;
  align-items: flex-start;
}

.setting-input-wrap {
  width: 100%;
  background: var(--c-surface-3, $glass-white-3);
  border: 1rpx solid var(--c-hairline, $hairline);
  border-radius: $radius-md;
  padding: 20rpx 26rpx;
  margin-top: 16rpx;
  box-sizing: border-box;
  min-height: 84rpx;
  display: flex;
  align-items: center;
  transition: border-color $dur-fast $ease-spring;
}

.setting-input-wrap:focus-within {
  border-color: var(--c-border-active, $hairline-active);
}

.setting-input-wrap--error {
  border-color: var(--c-danger, $accent-danger) !important;
}

.setting-error {
  font-size: 22rpx;
  color: var(--c-danger, $accent-danger-light);
  margin-top: 8rpx;
  letter-spacing: $tracking-normal;
}

.setting-input {
  width: 100%;
  height: 100%;
  font-size: 26rpx;
  color: var(--c-text-primary, $text-primary);
  background: transparent;
  border: none;
  padding: 0;
}

.input-placeholder {
  color: var(--c-text-muted, $text-muted);
}

.arrow-wrap {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  background: var(--c-surface-3, $glass-white-3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background $dur-fast $ease-spring, transform $dur-fast $ease-spring;
}

.nav-arrow {
  font-size: 28rpx;
  color: var(--c-text-muted, $text-muted);
  font-weight: 300;
}

/* ── Theme Picker ── */
.theme-options {
  display: flex;
  gap: 24rpx;
  padding: 8rpx $card-pad-inner;
}

.theme-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx;
  border-radius: $radius-xl;
  border: 2rpx solid transparent;
  transition: border-color $dur-normal $ease-spring, transform $dur-fast $ease-spring;
}

.theme-option:active {
  transform: scale(0.97);
}

.theme-option--active {
  border-color: var(--c-accent, $accent-orange);
}

.theme-preview {
  width: 100%;
  height: 128rpx;
  border-radius: $radius-lg;
  padding: 18rpx;
  position: relative;
  overflow: hidden;
  box-shadow: var(--c-shadow-md, $shadow-md);
}

.theme-preview--dark {
  background: #06060B;
  border: 1rpx solid var(--c-surface-8, $glass-white-8);
}

.theme-preview--light {
  background: #F4F1EC;
  border: 1rpx solid rgba(0, 0, 0, 0.05);
}

.theme-preview__card {
  width: 70%;
  height: 60%;
  border-radius: 8rpx;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.theme-preview--dark .theme-preview__card {
  background: linear-gradient(165deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.03) 100%);
  border: 1rpx solid rgba(255, 255, 255, 0.13);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.6);
}

.theme-preview--light .theme-preview__card {
  background: linear-gradient(165deg, #FFFFFF 0%, #FAF8F5 100%);
  border: 1rpx solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.theme-option__label {
  font-size: 24rpx;
  color: var(--c-text-secondary, $text-secondary);
  font-weight: 500;
}

.theme-option--active .theme-option__label {
  color: var(--c-accent, $accent-orange);
  font-weight: 600;
}

</style>
