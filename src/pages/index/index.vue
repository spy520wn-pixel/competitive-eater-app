<template>
  <view class="dashboard" :data-theme="currentTheme">
    <nav-bar title="大胃王" :show-back="false" />
    <!-- Ambient glow orbs (parallax) -->
    <view class="ambient-orb ambient-orb--1" :style="{ transform: 'translateY(' + parallaxY1 + 'rpx)' }" />
    <view class="ambient-orb ambient-orb--2" :style="{ transform: 'translateY(' + parallaxY2 + 'rpx)' }" />

    <!-- Header (slight counter-parallax for depth) -->
    <view class="header" :style="{ transform: 'translateY(' + (-parallaxY1 * 0.15) + 'rpx)' }">
      <view class="header-top">
        <level-badge :exp="stats.totalExp" size="lg" :show-exp="true" layout="horizontal" />
      </view>

      <!-- Stats — Hero Score + Supporting -->
      <view class="stats-shell">
        <view class="stats-core">
          <view class="stat-hero" style="animation-delay: 0.1s">
            <text class="stat-hero-label">最高战斗力</text>
            <text class="stat-hero-value">{{ stats.maxScore }}</text>
          </view>
          <view class="stat-supporting">
            <view class="stat-item" style="animation-delay: 0.2s">
              <text class="stat-value">{{ stats.totalRecords }}</text>
              <text class="stat-label">总挑战</text>
            </view>
            <view class="stat-divider" />
            <view class="stat-item" style="animation-delay: 0.3s">
              <text class="stat-value">{{ stats.shopCount }}</text>
              <text class="stat-label">已挑战店铺</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- Empty state -->
    <EmptyState
      v-if="stats.totalRecords === 0"
      icon="🍽️"
      title="空空如也"
      description="去挑战一家自助餐，开始你的大胃王之路"
      action-text="开始挑战"
      hint="第一次挑战总是最难忘的"
      @action="goChallenge"
    />

    <!-- Charts & Map -->
    <view v-else class="content">
      <!-- Dual Charts Row -->
      <view class="dual-charts">
        <!-- Radar chart — Double-Bezel -->
        <view class="card-shell card-shell--half">
          <view class="card-core card-core--compact">
            <view class="card-header">
              <text class="card-title">食量分布</text>
            </view>
            <radar-chart :data="stats.categoryTotals" :theme="currentTheme" />
          </view>
        </view>

        <!-- Bar chart — Double-Bezel -->
        <view class="card-shell card-shell--half">
          <view class="card-core card-core--compact">
            <view class="card-header">
              <text class="card-title">分类食量排行</text>
            </view>
            <bar-chart :data="stats.categoryTotals" />
          </view>
        </view>
      </view>

      <!-- Map — Double-Bezel -->
      <view class="card-shell">
        <view class="card-core">
          <view class="card-header card-header--map">
            <view>
              <text class="card-title">挑战足迹</text>
            </view>
            <view class="city-picker" @tap="showCityPicker = true">
              <text class="city-picker__icon">📍</text>
              <text class="city-picker__text">{{ selectedCity }}</text>
              <text class="city-picker__arrow">▾</text>
            </view>
          </view>
          <map-view
            :shops="shops"
            :records="records"
            :city="selectedCity"
            @marker-tap="onMarkerTap"
            @city-change="onCityChange"
          />
        </view>
      </view>
    </view>
  </view>

  <!-- City picker popup -->
  <view v-if="showCityPicker" class="picker-mask" @tap="showCityPicker = false">
    <view class="picker-popup" @tap.stop>
      <view class="picker-header">
        <text class="picker-title">{{ isFirstTimeCity ? '欢迎！请选择你的城市' : '选择城市' }}</text>
        <view class="picker-close" @tap="showCityPicker = false">
          <text class="picker-close-text">✕</text>
        </view>
      </view>
      <view class="picker-search">
        <view class="picker-search-wrap">
          <input class="picker-search-input" placeholder="搜索城市..." placeholder-class="picker-search-placeholder" :value="cityKeyword" @input="onCitySearch" />
        </view>
      </view>
      <view v-if="!cityKeyword" class="picker-section">
        <text class="picker-section-title">热门城市</text>
        <view class="picker-grid">
          <view v-for="city in hotCities" :key="city" class="picker-grid-item" :class="{ 'picker-grid-item--active': city === selectedCity }" @tap="onSelectCity(city)">
            <text class="picker-grid-text">{{ city }}</text>
          </view>
        </view>
      </view>
      <scroll-view scroll-y class="picker-list">
        <view v-for="city in displayedCities" :key="city" class="picker-list-item" :class="{ 'picker-list-item--active': city === selectedCity }" @tap="onSelectCity(city)">
          <text class="picker-list-text">{{ city }}</text>
        </view>
      </scroll-view>
    </view>
  </view>

  <!-- Welcome Dialog (outside city picker) -->
  <view v-if="showWelcome" class="welcome-mask">
    <view class="welcome-dialog">
      <view class="welcome-header">
        <text class="welcome-emoji">🍽️</text>
        <text class="welcome-title">欢迎来到大胃王！</text>
      </view>
      <view class="welcome-body">
        <view class="welcome-step">
          <text class="welcome-step-icon">1️⃣</text>
          <text class="welcome-step-text">先添加一家自助餐店铺</text>
        </view>
        <view class="welcome-step">
          <text class="welcome-step-icon">2️⃣</text>
          <text class="welcome-step-text">记录你吃了什么</text>
        </view>
        <view class="welcome-step">
          <text class="welcome-step-icon">3️⃣</text>
          <text class="welcome-step-text">看看你的战斗力评分</text>
        </view>
      </view>
      <view class="welcome-actions">
        <view class="welcome-btn welcome-btn--primary" @tap="goToShops">
          <text class="welcome-btn-text">去添加店铺</text>
        </view>
        <view class="welcome-btn welcome-btn--secondary" @tap="dismissWelcome">
          <text class="welcome-btn-text welcome-btn-text--secondary">先看看</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import NavBar from '@/components/nav-bar.vue'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onShow, onPageScroll } from '@dcloudio/uni-app'
