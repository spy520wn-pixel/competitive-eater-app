<template>
  <view class="page" :data-theme="currentTheme">
    <nav-bar title="选择店铺" :show-back="true" />
    <!-- Search bar — Glass -->
    <SearchBar
      v-model="keyword"
      placeholder="搜索店铺..."
      aria-label="搜索店铺"
    />

    <!-- Shop list -->
    <scroll-view
      scroll-y
      class="shop-list"
      v-if="filteredShops.length > 0"
      :scroll-anchoring="true"
      :enable-back-to-top="true"
    >
      <view
        v-for="(shop, index) in filteredShops"
        :key="shop.id"
        class="shop-card-shell"
        :class="getShopTier(shop.id)"
        role="button"
        :aria-label="shop.name"
        :style="{ animationDelay: index * 60 + 'ms' }"
        @tap="onSelectShop(shop)"
      >
        <view class="shop-card-core">
          <view class="shop-card__icon" :class="getShopTier(shop.id) ? 'shop-card__icon--' + getShopTier(shop.id) : ''">
            <text class="icon-text">{{ getCategoryIcon(shop.category) }}</text>
          </view>
          <view class="shop-card__info">
            <view class="shop-card__name-row">
              <text class="shop-card__name">{{ shop.name }}</text>
              <text v-if="isRecentShop(shop.id)" class="shop-card__hot">🔥</text>
            </view>
            <text class="shop-card__meta">
              {{ shop.category }} · 时限 {{ shop.mealTimeLimit }}分钟
            </text>
            <view class="shop-card__stats" v-if="getShopBest(shop.id)">
              <text class="shop-card__best">最高 {{ getShopBest(shop.id) }}</text>
              <text class="shop-card__dot">·</text>
              <text class="shop-card__count">{{ getShopCount(shop.id) }} 次</text>
            </view>
          </view>
          <view class="arrow-wrap">
            <text class="shop-card__arrow">›</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- Empty state -->
    <EmptyState
      v-else
      icon="🏪"
      title="还没有店铺"
      description="先添加一家自助餐店铺，才能开始挑战"
      action-text="去添加店铺"
      hint="支持高德地图搜索或手动添加"
      @action="goToMine"
    />

    <!-- Tier picker -->
    <TierPicker
      v-model:visible="showTierPicker"
      :tiers="currentTiers"
      :selected-id="selectedTierId"
      @select="onTierSelected"
    />

    <!-- Confirm dialog -->
    <view v-if="showConfirm" class="confirm-mask" @tap="showConfirm = false">
      <view class="confirm-dialog" @tap.stop role="dialog" aria-modal="true">
        <view class="confirm-glow" />
        <view class="confirm-content">
          <text class="confirm-title">开始挑战？</text>
          <text class="confirm-shop">{{ confirmShopName }}</text>
          <text class="confirm-tier" v-if="confirmTierName">{{ confirmTierName }}</text>
          <view class="diners-picker">
            <text class="diners-label">就餐人数</text>
            <view class="diners-control">
              <view class="diners-btn" role="button" aria-label="减少就餐人数" :class="{ 'diners-btn--disabled': diners <= 1 }" @tap="onDinersChange(-1)">
                <text class="diners-btn-text">-</text>
              </view>
              <text class="diners-value">{{ diners }}</text>
              <view class="diners-btn" role="button" aria-label="增加就餐人数" @tap="onDinersChange(1)">
                <text class="diners-btn-text">+</text>
              </view>
            </view>
          </view>
          <text class="confirm-hint" v-if="diners > 1">积分将均分给 {{ diners }} 人</text>
          <text class="confirm-hint" v-else>准备好了吗，大胃王？</text>
          <view class="confirm-actions">
            <view class="confirm-btn confirm-btn--cancel" role="button" aria-label="取消" @tap="showConfirm = false">
              <text class="confirm-btn-text">取消</text>
            </view>
            <view class="confirm-btn confirm-btn--go" role="button" aria-label="开始挑战" @tap="startChallenge">
              <text class="confirm-btn-text confirm-btn-text--go">开战！</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import NavBar from '@/components/nav-bar.vue'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { shopStore } from '../../store/shop-store'
