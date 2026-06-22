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

    <!-- Welcome Banner (inline, replaces popup) -->
    <view v-if="showWelcome" class="welcome-banner" role="region" aria-label="欢迎引导">
      <view class="welcome-banner__header">
        <text class="welcome-banner__emoji" aria-hidden="true">🍽️</text>
        <view class="welcome-banner__text">
          <text class="welcome-banner__title">欢迎来到大胃王！</text>
          <text class="welcome-banner__desc">三步开始你的挑战之旅</text>
        </view>
        <view class="welcome-banner__close" role="button" aria-label="关闭" @tap="dismissWelcome">
          <text class="welcome-banner__close-icon">✕</text>
        </view>
      </view>
      <view class="welcome-banner__steps">
        <view class="welcome-step">
          <text class="welcome-step-num">1</text>
          <text class="welcome-step-text">添加店铺</text>
        </view>
        <text class="welcome-step-arrow">→</text>
        <view class="welcome-step">
          <text class="welcome-step-num">2</text>
          <text class="welcome-step-text">记录菜品</text>
        </view>
        <text class="welcome-step-arrow">→</text>
        <view class="welcome-step">
          <text class="welcome-step-num">3</text>
          <text class="welcome-step-text">查看评分</text>
        </view>
      </view>
      <view class="welcome-banner__actions">
        <view class="welcome-banner__btn" role="button" aria-label="去添加店铺" @tap="goToShops">
          <text class="welcome-banner__btn-text">去添加店铺</text>
        </view>
      </view>
    </view>

    <!-- Empty state -->
    <EmptyState
      v-if="stats.totalRecords === 0 && !showWelcome"
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
            <view class="city-picker" role="button" aria-label="选择城市" @tap="toggleCityPicker">
              <text class="city-picker__icon" aria-hidden="true">📍</text>
              <text class="city-picker__text">{{ selectedCity }}</text>
              <text class="city-picker__arrow">{{ showCityPicker ? '▴' : '▾' }}</text>
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

      <!-- Inline City Picker (expandable) -->
      <view v-if="showCityPicker" class="inline-picker">
        <view class="inline-picker__search">
          <input class="inline-picker__input" placeholder="搜索城市..." aria-label="搜索城市" placeholder-class="inline-picker__placeholder" :value="cityKeyword" @input="onCitySearch" />
        </view>
        <view v-if="!cityKeyword" class="inline-picker__hot">
          <view v-for="city in hotCities" :key="city" class="inline-picker__chip" role="button" :aria-label="'选择' + city" :class="{ 'inline-picker__chip--active': city === selectedCity }" @tap="onSelectCity(city)">
            <text class="inline-picker__chip-text">{{ city }}</text>
          </view>
        </view>
        <scroll-view scroll-y class="inline-picker__list">
          <view v-for="city in displayedCities" :key="city" class="inline-picker__item" role="button" :aria-label="'选择' + city" :class="{ 'inline-picker__item--active': city === selectedCity }" @tap="onSelectCity(city)">
            <text class="inline-picker__item-text">{{ city }}</text>
          </view>
        </scroll-view>
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