import { recordStore } from '../../store/record-store'
import { shopStore } from '../../store/shop-store'
import { settingsStore, currentTheme } from '../../store/settings-store'
import { applyPageTheme, syncThemeFromStorage } from '@/utils/apply-page-theme.js'
import LevelBadge from '../../components/level-badge.vue'
import RadarChart from '../../components/radar-chart.vue'
import BarChart from '../../components/bar-chart.vue'
import MapView from '../../components/map-view.vue'
import EmptyState from '@/components/empty-state.vue'

const stats = ref({ totalRecords: 0, maxScore: 0, totalExp: 0, shopCount: 0, categoryTotals: {} })
const shops = ref([])
const records = ref([])
const selectedCity = ref('北京')
const showCityPicker = ref(false)
const isFirstTimeCity = ref(false)
const cityKeyword = ref('')
const showWelcome = ref(false)

function onCityChange(city) {
  selectedCity.value = city
}

function onCitySearch(e) {
  cityKeyword.value = e.detail.value
}

function onSelectCity(city) {
  selectedCity.value = city
  showCityPicker.value = false
  cityKeyword.value = ''

  if (isFirstTimeCity.value) {
    settingsStore.update({ defaultCity: city })
    isFirstTimeCity.value = false
  }
}

const hotCities = ['北京', '上海', '广州', '深圳', '成都', '杭州', '武汉', '重庆', '西安', '南京', '长沙']

const allCities = [
  '全国', '北京', '上海', '天津', '重庆', '广州', '深圳', '东莞', '佛山', '珠海',
  '杭州', '宁波', '温州', '嘉兴', '南京', '苏州', '无锡', '常州', '南通', '徐州',
  '济南', '青岛', '烟台', '潍坊', '成都', '绵阳', '武汉', '宜昌', '襄阳', '长沙',
  '岳阳', '郑州', '洛阳', '石家庄', '唐山', '福州', '厦门', '合肥', '芜湖', '沈阳',
  '大连', '南昌', '赣州', '西安', '咸阳', '南宁', '昆明', '贵阳', '太原', '哈尔滨',
  '长春', '兰州', '呼和浩特', '乌鲁木齐', '海口', '拉萨'
]