import { recordStore } from '../../store/record-store'
import { getShopTier as getShopTierByCount, isRecent, getCategoryIcon } from '@/utils/shop-utils.js'
import TierPicker from '../../components/tier-picker.vue'
import EmptyState from '@/components/empty-state.vue'
import SearchBar from '@/components/search-bar.vue'
import { settingsStore, currentTheme } from '@/store/settings-store.js'
import { applyPageTheme, syncThemeFromStorage } from '@/utils/apply-page-theme.js'

const keyword = ref('')
const shops = ref([])
const showTierPicker = ref(false)
const currentTiers = ref([])
const selectedTierId = ref('')
const pendingShop = ref(null)
const showConfirm = ref(false)
const confirmShopName = ref('')
const confirmTierName = ref('')
const diners = ref(1)

function getShopBest(shopId) {
  const best = recordStore.getBestByShop(shopId)
  return best ? best.score : null
}

function getShopCount(shopId) {
  return recordStore.getByShopId(shopId).filter(r => r.status === '已完成').length
}

function getShopTier(shopId) {
  return getShopTierByCount(getShopCount(shopId))
}

function isRecentShop(shopId) {
  const records = recordStore.getByShopId(shopId).filter(r => r.status === '已完成')
  if (records.length === 0) return false
  return isRecent(records[0].createdAt)
}


const filteredShops = computed(() => {
  if (!keyword.value) return shops.value
  const kw = keyword.value.toLowerCase()
  return shops.value.filter(s =>
    s.name.toLowerCase().includes(kw) ||
    s.category.toLowerCase().includes(kw) ||
    (s.city && s.city.toLowerCase().includes(kw))
  )
})

function loadShops() {
  shops.value = shopStore.getAll()
}

function onSelectShop(shop) {
  if (shop.hasTiers && shop.tiers.length > 0) {
    pendingShop.value = shop
    currentTiers.value = shop.tiers
    selectedTierId.value = ''
    showTierPicker.value = true
  } else {
    pendingShop.value = shop
    confirmShopName.value = shop.name
    confirmTierName.value = ''
    showConfirm.value = true
  }
}

function onTierSelected(tier) {
  selectedTierId.value = tier.id
  confirmShopName.value = pendingShop.value.name
  confirmTierName.value = tier.name
  showConfirm.value = true
}

function onDinersChange(delta) {
  const newVal = diners.value + delta
  if (newVal >= 1 && newVal <= 10) {
    diners.value = newVal
    // 触觉反馈
    // #ifdef APP-PLUS
    uni.vibrateShort({ type: 'light' })
    // #endif
  }
}

function startChallenge() {
  showConfirm.value = false
  const shop = pendingShop.value
  if (!shop) return

  const tierId = selectedTierId.value || ''
  const tierName = confirmTierName.value || ''

  const record = recordStore.create({
    shopId: shop.id,
    shopName: shop.name,
    tierId,
    tierName,
    diners: diners.value
  })

  diners.value = 1
  uni.navigateTo({
    url: `/pages/challenge/cooking?recordId=${record.id}`
  })
}

function goToMine() {
  uni.switchTab({ url: '/pages/mine/index' })
}

onMounted(() => {
  applyPageTheme(settingsStore.get().theme)
  uni.$on('theme-apply', applyPageTheme)
})

onUnmounted(() => {
  uni.$off('theme-apply', applyPageTheme)
})

