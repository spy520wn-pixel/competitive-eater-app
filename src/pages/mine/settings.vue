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
            <picker :range="cities" @change="onCityChange" :value="cityIndex">
              <view class="picker-box">
                <text class="picker-value">{{ settings.defaultCity || '未设置' }}</text>
                <text class="picker-arrow">▾</text>
              </view>
            </picker>
          </view>
          <view class="setting-row">
            <text class="setting-label">地图默认范围</text>
            <picker :range="mapRanges" @change="onMapRangeChange" :value="mapRangeIndex">
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
            <view class="theme-option" :class="{ 'theme-option--active': settings.theme === 'dark' }" @tap="onThemeChange('dark')">
              <view class="theme-preview theme-preview--dark">
                <view class="theme-preview__card" />
              </view>
              <text class="theme-option__label">深色</text>
            </view>
            <view class="theme-option" :class="{ 'theme-option--active': settings.theme === 'light' }" @tap="onThemeChange('light')">
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
            <switch :checked="settings.countdownWarning" color="#FF6B35" @change="onToggle('countdownWarning', $event)" />
          </view>
          <view class="setting-row" v-if="settings.countdownWarning">
            <text class="setting-label">提前提醒时间</text>
            <picker :range="countdownOptions" @change="onCountdownChange" :value="countdownIndex">
              <view class="picker-box">
                <text class="picker-value">{{ settings.countdownWarningMinutes }} 分钟</text>
                <text class="picker-arrow">▾</text>
              </view>
            </picker>
          </view>
          <view class="setting-row">
            <text class="setting-label">长按输入精确数量</text>
            <switch :checked="settings.longPressInput" color="#FF6B35" @change="onToggle('longPressInput', $event)" />
          </view>
        </view>
      </view>
    </view>

    <!-- AI 生图 (高级设置) -->
    <view class="section">
      <view class="section-header section-header--collapsible" @tap="showAI = !showAI">
        <view class="header-left">
          <view class="eyebrow">
            <text class="eyebrow-text">AI 生图</text>
          </view>
          <text class="section-subtitle">高级设置</text>
        </view>
        <text class="collapse-icon">{{ showAI ? '▾' : '▸' }}</text>
      </view>
      <view v-show="showAI" class="section-shell">
        <view class="section-core">
          <view class="setting-row setting-row--input">
            <text class="setting-label">AI 服务地址</text>
            <view class="setting-input-wrap">
              <input
                class="setting-input"
                :value="settings.aiServiceUrl"
                placeholder="https://..."
                placeholder-class="input-placeholder"
                @blur="onInput('aiServiceUrl', $event)"
                aria-label="AI 服务地址"
              />
            </view>
          </view>
          <view class="setting-row setting-row--input">
            <text class="setting-label">AI API Key</text>
            <view class="setting-input-wrap">
              <input
                class="setting-input"
                :value="settings.aiApiKey"
                :password="true"
                placeholder="sk-..."
                placeholder-class="input-placeholder"
                @blur="onInput('aiApiKey', $event)"
                aria-label="AI API Key"
              />
            </view>
          </view>
          <view class="setting-row setting-row--input">
            <text class="setting-label">AI 模型 ID</text>
            <view class="setting-input-wrap">
              <input
                class="setting-input"
                :value="settings.aiModel"
                placeholder="gpt-4o-mini"
                placeholder-class="input-placeholder"
                @blur="onInput('aiModel', $event)"
                aria-label="AI 模型 ID"
              />
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
          <view class="setting-row setting-row--nav" @tap="goToBackup">
            <text class="setting-label">数据备份</text>
            <view class="arrow-wrap">
              <text class="nav-arrow">›</text>
            </view>
          </view>
          <view class="setting-row setting-row--nav" @tap="handleClear">
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
import { settingsStore } from '@/store/settings-store.js'
import { applyPageTheme, syncThemeFromStorage, applyNavBarColor } from '@/utils/apply-page-theme.js'
import NavBar from '@/components/nav-bar.vue'

const cities = [
  '全国', '北京', '上海', '天津', '重庆', '广州', '深圳', '东莞', '佛山', '珠海',
  '杭州', '宁波', '温州', '嘉兴', '南京', '苏州', '无锡', '常州', '南通', '徐州',
  '济南', '青岛', '烟台', '潍坊', '成都', '绵阳', '武汉', '宜昌', '襄阳', '长沙',
  '岳阳', '郑州', '洛阳', '石家庄', '唐山', '福州', '厦门', '合肥', '芜湖', '沈阳',
  '大连', '南昌', '赣州', '西安', '咸阳', '南宁', '昆明', '贵阳', '太原', '哈尔滨',
  '长春', '兰州', '呼和浩特', '乌鲁木齐', '海口', '拉萨'
]
const mapRanges = ['城市', '区域', '全国']

const countdownOptions = ['10', '20', '30']
const showAI = ref(false)

const settings = reactive({
  defaultCity: '',
  mapRange: '城市',
  countdownWarning: true,
  countdownWarningMinutes: 5,
  longPressInput: true,
  aiServiceUrl: '',
  aiApiKey: '',
  aiModel: 'gpt-4o-mini',
  theme: 'dark'
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

function onInput(key, e) {
  const val = e.detail.value
  settings[key] = val
  save(key, val)
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
}

/* ── Section ── */
.section {
  margin-bottom: $section-gap;
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

/* ── Section Card (Double-Bezel) ── */
.section-shell {
  background: linear-gradient(165deg, var(--c-surface-8, $glass-white-8) 0%, var(--c-surface-3, $glass-white-3) 100%);
  border: 1rpx solid var(--c-surface-12, $glass-white-12);
  border-radius: $radius-2xl;
  box-shadow: var(--c-shadow-xl, $shadow-xl), var(--c-shadow-inner, $shadow-inner);
  backdrop-filter: blur(12rpx);
  -webkit-backdrop-filter: blur(12rpx);
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