const displayedCities = computed(() => {
  if (!cityKeyword.value) return allCities.filter(c => c !== selectedCity.value)
  const kw = cityKeyword.value.toLowerCase()
  return allCities.filter(c => c.toLowerCase().includes(kw))
})

const challengedShops = computed(() => {
  const shopIds = new Set(records.value.filter(r => r.status === '已完成').map(r => r.shopId))
  return shops.value.filter(s => shopIds.has(s.id))
})

function loadData() {
  stats.value = recordStore.getStats()
  shops.value = shopStore.getAll()
  records.value = recordStore.getAll()

  // 读取用户配置的默认城市
  const settings = settingsStore.get()
  if (settings.defaultCity) {
    selectedCity.value = settings.defaultCity
  } else {
    // 首次使用，引导选择城市
    isFirstTimeCity.value = true
    showCityPicker.value = true
  }
}

function handleThemeChange(theme) {
  currentTheme.value = theme || 'dark'
  applyPageTheme(theme)
}

// Parallax scroll
const parallaxY1 = ref(0)
const parallaxY2 = ref(0)

onPageScroll((e) => {
  const scrollY = e.scrollTop
  parallaxY1.value = scrollY * 0.3
  parallaxY2.value = scrollY * 0.5
})

onMounted(() => {
  const theme = settingsStore.get().theme || 'dark'
  currentTheme.value = theme
  applyPageTheme(theme)
  uni.$on('theme-apply', handleThemeChange)
})

onUnmounted(() => {
  uni.$off('theme-apply', handleThemeChange)
})

onShow(() => {
  loadData()
  syncThemeFromStorage()
  currentTheme.value = settingsStore.get().theme || 'dark'

  // 首次使用引导
  const hasSeenWelcome = uni.getStorageSync('hasSeenWelcome')
  if (!hasSeenWelcome) {
    setTimeout(() => {
      showWelcome.value = true
    }, 500)
  }
})

function onMarkerTap(shopId) {
  uni.navigateTo({ url: `/pages/record/shop-records?shopId=${shopId}` })
}

function goChallenge() {
  uni.switchTab({ url: '/pages/challenge/select' })
}

function dismissWelcome() {
  showWelcome.value = false
  uni.setStorageSync('hasSeenWelcome', true)
}

function goToShops() {
  showWelcome.value = false
  uni.setStorageSync('hasSeenWelcome', true)
  uni.switchTab({ url: '/pages/mine/index' })
}
</script>

<style lang="scss" scoped>
.dashboard {
  min-height: 100vh;
  background: var(--c-bg, $void-black);
  padding-bottom: $page-pad-bottom;
  position: relative;
  overflow: hidden;
}

/* ── Ambient Glow Orbs (organic mesh) ── */
.ambient-orb {
  position: absolute;
  pointer-events: none;
  z-index: 0;
  contain: layout style paint;
}

.ambient-orb--1 {
  width: 700rpx;
  height: 700rpx;
  top: -250rpx;
  right: -250rpx;
  border-radius: 40% 60% 55% 45% / 50% 40% 60% 50%;
  background: radial-gradient(ellipse at 30% 30%, rgba(255, 107, 53, 0.12) 0%, rgba(139, 92, 246, 0.04) 40%, transparent 70%);
  animation: orbFloat1 15s $ease-in-out-smooth infinite;
}

.ambient-orb--2 {
  width: 550rpx;
  height: 550rpx;
  bottom: 200rpx;
  left: -180rpx;
  border-radius: 55% 45% 50% 50% / 45% 55% 45% 55%;
  background: radial-gradient(ellipse at 70% 70%, rgba(139, 92, 246, 0.08) 0%, rgba(52, 211, 153, 0.04) 40%, transparent 70%);
  animation: orbFloat2 12s $ease-in-out-smooth infinite;
}