onShow(() => {
  loadShops()
  syncThemeFromStorage()
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--c-bg, $void-black);
  padding: $page-pad-y $page-pad-x;
  padding-bottom: $page-pad-bottom;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

/* ── Search Bar ── */
.search-bar {
  display: flex;
  align-items: center;
  background: var(--c-surface-3, $glass-white-3);
  border: 1rpx solid var(--c-surface-5, $glass-white-5);
  border-radius: $radius-lg;
  padding: 22rpx 28rpx;
  position: relative;
  z-index: 1;
  letter-spacing: $tracking-wide;
  animation: fadeInUp $dur-slow $ease-out-expo both;
}

.search-icon {
  font-size: 28rpx;
  margin-right: $intra-group;
  opacity: 0.5;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: var(--c-text-primary, $text-primary);
  background: transparent;
  border: none;
  padding: 0;
  height: 100%;
}

.search-placeholder {
  color: var(--c-text-muted, $text-muted);
}

/* ── Shop List ── */
.shop-list {
  height: calc(100vh - 240rpx);
  position: relative;
  z-index: 1;
}

/* ── Shop Card (tactile) ── */
.shop-card-shell {
  background: var(--c-surface-1, $surface-1);
  border: 1rpx solid var(--c-border, $hairline);
  border-radius: $radius-xl;
  box-shadow: 0 2rpx 12rpx var(--c-shadow-md);
  margin-bottom: $intra-group;
  animation: fadeInUp $dur-normal $ease-out-expo both;
  transition: transform $dur-fast $ease-spring, box-shadow $dur-fast ease;
  overflow: hidden;
}

.shop-card-shell:active {
  transform: scale(0.98);
  box-shadow: 0 1rpx 4rpx var(--c-shadow-sm);
}

.shop-card-core {
  display: flex;
  align-items: center;
  padding: $card-pad-inner $card-pad-compact;
}

.shop-card__icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: $radius-lg;
  background: var(--c-surface-4, $glass-white-4);
  border: 1rpx solid var(--c-surface-4, $glass-white-4);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: $intra-group;
  flex-shrink: 0;
}

.icon-text {
  font-size: 36rpx;
}

.shop-card__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $intra-tight;
}

.shop-card__name {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--c-text-primary, $text-primary);
  letter-spacing: $tracking-normal;
}

.shop-card__meta {
  font-size: 24rpx;
  color: var(--c-text-tertiary, $text-tertiary);
  letter-spacing: $tracking-wide;
}

.shop-card__name-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.shop-card__hot {
  font-size: 24rpx;
}

.shop-card__stats {
  display: flex;
  align-items: center;
  gap: $intra-tight;
  margin-top: 4rpx;
}

.shop-card__best {
  font-size: 22rpx;
  font-weight: 600;
  color: var(--c-accent, $accent-orange);
  letter-spacing: $tracking-wide;
}

.shop-card__dot {
  font-size: 22rpx;
  color: var(--c-text-ghost, $text-ghost);
}

.shop-card__count {
  font-size: 22rpx;
  color: var(--c-text-muted, $text-muted);
  letter-spacing: $tracking-wide;
}

/* ── Shop Tiers (visual weight by usage) ── */
.shop-tier--bronze .shop-card__icon {
  background: var(--c-tier-bronze-soft);
  border-color: var(--c-tier-bronze-border);
  animation: badgePop 0.5s $ease-out-expo both;
}

.shop-tier--silver .shop-card__icon {
  background: var(--c-tier-silver-soft);
  border-color: var(--c-tier-silver-border);
  animation: badgePop 0.5s $ease-out-expo 0.1s both;
}

.shop-tier--gold {
  border-color: var(--c-gold-soft) !important;
}

.shop-tier--gold .shop-card__icon {
  background: var(--c-gold-soft);
  border-color: var(--c-gold-glow-strong);
  box-shadow: 0 0 16rpx var(--c-glow-gold);
  animation: badgePop 0.6s $ease-out-expo 0.15s both;
}

.shop-card__hot {
  animation: badgePop 0.4s $ease-out-expo 0.2s both;
}

.arrow-wrap {
  width: 48rpx;
  height: 48rpx;
  border-radius: $radius-pill;
  background: var(--c-surface-3, $glass-white-3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.shop-card__arrow {
  font-size: 28rpx;
  color: var(--c-text-muted, $text-muted);
  font-weight: 300;
}

/* ── Empty State ── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
  position: relative;
  z-index: 1;
  animation: fadeInUp $dur-entrance $ease-out-expo 0.2s both;
}

.empty-plate {
  width: 140rpx;
  height: 140rpx;
  border-radius: $radius-pill;
  background: var(--c-surface-3, $glass-white-3);
  border: 1rpx solid var(--c-hairline, $hairline);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $intra-group;
}

.empty-icon {
  font-size: 56rpx;
}

.empty-title {
  font-size: 34rpx;
  font-weight: 700;
  color: var(--c-text-primary, $text-primary);
  letter-spacing: $tracking-normal;
  margin-bottom: $intra-tight;
}

.empty-desc {
  font-size: 26rpx;
  color: var(--c-text-tertiary, $text-tertiary);
  margin-bottom: $section-gap;
}

.empty-btn {
  background: linear-gradient(135deg, var(--c-accent, $accent-orange), var(--c-accent-light, $accent-orange-light));
  border-radius: $radius-pill;
  padding: 24rpx 64rpx;
  box-shadow: $shadow-glow-orange-strong;
  transition: transform $dur-normal $ease-spring;
}

.empty-btn:active {
  transform: scale(0.96);
}

.empty-btn-text {
  font-size: 28rpx;
  color: var(--c-text-on-accent, #FFFFFF);
  font-weight: 600;
  letter-spacing: $tracking-wide;
}

/* ── Confirm Dialog ── */
.confirm-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--c-overlay, $glass-black-60);
  backdrop-filter: blur(12rpx);
  -webkit-backdrop-filter: blur(12rpx);
  display: flex;
  align-items: center;
  animation: fadeIn $dur-fast $ease-in-out-smooth;
  justify-content: center;
  z-index: 999;
  animation: fadeIn $dur-fast $ease-out-expo;
}