function toggleCityPicker() {
  showCityPicker.value = !showCityPicker.value
  if (!showCityPicker.value) cityKeyword.value = ''
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

import { CITIES, HOT_CITIES } from '@/constants/cities.js'

const hotCities = HOT_CITIES
const allCities = CITIES.filter(c => c !== '其他')

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

let _parallaxRaf = null
onPageScroll((e) => {
  if (_parallaxRaf) return
  _parallaxRaf = requestAnimationFrame(() => {
    const scrollY = e.scrollTop
    parallaxY1.value = scrollY * 0.3
    parallaxY2.value = scrollY * 0.5
    _parallaxRaf = null
  })
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
  animation: orbFloat1 15s $ease-in-out-smooth 3;
}

.ambient-orb--2 {
  width: 550rpx;
  height: 550rpx;
  bottom: 200rpx;
  left: -180rpx;
  border-radius: 55% 45% 50% 50% / 45% 55% 45% 55%;
  background: radial-gradient(ellipse at 70% 70%, rgba(139, 92, 246, 0.08) 0%, rgba(52, 211, 153, 0.04) 40%, transparent 70%);
  animation: orbFloat2 12s $ease-in-out-smooth 3;
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
    filter: blur(3rpx);
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
  animation: floatSlow 6s $ease-in-out-smooth 3;
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

/* ── Inline City Picker (expandable) ── */
.inline-picker {
  margin-top: 16rpx;
  background: var(--c-surface-3, $glass-white-3);
  border: 1rpx solid var(--c-hairline, $hairline);
  border-radius: $radius-2xl;
  padding: 20rpx;
  animation: fadeInUp $dur-fast $ease-out-expo;
}

.inline-picker__search {
  margin-bottom: 16rpx;
}

.inline-picker__input {
  width: 100%;
  background: var(--c-surface-4, $glass-white-4);
  border: 1rpx solid var(--c-hairline, $hairline);
  border-radius: $radius-lg;
  padding: 20rpx 24rpx;
  font-size: var(--text-body-size, $type-body-size);
  color: var(--c-text-primary, $text-primary);
  box-sizing: border-box;
}

.inline-picker__placeholder {
  color: var(--c-text-muted, $text-muted);
}

.inline-picker__hot {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.inline-picker__chip {
  padding: 16rpx 24rpx;
  border-radius: $radius-pill;
  background: var(--c-surface-4, $glass-white-4);
  border: 1rpx solid var(--c-hairline, $hairline);
  transition: background $dur-fast $ease-spring, border-color $dur-fast $ease-spring;
}

.inline-picker__chip--active {
  background: var(--c-accent-soft, $glow-orange-soft);
  border-color: rgba(255, 107, 53, 0.30);
}

.inline-picker__chip-text {
  font-size: var(--text-label-size, $type-label-size);
  font-weight: var(--text-label-weight, $type-label-weight);
  color: var(--c-text-tertiary, $text-tertiary);
}

.inline-picker__chip--active .inline-picker__chip-text {
  color: var(--c-accent, $accent-orange);
  font-weight: 600;
}

.inline-picker__list {
  max-height: 300rpx;
}

.inline-picker__item {
  padding: 18rpx 8rpx;
  border-bottom: 1rpx solid var(--c-border-subtle, $hairline-subtle);
}

.inline-picker__item--active .inline-picker__item-text {
  color: var(--c-accent, $accent-orange);
  font-weight: 600;
}

.inline-picker__item-text {
  font-size: var(--text-body-size, $type-body-size);
  font-weight: var(--text-body-weight, $type-body-weight);
  color: var(--c-text-primary, $text-primary);
}

/* ── Welcome Banner (inline) ── */
.welcome-banner {
  background: linear-gradient(135deg, var(--c-surface-6, $glass-white-6) 0%, var(--c-surface-3, $glass-white-3) 100%);
  border: 1rpx solid var(--c-accent-glow);
  border-radius: $radius-2xl;
  padding: $card-pad-inner;
  margin: 0 $page-pad-x;
  animation: fadeInUp $dur-slow $ease-out-expo 0.2s both;
}

.welcome-banner__header {
  display: flex;
  align-items: center;
  gap: $intra-group;
  margin-bottom: $intra-group;
}

.welcome-banner__emoji {
  font-size: 48rpx;
  flex-shrink: 0;
}

.welcome-banner__text {
  flex: 1;
}

.welcome-banner__title {
  font-size: var(--text-headline-size, $type-headline-size);
  font-weight: var(--text-headline-weight, $type-headline-weight);
  line-height: var(--text-headline-lh, $type-headline-lh);
  color: var(--c-text-primary, $text-primary);
  display: block;
}

.welcome-banner__desc {
  font-size: var(--text-label-size, $type-label-size);
  color: var(--c-text-tertiary, $text-tertiary);
  margin-top: 4rpx;
  display: block;
}

.welcome-banner__close {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--c-surface-4, $glass-white-4);
  flex-shrink: 0;
  transition: background $dur-fast $ease-spring;
}

.welcome-banner__close:active {
  background: var(--c-surface-8, $glass-white-8);
}

.welcome-banner__close-icon {
  font-size: 24rpx;
  color: var(--c-text-muted, $text-muted);
}

.welcome-banner__steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  margin-bottom: $intra-group;
}

.welcome-step {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 10rpx 18rpx;
  background: var(--c-surface-4, $glass-white-4);
  border-radius: $radius-lg;
}

.welcome-step-num {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  background: var(--c-accent, $accent-orange);
  color: var(--c-text-on-accent, #FFFFFF);
  font-size: 20rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.welcome-step-text {
  font-size: var(--text-label-size, $type-label-size);
  font-weight: var(--text-label-weight, $type-label-weight);
  color: var(--c-text-secondary, $text-secondary);
}

.welcome-step-arrow {
  font-size: 20rpx;
  color: var(--c-text-ghost, $text-ghost);
}

.welcome-banner__actions {
  display: flex;
}

.welcome-banner__btn {
  flex: 1;
  padding: 20rpx;
  border-radius: $radius-xl;
  background: linear-gradient(135deg, var(--c-accent, $accent-orange), var(--c-accent-light, $accent-orange-light));
  box-shadow: $shadow-glow-orange;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform $dur-fast $ease-spring;
}

.welcome-banner__btn:active {
  transform: scale(0.97);
}

.welcome-banner__btn-text {
  font-size: var(--text-title-size, $type-title-size);
  font-weight: var(--text-title-weight, $type-title-weight);
  color: var(--c-text-on-accent, #FFFFFF);
}

</style>