@keyframes orbFloat1 {
  0%, 100% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(5deg) scale(1.06); }
}

@keyframes orbFloat2 {
  0%, 100% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(-4deg) scale(1.04); }
}

/* ── Header ── */
.header {
  position: relative;
  z-index: 1;
  padding: 56rpx $page-pad-x 40rpx;
  background: linear-gradient(180deg, var(--c-bg-elevated, $abyss) 0%, var(--c-bg, $void-black) 100%);
}

.header-top {
  margin-bottom: 36rpx;
  animation: fadeInUp $dur-entrance $ease-out-expo both;
}

/* ── Stats Bar (Double-Bezel, heavier treatment) ── */
.stats-shell {
  background: linear-gradient(165deg, var(--c-surface-10, $glass-white-10) 0%, var(--c-surface-4, $glass-white-4) 100%);
  border: 1rpx solid var(--c-surface-15, $glass-white-15);
  border-radius: $radius-2xl;
  box-shadow: var(--c-shadow-xl, $shadow-xl), var(--c-shadow-inner, $shadow-inner), 0 0 40rpx rgba(255, 107, 53, 0.06);
  backdrop-filter: blur(16rpx);
  -webkit-backdrop-filter: blur(16rpx);
  animation: fadeInUp $dur-slow $ease-out-expo 0.1s both;
  overflow: hidden;
}

.stats-core {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $card-pad-inner;
  gap: $intra-group;
}

.stat-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $intra-tight;
  animation: fadeInUp $dur-slow $ease-out-expo both;
}

.stat-hero-label {
  font-size: var(--text-label-size, $type-label-size);
  font-weight: var(--text-label-weight, $type-label-weight);
  line-height: var(--text-label-lh, $type-label-lh);
  color: var(--c-text-tertiary, $text-tertiary);
  letter-spacing: $tracking-ultra-wide;
  text-transform: uppercase;
}

.stat-hero-value {
  font-size: 80rpx;
  font-weight: 900;
  color: var(--c-gold, $accent-gold);
  line-height: 1;
  font-variant-numeric: tabular-nums;
  letter-spacing: $tracking-tighter;
  text-shadow: 0 0 30rpx var(--c-gold-glow-strong, $glow-gold-strong);
  animation: heroNumberReveal 0.8s $ease-out-expo 0.3s both;
}

@keyframes heroNumberReveal {
  0% {
    opacity: 0;
    transform: scale(0.7) translateY(16rpx);
    filter: blur(6rpx);
  }
  50% {
    opacity: 1;
    transform: scale(1.04) translateY(-4rpx);
    filter: blur(0);
  }
  100% {
    transform: scale(1) translateY(0);
  }
}

.stat-supporting {
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 100%;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $intra-tight;
  animation: fadeInUp $dur-slow $ease-out-expo both;
}

.stat-value {
  font-size: var(--text-display-size, $type-display-size);
  font-weight: var(--text-display-weight, $type-display-weight);
  line-height: var(--text-display-lh, $type-display-lh);
  color: var(--c-accent, $accent-orange);
  font-variant-numeric: tabular-nums;
  letter-spacing: var(--text-display-ls, $type-display-ls);
}

.stat-label {
  font-size: var(--text-label-size, $type-label-size);
  font-weight: var(--text-label-weight, $type-label-weight);
  line-height: var(--text-label-lh, $type-label-lh);
  color: var(--c-text-tertiary, $text-tertiary);
  letter-spacing: var(--text-label-ls, $type-label-ls);
}

.stat-divider {
  width: 1rpx;
  height: 52rpx;
  background: linear-gradient(180deg, transparent, var(--c-surface-6, $glass-white-6), transparent);
}