.confirm-dialog {
  width: 90vw;
  max-width: 620rpx;
  background: var(--c-surface-1, $surface-1);
  border-radius: $radius-2xl;
  overflow: hidden;
  border: 1rpx solid var(--c-hairline, $hairline);
  position: relative;
  animation: scaleIn $dur-normal $ease-out-expo;
}

.confirm-glow {
  position: absolute;
  top: -50rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 300rpx;
  height: 150rpx;
  border-radius: $radius-pill;
  background: radial-gradient(ellipse, var(--c-gold-soft, $glow-gold-soft) 0%, transparent 70%);
  pointer-events: none;
}

.confirm-content {
  padding: $section-gap 36rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}

.confirm-title {
  font-size: 40rpx;
  font-weight: 800;
  color: var(--c-gold, $accent-gold);
  letter-spacing: $tracking-wide;
  margin-bottom: $intra-group;
}

.confirm-shop {
  font-size: 34rpx;
  color: var(--c-text-primary, $text-primary);
  font-weight: 600;
  margin-bottom: $intra-tight;
}

.confirm-tier {
  font-size: 26rpx;
  color: var(--c-accent, $accent-orange);
  margin-bottom: $intra-group;
}

.diners-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 20rpx 0;
  margin-bottom: $intra-group;
}

.diners-label {
  font-size: 28rpx;
  color: var(--c-text-secondary, $text-secondary);
}

.diners-control {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.diners-btn {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: var(--c-surface-8, $glass-white-8);
  border: 1rpx solid var(--c-surface-12, $glass-white-12);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform $dur-fast $ease-spring, background $dur-fast $ease-spring;
}

.diners-btn:active {
  transform: scale(0.9);
  background: var(--c-surface-12, $glass-white-12);
}

.diners-btn--disabled {
  opacity: 0.3;
}

.diners-btn-text {
  font-size: 36rpx;
  color: var(--c-text-primary, $text-primary);
  font-weight: 600;
}

.diners-value {
  font-size: 40rpx;
  font-weight: 800;
  color: var(--c-gold, $accent-gold);
  min-width: 48rpx;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.confirm-hint {
  font-size: 26rpx;
  color: var(--c-text-tertiary, $text-tertiary);
  margin-bottom: $section-gap;
}

.confirm-actions {
  display: flex;
  gap: $inter-group;
  width: 100%;
}

.confirm-btn {
  flex: 1;
  height: 88rpx;
  border-radius: $radius-lg;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform $dur-normal $ease-spring;
}

.confirm-btn:active {
  transform: scale(0.96);
}

.confirm-btn--cancel {
  background: var(--c-surface-4, $glass-white-4);
  border: 1rpx solid var(--c-hairline, $hairline);
}

.confirm-btn--go {
  background: linear-gradient(135deg, var(--c-accent, $accent-orange), var(--c-accent-light, $accent-orange-light));
  box-shadow: $shadow-glow-orange;
}

.confirm-btn-text {
  font-size: 30rpx;
  color: var(--c-text-secondary, $text-secondary);
  font-weight: 600;
  letter-spacing: $tracking-wide;
}

.confirm-btn-text--go {
  color: var(--c-text-on-accent, #FFFFFF);
}
</style>