/* ── Empty State ── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $space-16 60rpx;
  position: relative;
  z-index: 1;
  animation: fadeInUp $dur-entrance $ease-out-expo 0.2s both;
}

.empty-plate {
  width: 180rpx;
  height: 180rpx;
  border-radius: 50%;
  background: var(--c-surface-3, $glass-white-3);
  border: 1rpx solid var(--c-hairline, $hairline);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $intra-group;
  animation: floatSlow 6s $ease-in-out-smooth infinite;
  box-shadow: var(--c-shadow-lg, $shadow-lg), var(--c-shadow-inner, $shadow-inner);
}

.empty-icon {
  font-size: 80rpx;
}

.empty-title {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--c-text-primary, $text-primary);
  margin-bottom: $intra-tight;
  letter-spacing: $tracking-normal;
}

.empty-desc {
  font-size: 26rpx;
  color: var(--c-text-tertiary, $text-tertiary);
  text-align: center;
  margin-bottom: $section-gap;
  letter-spacing: $tracking-normal;
}

.empty-cta {
  background: linear-gradient(135deg, var(--c-accent, $accent-orange), var(--c-accent-light, $accent-orange-light));
  border-radius: $radius-pill;
  padding: 28rpx 72rpx;
  box-shadow: $shadow-glow-orange-strong;
  transition: transform $dur-normal $ease-spring, box-shadow $dur-normal $ease-spring;
}

.empty-cta:active {
  transform: scale(0.95);
  box-shadow: $shadow-glow-orange;
}

.empty-cta-text {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--c-text-on-accent, #FFFFFF);
  letter-spacing: $tracking-wide;
}

/* ── Content Cards ── */
.content {
  padding: 0 $page-pad-x;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 36rpx;
}

/* ── Dual Charts Row ── */
.dual-charts {
  display: flex;
  gap: 20rpx;
  animation: fadeInUp $dur-slow $ease-out-expo 0.12s both;
}

.card-shell--half {
  flex: 1;
  margin-bottom: 0;
  min-width: 0;
}

.card-core--compact {
  padding: $card-pad-compact;
}

/* ── Half cards: compact styling ── */
.card-shell--half .card-core {
  padding: 16rpx 20rpx;
}
.card-shell--half .card-header {
  margin-bottom: 4rpx;
}
.card-shell--half .card-title {
  font-size: 28rpx;
}

/* ── Chart Cards (lighter glass treatment) ── */
.card-shell {
  background: linear-gradient(165deg, var(--c-surface-6, $glass-white-6) 0%, var(--c-surface-2, $glass-white-2) 100%);
  border: 1rpx solid var(--c-surface-8, $glass-white-8);
  border-radius: $radius-2xl;
  box-shadow: var(--c-shadow-lg, $shadow-lg), var(--c-shadow-inner, $shadow-inner);
  backdrop-filter: blur(8rpx);
  -webkit-backdrop-filter: blur(8rpx);
  animation: fadeInUp $dur-slow $ease-out-expo both;
  overflow: hidden;
}

.card-shell:nth-child(1) { animation-delay: 0.22s; }
.card-shell:nth-child(2) { animation-delay: 0.32s; }

.card-core {
  padding: $card-pad-inner;
}


.card-header {
  margin-bottom: $intra-group;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  background: var(--c-accent-soft, $glow-orange-soft);
  border-radius: $radius-pill;
  padding: 8rpx 22rpx;
  margin-bottom: $intra-tight;
}

.eyebrow-text {
  font-size: var(--text-caption-size, $type-caption-size);
  font-weight: var(--text-label-weight, $type-label-weight);
  line-height: var(--text-caption-lh, $type-caption-lh);
  color: var(--c-accent, $accent-orange);
  letter-spacing: $tracking-ultra-wide;
  text-transform: uppercase;
}

.card-title {
  font-size: var(--text-headline-size, $type-headline-size);
  font-weight: var(--text-headline-weight, $type-headline-weight);
  line-height: var(--text-headline-lh, $type-headline-lh);
  color: var(--c-text-primary, $text-primary);
  letter-spacing: var(--text-headline-ls, $type-headline-ls);
}

/* ── Map Header with City Picker ── */
.card-header--map {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.city-picker {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 22rpx;
  background: var(--c-surface-4, $glass-white-4);
  border: 1rpx solid var(--c-hairline, $hairline);
  border-radius: $radius-pill;
  flex-shrink: 0;
  transition: background $dur-fast $ease-spring, border-color $dur-fast $ease-spring;
}

.city-picker:active {
  background: var(--c-surface-8, $glass-white-8);
  border-color: var(--c-border-active, $hairline-active);
}

.city-picker__icon { font-size: var(--text-label-size, $type-label-size); }
.city-picker__text { font-size: var(--text-label-size, $type-label-size); font-weight: var(--text-label-weight, $type-label-weight); color: var(--c-text-primary, $text-primary); }
.city-picker__arrow { font-size: var(--text-caption-size, $type-caption-size); color: var(--c-text-muted, $text-muted); }

/* ── City Picker Popup ── */
.picker-mask {
  position: fixed;
  inset: 0;
  background: var(--c-overlay, $glass-black-60);
  backdrop-filter: blur(12rpx);
  -webkit-backdrop-filter: blur(12rpx);
  z-index: $z-modal;
  display: flex;
  align-items: flex-end;
  animation: fadeIn $dur-fast $ease-out-expo;
}

.picker-popup {
  width: 100%;
  max-height: 75vh;
  background: var(--c-surface-1, $surface-1);
  border-radius: $radius-3xl $radius-3xl 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideInBottom $dur-normal $ease-out-expo;
  box-shadow: var(--c-shadow-2xl, $shadow-2xl);
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 36rpx 18rpx;
}

.picker-title { font-size: var(--text-headline-size, $type-headline-size); font-weight: var(--text-headline-weight, $type-headline-weight); line-height: var(--text-headline-lh, $type-headline-lh); color: var(--c-text-primary, $text-primary); letter-spacing: var(--text-headline-ls, $type-headline-ls); }

.picker-close {
  width: 52rpx;
  height: 52rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--c-surface-4, $glass-white-4);
  transition: background $dur-fast $ease-spring;
}
.picker-close:active { background: var(--c-surface-8, $glass-white-8); }
.picker-close-text { font-size: 28rpx; color: var(--c-text-muted, $text-muted); }

.picker-search { padding: 0 36rpx 18rpx; }

.picker-search-wrap {
  width: 100%;
  background: var(--c-surface-4, $glass-white-4);
  border: 1rpx solid var(--c-hairline, $hairline);
  border-radius: $radius-lg;
  padding: 24rpx 28rpx;
  box-sizing: border-box;
  min-height: 92rpx;
  display: flex;
  align-items: center;
}

.picker-search-input {
  width: 100%;
  height: 100%;
  font-size: var(--text-body-size, $type-body-size);
  font-weight: var(--text-body-weight, $type-body-weight);
  color: var(--c-text-primary, $text-primary);
  background: transparent;
  border: none;
  padding: 0;
}

.picker-search-placeholder {
  color: var(--c-text-muted, $text-muted);
}

.picker-section { padding: 0 36rpx 18rpx; }
.picker-section-title { font-size: var(--text-label-size, $type-label-size); font-weight: var(--text-label-weight, $type-label-weight); line-height: var(--text-label-lh, $type-label-lh); color: var(--c-text-muted, $text-muted); margin-bottom: 14rpx; display: block; letter-spacing: var(--text-label-ls, $type-label-ls); }

.picker-grid { display: flex; flex-wrap: wrap; gap: 14rpx; }

.picker-grid-item {
  padding: 12rpx 26rpx;
  border-radius: $radius-pill;
  background: var(--c-surface-4, $glass-white-4);
  border: 1rpx solid var(--c-hairline, $hairline);
  transition: background $dur-fast $ease-spring, border-color $dur-fast $ease-spring;
}

.picker-grid-item--active {
  background: var(--c-accent-soft, $glow-orange-soft);
  border-color: rgba(255, 107, 53, 0.30);
}

.picker-grid-text { font-size: var(--text-label-size, $type-label-size); font-weight: var(--text-label-weight, $type-label-weight); color: var(--c-text-tertiary, $text-tertiary); }
.picker-grid-item--active .picker-grid-text { color: var(--c-accent, $accent-orange); font-weight: 600; }

.picker-list { flex: 1; max-height: 45vh; padding: 0 36rpx; }

.picker-list-item {
  padding: 24rpx 0;
  border-bottom: 1rpx solid var(--c-border-subtle, $hairline-subtle);
}

.picker-list-item--active .picker-list-text { color: var(--c-accent, $accent-orange); font-weight: 600; }
.picker-list-text { font-size: var(--text-body-size, $type-body-size); font-weight: var(--text-body-weight, $type-body-weight); color: var(--c-text-primary, $text-primary); }

/* ── Welcome Dialog ── */
.welcome-mask {
  position: fixed;
  inset: 0;
  background: var(--c-overlay, $glass-black-60);
  backdrop-filter: blur(12rpx);
  -webkit-backdrop-filter: blur(12rpx);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: $z-modal;
  animation: fadeIn $dur-fast $ease-in-out-smooth;
}

.welcome-dialog {
  width: 85vw;
  max-width: 680rpx;
  background: var(--c-bg-elevated, $abyss);
  border: 1rpx solid var(--c-border, $hairline);
  border-radius: $radius-3xl;
  box-shadow: var(--c-card-shadow-elevated);
  overflow: hidden;
  animation: scaleIn $dur-normal $ease-out-expo;
}

.welcome-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $section-gap $card-pad-inner $intra-group;
  gap: $intra-group;
}

.welcome-emoji {
  font-size: 96rpx;
}

.welcome-title {
  font-size: var(--text-headline-size, $type-headline-size);
  font-weight: var(--text-headline-weight, $type-headline-weight);
  line-height: var(--text-headline-lh, $type-headline-lh);
  color: var(--c-text-primary, $text-primary);
  letter-spacing: var(--text-headline-ls, $type-headline-ls);
}

.welcome-body {
  padding: 0 $card-pad-inner $section-gap;
  display: flex;
  flex-direction: column;
  gap: $intra-group;
}

.welcome-step {
  display: flex;
  align-items: center;
  gap: $intra-group;
  padding: $intra-group;
  background: var(--c-surface-3, $glass-white-3);
  border-radius: $radius-xl;
}

.welcome-step-icon {
  font-size: 36rpx;
}

.welcome-step-text {
  font-size: var(--text-body-size, $type-body-size);
  font-weight: var(--text-body-weight, $type-body-weight);
  line-height: var(--text-body-lh, $type-body-lh);
  color: var(--c-text-secondary, $text-secondary);
}

.welcome-actions {
  display: flex;
  flex-direction: column;
  gap: $intra-group;
  padding: $card-pad-inner;
  border-top: 1rpx solid var(--c-border-subtle, $hairline-subtle);
}

.welcome-btn {
  padding: 24rpx;
  border-radius: $radius-xl;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform $dur-fast $ease-spring;
}

.welcome-btn:active {
  transform: scale(0.97);
}

.welcome-btn--primary {
  background: linear-gradient(135deg, var(--c-accent, $accent-orange), var(--c-accent-light, $accent-orange-light));
  box-shadow: $shadow-glow-orange;
}

.welcome-btn--secondary {
  background: var(--c-surface-4, $glass-white-4);
  border: 1rpx solid var(--c-hairline, $hairline);
}

.welcome-btn-text {
  font-size: var(--text-title-size, $type-title-size);
  font-weight: var(--text-title-weight, $type-title-weight);
  line-height: var(--text-title-lh, $type-title-lh);
  color: var(--c-text-on-accent, #FFFFFF);
}

.welcome-btn-text--secondary {
  color: var(--c-text-secondary, $text-secondary);
}

</style>
